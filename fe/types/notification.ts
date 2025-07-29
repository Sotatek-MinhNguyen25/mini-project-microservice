export interface BaseNotification {
  id: string;
  userId: string;
  createdAt: string;
  isRead: boolean;
  type: NotificationType;
  content: string;
  postId: string;
}

export type NotificationType = 'Comment' | 'Reaction';

export interface CommentNotification extends BaseNotification {
  type: 'Comment';
  message: string;
  from: any;
  to: string;
  postId: string;
}
export interface ReactionNotification extends BaseNotification {
  type: 'Reaction';
  message: string;
  from: any;
  to: string;
  postId: string;
  reactionType: string;
}

export type Notification = ReactionNotification | CommentNotification;

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
