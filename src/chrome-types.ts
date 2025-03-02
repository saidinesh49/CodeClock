import { Difficulty } from './types';

export interface TimerMessage {
  type: 'START_TIMER' | 'END_TIMER' | 'GET_TIMER_STATE' | 'SHOW_TIMER_OVERLAY' | 'HIDE_TIMER_OVERLAY';
  difficulty?: Difficulty;
  windowId?: number;
  tabId?: number;
}

export interface TimerState {
  isActive: boolean;
  startTime?: number;
  difficulty?: Difficulty;
  timeMs?: number;
  error?: string;
}

export interface StorageData {
  results: Array<{
    difficulty: Difficulty;
    timeMs: number;
    platform: string;
    timestamp: number;
  }>;
}

declare global {
  namespace chrome.runtime {
    interface MessageSender extends chrome.runtime.MessageSender {}
  }
}
