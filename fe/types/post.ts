export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  author: {
    id: string
    username: string
    profile: {
      firstName: string
      lastName: string
      avatarUrl: string
    }
  }
  images: PostImage[]
  tags: Tag[]
  categories: Category[]
  reactions: Reaction[]
  comments: Comment[]
  _count: {
    reactions: number
    comments: number
  }
}

export interface PostImage {
  id: string
  url: string
  altText: string
  caption: string
  width: number
  height: number
  fileSize: number
  mimeType: string
  uploadedBy: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface Tag {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface Category {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface Reaction {
  id: string
  userId: string
  type: "LIKE" | "LOVE" | "LAUGH" | "ANGRY" | "SAD"
  createdAt: Date
  deletedAt: Date | null
  user: {
    username: string
    profile: {
      firstName: string
      lastName: string
      avatarUrl: string
    }
  }
}

export interface Comment {
  id: string
  content: string
  authorId: string
  postId: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  author: {
    username: string
    profile: {
      firstName: string
      lastName: string
      avatarUrl: string
    }
  }
  replies: Comment[]
  reactions: Reaction[]
}
