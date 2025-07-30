import { UseMutateFunction } from '@tanstack/react-query';

export type UseVerifyOtpReturn = {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  errors: { otp?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ otp?: string }>>;
  verifyOtp: UseMutateFunction<
    any,
    any,
    { email: string; otp: string },
    unknown
  >;
  isLoading: boolean;
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleOtpChange: (index: number, value: string) => void;
  handleOtpKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  handleOtpSubmit: () => void;
};

// POST REACTION
export interface Reaction {
  id: string;
  userId: string;
  postId: string;
  commentId: string | null;
  type: 'LIKE' | string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// REACTION SUMMARY (for a post)
export interface ReactionSummary {
  type: string;
  count: number;
}

export interface ReactionInfo {
  count: number;
  summary: ReactionSummary[];
}

// TAG
export interface Tag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

// SIMPLE USER (for Post/Comment)
export interface UserSummary {
  id: string;
  email: string;
  username: string;
}

// COMMENT (as in get post by id)
export interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: UserSummary;
  _count?: { childComment: number }; // present in "by id" but not "all"
}

export interface PostCommentList {
  id: string;
  content: string;
  createdAt: string;
  user: UserSummary;
  childComment: number; // for "get all posts" (childComment)
}

// POST ITEM (all/list)
export interface PostListItem {
  id: string;
  title: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  user: UserSummary;
  tags: Tag[];
  image: unknown[]; // adjust if you have image model
  reactions: Reaction[];
  comments: PostCommentList[];
  reaction: ReactionInfo;
  totalComment: number;
}

// POST ITEM (by id)
export interface PostById {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  image: unknown[]; // adjust as above
  user: UserSummary;
  tags: Tag[];
  comments: (PostComment & { _count: { childComment: number } })[];
  reactions: Reaction[];
  reaction: ReactionInfo;
  totalComment: number;
}

// PAGINATED META
export interface PaginatedMeta {
  page: number;
  limit: number;
  totalItem: number;
  totalPage: number;
}

export interface PostImageResponse {
  url: string;
  public_id: string;
  resource_type: string;
  fileType: string;
  fileName: string;
}
export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
  meta?: any;
  timestamp: string;
}

export interface NotificationResponse {
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

export interface ApiResponseMeta<T = any, M = any> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
  meta: M;
  timestamp: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalItem: number;
  totalPage: number;
}
