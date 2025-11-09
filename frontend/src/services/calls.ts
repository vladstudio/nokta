import { pb } from './pocketbase';
import { dailyAPI } from './daily';
import type { Call, CallInvite } from '../types';
import type { RecordSubscription } from 'pocketbase';

export const callsAPI = {
  async create(spaceId: string, inviteeIds: string[]): Promise<{ call: Call; invites: CallInvite[] }> {
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) throw new Error('User not authenticated');

    const roomName = `talk-${spaceId}-${Date.now()}`;
    const dailyRoom = await dailyAPI.createRoom(roomName);

    const now = new Date().toISOString();

    // Create call with only the creator as participant
    const call = await pb.collection('calls').create<Call>({
      space: spaceId,
      daily_room_url: dailyRoom.url,
      daily_room_name: dailyRoom.name,
      participants: [currentUserId],
      last_activity: now
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
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) throw new Error('User not authenticated');

    const invite = await pb.collection('call_invites').getOne<CallInvite>(inviteId, {
      expand: 'call'
    });

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
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) throw new Error('User not authenticated');

    const call = await pb.collection('calls').getOne<Call>(callId);
    const remainingParticipants = call.participants.filter(id => id !== currentUserId);

    if (remainingParticipants.length === 0) {
      // Last person leaving - delete the call (invites cascade delete automatically)
      await pb.collection('calls').delete(callId);

      // Delete Daily.co room (non-blocking)
      try {
        await dailyAPI.deleteRoom(call.daily_room_name);
      } catch (error) {
        console.error('Failed to delete Daily.co room:', error);
      }
    } else {
      // Remove current user from participants
      await pb.collection('calls').update(callId, { participants: remainingParticipants });
    }
  },

  async getMyInvites(spaceId: string): Promise<CallInvite[]> {
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) throw new Error('User not authenticated');

    // Get all invites for current user
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
    if (!currentUserId) throw new Error('User not authenticated');

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
