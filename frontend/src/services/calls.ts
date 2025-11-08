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

    // Add user to call participants
    const call = await pb.collection('calls').getOne<Call>(invite.call);
    const updatedCall = await pb.collection('calls').update<Call>(invite.call, {
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
    const call = await pb.collection('calls').getOne<Call>(callId);
    const currentUserId = pb.authStore.model?.id;
    const remainingParticipants = call.participants.filter(id => id !== currentUserId);

    if (remainingParticipants.length === 0) {
      // Delete all pending invites
      const invites = await pb.collection('call_invites').getFullList<CallInvite>({
        filter: `call = "${callId}"`
      });
      for (const invite of invites) {
        await pb.collection('call_invites').delete(invite.id);
      }
      // Delete call and room
      await dailyAPI.deleteRoom(call.daily_room_name);
      await pb.collection('calls').delete(callId);
    } else {
      await pb.collection('calls').update(callId, { participants: remainingParticipants });
    }
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
