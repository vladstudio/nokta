import { atom } from 'jotai';
import type { Call } from '../types';

export const activeCallAtom = atom<Call | null>(null);
export const showCallViewAtom = atom<boolean>(false);
export const isCallMinimizedAtom = atom<boolean>(false);
export const inCallAtom = atom(
  (get) => get(activeCallAtom) !== null && get(showCallViewAtom)
);
