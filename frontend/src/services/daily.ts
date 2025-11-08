const DAILY_API_KEY = import.meta.env.VITE_DAILY_CO_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export const dailyAPI = {
  async createRoom(roomName: string) {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public',
        properties: {
          enable_screenshare: true,
          enable_chat: false,
          enable_knocking: false,
          enable_prejoin_ui: false,
          max_participants: 50
        }
      })
    });

    if (!response.ok) throw new Error('Failed to create Daily.co room');
    return await response.json();
  },

  async deleteRoom(roomName: string) {
    await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${DAILY_API_KEY}` }
    });
  }
};
