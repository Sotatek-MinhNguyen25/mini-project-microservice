export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
  image: PostImage[];
  tags: TagId[];
  reaction: Reaction;
  comments: Comment[];
  totalComment: number;
}

export interface IReactionType {
  LIKE: 'LIKE';
  LOVE: 'LOVE';
  HAHA: 'HAHA';
  WOW: 'WOW';
  SAD: 'SAD';
  ANGRY: 'ANGRY';
}

export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
}

export interface PostImage {
  id: string;
  altText: string;
  url: string;
}

// Request type for creating a post
export interface CreatePostRequest {
  title: string;
  content: string;
  userId: string;
  postImages?: PostImage[];
  tagIds?: TagId[];
}

// Response type for created post
export interface PostImageResponse {
  id: string;
  url: string;
  altText: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  postId: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PostData {
  title: string;
  content: string;
  userId: string;
  files: File[];
  postImages?: PostImage[];
  tagIds?: TagId[];
}

export interface CreatePostResponseData {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  image: PostImageResponse[];
}

export interface CreatePostResponse {
  status: string;
  statusCode: number;
  message: string;
  data: CreatePostResponseData;
  meta: Record<string, any>;
  timestamp: string;
}

export interface TagId {
  tag: {
    id: string;
    name: string;
  };
}

// export interface Category {
//   id: string
//   name: string
//   createdAt: Date
//   updatedAt: Date
//   deletedAt: Date | null
// }

export interface Reaction {
  summary: {
    type: ReactionType;
    count: number;
  }[];
  count: number;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
  };
  replies: Comment[];
  reactions: Reaction[];
}

export interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export interface PostCardProps {
  post: Post;
}

export interface CompactPostViewProps {
  user: any;
  fullName: string;
  setIsExpanded: (value: boolean) => void;
}

export interface FilePreview {
  file: File;
  url: string;
  type: 'image' | 'video';
}

export interface PostFileUploadProps {
  filePreviews: FilePreview[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
}

export interface PostFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  category: string;
  setCategory: (category: string) => void;
  content: string;
  setContent: (content: string) => void;
}
export interface PostFormHeaderProps {
  fullName: string;
  user: any; // Replace with proper User type from your auth context
  setIsExpanded: (value: boolean) => void;
}

export interface PostTagsInputProps {
  tags: string[];
  currentTag: string;
  setCurrentTag: (tag: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  removeTag: (tag: string) => void;
}

export interface PostCardProps {
  post: Post;
}