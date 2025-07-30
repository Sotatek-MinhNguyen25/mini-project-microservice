export interface Notification {
  id: string;
  receiverId: string;
  senderId: string;
  postId: string;
  commentId: string | null;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type NotificationType = 'Comment' | 'Reaction';

export interface NotificationSummary {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationPreferences {
  enableInApp: boolean;
  mutedTypes: NotificationType[];
  autoMarkRead: boolean;
}
