import { useCallback } from 'react';
import type { Notification } from '@/types/notification';

export function generateMessageId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
