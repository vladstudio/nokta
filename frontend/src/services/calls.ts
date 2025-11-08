import { pb } from './pocketbase';
import { dailyAPI } from './daily';
import type { Call, CallInvite } from '../types';
import type { RecordSubscription } from 'pocketbase';

export const callsAPI = {
  async create(spaceId: string, inviteeIds: string[]): Promise<{ call: Call; invites: CallInvite[] }> {
    const roomName = `talk-${spaceId}-${Date.now()}`;
    const dailyRoom = await dailyAPI.createRoom(roomName);
    const currentUserId = pb.authStore.model?.id;

    // Create call with only the creator as participant
    const call = await pb.collection('calls').create<Call>({
      space: spaceId,
      daily_room_url: dailyRoom.url,
      daily_room_name: dailyRoom.name,
      participants: [currentUserId]
    });

    // Create invites for other participants
    const invites: CallInvite[] = [];
    for (const inviteeId of inviteeIds) {
      if (inviteeId !== currentUserId) {
        const invite = await pb.collection('call_invites').create<CallInvite>({
          call: call.id,
          inviter: currentUserId,
          invitee: inviteeId
        });
        invites.push(invite);
      }
    }

    return { call, invites };
  },

  async acceptInvite(inviteId: string): Promise<Call> {
    const invite = await pb.collection('call_invites').getOne<CallInvite>(inviteId, {
      expand: 'call'
    });
    const currentUserId = pb.authStore.model?.id;

    // Use the expanded call data
    const call = invite.expand?.call;
    if (!call) {
      throw new Error('Call not found or no longer available');
    }

    // Add user to call participants
    const updatedCall = await pb.collection('calls').update<Call>(call.id, {
      participants: [...call.participants, currentUserId]
    });

    // Delete the invite
    await pb.collection('call_invites').delete(inviteId);

    return updatedCall;
  },

  async declineInvite(inviteId: string) {
    await pb.collection('call_invites').delete(inviteId);
  },

  async leave(callId: string) {
    console.log('[LEAVE] Starting leave for call:', callId);

    const call = await pb.collection('calls').getOne<Call>(callId);
    console.log('[LEAVE] Retrieved call:', call);

    const currentUserId = pb.authStore.model?.id;
    console.log('[LEAVE] Current user ID:', currentUserId);

    const remainingParticipants = call.participants.filter(id => id !== currentUserId);
    console.log('[LEAVE] Remaining participants:', remainingParticipants);

    if (remainingParticipants.length === 0) {
      console.log('[LEAVE] Last person leaving - deleting call');

      // Delete call from PocketBase (invites will cascade delete automatically)
      console.log('[LEAVE] Deleting call from database...');
      try {
        await pb.collection('calls').delete(callId);
        console.log('[LEAVE] Call deleted successfully');
      } catch (error: any) {
        console.error('[LEAVE] Failed to delete call:', error);
        console.error('[LEAVE] Error details:', {
          status: error?.status,
          message: error?.message,
          data: error?.data,
          isAbort: error?.isAbort
        });
        throw error;
      }

      // Delete Daily.co room (non-blocking - don't fail if this errors)
      try {
        console.log('[LEAVE] Deleting Daily.co room:', call.daily_room_name);
        await dailyAPI.deleteRoom(call.daily_room_name);
        console.log('[LEAVE] Daily.co room deleted');
      } catch (error) {
        console.error('[LEAVE] Failed to delete Daily.co room:', error);
      }
    } else {
      console.log('[LEAVE] Updating call participants');
      await pb.collection('calls').update(callId, { participants: remainingParticipants });
      console.log('[LEAVE] Call updated successfully');
    }

    console.log('[LEAVE] Leave completed');
  },

  async getMyInvites(spaceId: string): Promise<CallInvite[]> {
    const currentUserId = pb.authStore.model?.id;
    // Get all invites for current user, then filter by space client-side
    const allInvites = await pb.collection('call_invites').getFullList<CallInvite>({
      filter: `invitee = "${currentUserId}"`,
      expand: 'call,inviter',
      sort: '-created'
    });
    // Filter to only invites for calls in this space
    return allInvites.filter(invite => invite.expand?.call?.space === spaceId);
  },

  async getMyCall(spaceId: string): Promise<Call | null> {
    const currentUserId = pb.authStore.model?.id;
    const calls = await pb.collection('calls').getFullList<Call>({
      filter: `space = "${spaceId}" && participants ?= "${currentUserId}"`,
      sort: '-created'
    });
    return calls[0] || null;
  },

  subscribeToInvites(callback: (data: RecordSubscription<CallInvite>) => void) {
    return pb.collection('call_invites').subscribe('*', callback);
  },

  subscribeToCalls(callback: (data: RecordSubscription<Call>) => void) {
    return pb.collection('calls').subscribe('*', callback);
  }
};
