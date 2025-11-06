import type { Message } from '../types';

export interface PendingMessage {
  id: string;
  chatId: string;
  content: string;
  tempId: string;
  retries: number;
  status: 'pending' | 'sending' | 'failed';
  createdAt: Date;
}

class MessageQueue {
  private queue: PendingMessage[] = [];
  private listeners: Set<(queue: PendingMessage[]) => void> = new Set();
  private processing = false;

  add(chatId: string, content: string): string {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const pending: PendingMessage = {
      id: '',
      chatId,
      content,
      tempId,
      retries: 0,
      status: 'pending',
      createdAt: new Date(),
    };
    this.queue.push(pending);
    this.notifyListeners();
    return tempId;
  }

  updateStatus(tempId: string, status: 'pending' | 'sending' | 'failed', realId?: string) {
    const msg = this.queue.find((m) => m.tempId === tempId);
    if (msg) {
      msg.status = status;
      if (realId) msg.id = realId;
      this.notifyListeners();
    }
  }

  remove(tempId: string) {
    this.queue = this.queue.filter((m) => m.tempId !== tempId);
    this.notifyListeners();
  }

  getForChat(chatId: string): PendingMessage[] {
    return this.queue.filter((m) => m.chatId === chatId);
  }

  incrementRetry(tempId: string) {
    const msg = this.queue.find((m) => m.tempId === tempId);
    if (msg) {
      msg.retries++;
      this.notifyListeners();
    }
  }

  subscribe(listener: (queue: PendingMessage[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.queue]));
  }

  async processQueue(
    sendFn: (chatId: string, content: string) => Promise<Message>,
    isOnline: boolean
  ) {
    if (this.processing || !isOnline || this.queue.length === 0) return;

    this.processing = true;

    const pending = this.queue.filter((m) => m.status === 'pending' || m.status === 'failed');

    for (const msg of pending) {
      if (msg.retries >= 3) continue; // Max retries reached

      try {
        this.updateStatus(msg.tempId, 'sending');
        const result = await sendFn(msg.chatId, msg.content);
        this.updateStatus(msg.tempId, 'pending', result.id);
        this.remove(msg.tempId);
      } catch (error) {
        this.incrementRetry(msg.tempId);
        this.updateStatus(msg.tempId, 'failed');
      }
    }

    this.processing = false;
  }

  getPendingCount(): number {
    return this.queue.length;
  }
}

export const messageQueue = new MessageQueue();
