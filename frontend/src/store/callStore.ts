import { atom } from 'jotai';
import type { Chat } from '../types';

// Active call is now just a Chat with is_active_call=true
export const activeCallChatAtom = atom<Chat | null>(null);
export const showCallViewAtom = atom<boolean>(false);
export const inCallAtom = atom(
  (get) => get(activeCallChatAtom) !== null && get(showCallViewAtom)
);
