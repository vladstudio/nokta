import { pb } from './pocketbase';

export const dailyAPI = {
  async createRoom(roomName: string) {
    return await pb.send('/api/daily/rooms', { method: 'POST', body: { name: roomName } });
  },
  async deleteRoom(roomName: string) {
    await pb.send(`/api/daily/rooms/${roomName}`, { method: 'DELETE' });
  }
};
