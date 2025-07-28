export interface BaseNotification {
  id: string;
  userId: string;
  timestamp: number;
  isRead: boolean;
  type: NotificationType;
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'share'
  | 'friend_request'
  | 'friend_accept'
  | 'mention'
  | 'message'
  | 'post_update'
  | 'birthday'
  | 'event_reminder';

export interface LikeNotification extends BaseNotification {
  type: 'like';
  data: {
    actorName: string;
    actorAvatar?: string;
    postId: string;
    postTitle: string;
    likeCount: number;
  };
}

export interface CommentNotification extends BaseNotification {
  type: 'comment';
  message: string;
  from: any;
  to: string;
  postId: string;
}

export interface FriendRequestNotification extends BaseNotification {
  type: 'friend_request';
  data: {
    actorName: string;
    actorAvatar?: string;
    actorId: string;
    mutualFriends: number;
  };
}

export interface MessageNotification extends BaseNotification {
  type: 'message';
  data: {
    senderName: string;
    senderAvatar?: string;
    senderId: string;
    conversationId: string;
    messagePreview: string;
    unreadCount: number;
  };
}

export interface MentionNotification extends BaseNotification {
  type: 'mention';
  data: {
    actorName: string;
    actorAvatar?: string;
    postId: string;
    postTitle: string;
    mentionText: string;
  };
}

export type Notification =
  | LikeNotification
  | CommentNotification
  | FriendRequestNotification
  | MessageNotification
  | MentionNotification;

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
