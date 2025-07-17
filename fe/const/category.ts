import { Post } from "@/types/post";

export const CATEGORIES = [
  { value: "programming", label: "💻 Lập trình", emoji: "💻" },
  { value: "cooking", label: "🍳 Nấu ăn", emoji: "🍳" },
  { value: "travel", label: "✈️ Du lịch", emoji: "✈️" },
  { value: "sports", label: "⚽ Thể thao", emoji: "⚽" },
  { value: "music", label: "🎵 Âm nhạc", emoji: "🎵" },
  { value: "movies", label: "🎬 Phim ảnh", emoji: "🎬" },
  { value: "books", label: "📚 Sách", emoji: "📚" },
  { value: "technology", label: "🔧 Công nghệ", emoji: "🔧" },
  { value: "lifestyle", label: "🌟 Lifestyle", emoji: "🌟" },
  { value: "health", label: "💪 Sức khỏe", emoji: "💪" },
]

export const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  programming: { label: "Lập trình", emoji: "💻", color: "blue-500" },
  cooking: { label: "Nấu ăn", emoji: "🍳", color: "orange-500" },
  travel: { label: "Du lịch", emoji: "✈️", color: "emerald-500" },
  sports: { label: "Thể thao", emoji: "⚽", color: "red-500" },
  music: { label: "Âm nhạc", emoji: "🎵", color: "purple-500" },
  movies: { label: "Phim ảnh", emoji: "🎬", color: "pink-500" },
  books: { label: "Sách", emoji: "📚", color: "amber-500" },
  technology: { label: "Công nghệ", emoji: "🔧", color: "slate-500" },
  lifestyle: { label: "Lifestyle", emoji: "🌟", color: "indigo-500" },
  health: { label: "Sức khỏe", emoji: "💪", color: "green-500" },
}

export const FILTER_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "programming", label: "💻 Lập trình" },
  { value: "cooking", label: "🍳 Nấu ăn" },
  { value: "travel", label: "✈️ Du lịch" },
  { value: "sports", label: "⚽ Thể thao" },
  { value: "music", label: "🎵 Âm nhạc" },
  { value: "movies", label: "🎬 Phim ảnh" },
  { value: "books", label: "📚 Sách" },
  { value: "technology", label: "🔧 Công nghệ" },
]

export const generateMockPosts = (): Post[] => {
  return [
    {
      id: "1",
      title: "Welcome to Social Blog! 🎉",
      content:
        "This is my first post on this amazing platform. Looking forward to connecting with everyone and sharing interesting content! Let's build an amazing community together. 🚀✨",
      authorId: "1",
      status: "PUBLISHED",
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T10:00:00Z"),
      deletedAt: null,
      author: {
        id: "1",
        username: "johndoe",
        profile: {
          firstName: "John",
          lastName: "Doe",
          avatarUrl: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
      },
      images: [
        {
          id: "1",
          url: "https://images.pexels.com/photos/27167243/pexels-photo-27167243.jpeg?auto=compress&cs=tinysrgb&w=800",
          altText: "Welcome celebration image",
          caption: "Welcome to our amazing platform! 🎊",
          width: 800,
          height: 600,
          fileSize: 150000,
          mimeType: "image/jpeg",
          uploadedBy: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      tags: [
        { id: "1", name: "welcome", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "2", name: "introduction", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "3", name: "community", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ],
      categories: [{ id: "1", name: "programming", createdAt: new Date(), updatedAt: new Date(), deletedAt: null }],
      reactions: [
        {
          id: "1",
          userId: "2",
          type: "LIKE",
          createdAt: new Date(),
          deletedAt: null,
          user: {
            username: "janedoe",
            profile: {
              firstName: "Jane",
              lastName: "Doe",
              avatarUrl:
                "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
        },
        {
          id: "2",
          userId: "3",
          type: "LOVE",
          createdAt: new Date(),
          deletedAt: null,
          user: {
            username: "mikejohnson",
            profile: {
              firstName: "Mike",
              lastName: "Johnson",
              avatarUrl:
                "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
        },
      ],
      comments: [
        {
          id: "1",
          content: "Welcome to the platform! Great to have you here. Looking forward to your future posts! 🎉",
          authorId: "2",
          postId: "1",
          parentId: null,
          createdAt: new Date("2024-01-15T11:00:00Z"),
          updatedAt: new Date("2024-01-15T11:00:00Z"),
          deletedAt: null,
          author: {
            username: "janedoe",
            profile: {
              firstName: "Jane",
              lastName: "Doe",
              avatarUrl:
                "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
          replies: [],
          reactions: [],
        },
      ],
      _count: {
        reactions: 2,
        comments: 1,
      },
    },
    {
      id: "2",
      title: "Beautiful Sunset Timelapse 🌅",
      content:
        "Caught this amazing sunset on my evening walk. Nature never fails to amaze me! The colors were absolutely breathtaking. Sometimes you just need to stop and appreciate the beauty around us. 🌅✨",
      authorId: "2",
      status: "PUBLISHED",
      createdAt: new Date("2024-01-14T18:30:00Z"),
      updatedAt: new Date("2024-01-14T18:30:00Z"),
      deletedAt: null,
      author: {
        id: "2",
        username: "janedoe",
        profile: {
          firstName: "Jane",
          lastName: "Doe",
          avatarUrl: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
      },
      images: [
        {
          id: "2",
          url: "https://videos.pexels.com/video-files/855128/855128-hd_1280_720_24fps.mp4",
          altText: "Beautiful sunset timelapse",
          caption: "Sunset timelapse from my evening walk 🌅",
          width: 1280,
          height: 720,
          fileSize: 5000000,
          mimeType: "video/mp4",
          uploadedBy: "2",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      tags: [
        { id: "3", name: "nature", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "4", name: "sunset", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "5", name: "timelapse", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "6", name: "photography", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ],
      categories: [{ id: "2", name: "travel", createdAt: new Date(), updatedAt: new Date(), deletedAt: null }],
      reactions: [
        {
          id: "3",
          userId: "1",
          type: "LOVE",
          createdAt: new Date(),
          deletedAt: null,
          user: {
            username: "johndoe",
            profile: {
              firstName: "John",
              lastName: "Doe",
              avatarUrl:
                "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
        },
      ],
      comments: [
        {
          id: "2",
          content: "Absolutely stunning! The colors are incredible. Thanks for sharing this beautiful moment! 😍",
          authorId: "1",
          postId: "2",
          parentId: null,
          createdAt: new Date("2024-01-14T19:00:00Z"),
          updatedAt: new Date("2024-01-14T19:00:00Z"),
          deletedAt: null,
          author: {
            username: "johndoe",
            profile: {
              firstName: "John",
              lastName: "Doe",
              avatarUrl:
                "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
          replies: [],
          reactions: [],
        },
      ],
      _count: {
        reactions: 1,
        comments: 1,
      },
    },
    {
      id: "3",
      title: "Coffee & Code ☕️",
      content:
        "Starting my day with some fresh coffee and coding. There's something magical about the morning routine - the quiet focus, the warm cup in your hands, and the endless possibilities of what you can create. What's your favorite way to start the day?",
      authorId: "3",
      status: "PUBLISHED",
      createdAt: new Date("2024-01-13T08:15:00Z"),
      updatedAt: new Date("2024-01-13T08:15:00Z"),
      deletedAt: null,
      author: {
        id: "3",
        username: "mikejohnson",
        profile: {
          firstName: "Mike",
          lastName: "Johnson",
          avatarUrl:
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
        },
      },
      images: [
        {
          id: "3",
          url: "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800",
          altText: "Coffee and laptop setup",
          caption: "Perfect morning setup ☕️💻",
          width: 800,
          height: 600,
          fileSize: 180000,
          mimeType: "image/jpeg",
          uploadedBy: "3",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      tags: [
        { id: "7", name: "coffee", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "8", name: "coding", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "9", name: "morning", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        { id: "10", name: "productivity", createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      ],
      categories: [{ id: "3", name: "lifestyle", createdAt: new Date(), updatedAt: new Date(), deletedAt: null }],
      reactions: [
        {
          id: "4",
          userId: "1",
          type: "LIKE",
          createdAt: new Date(),
          deletedAt: null,
          user: {
            username: "johndoe",
            profile: {
              firstName: "John",
              lastName: "Doe",
              avatarUrl:
                "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
        },
        {
          id: "5",
          userId: "2",
          type: "LOVE",
          createdAt: new Date(),
          deletedAt: null,
          user: {
            username: "janedoe",
            profile: {
              firstName: "Jane",
              lastName: "Doe",
              avatarUrl:
                "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
        },
      ],
      comments: [
        {
          id: "3",
          content: "I love this setup! Coffee is definitely essential for productive coding sessions. ☕️👨‍💻",
          authorId: "2",
          postId: "3",
          parentId: null,
          createdAt: new Date("2024-01-13T09:00:00Z"),
          updatedAt: new Date("2024-01-13T09:00:00Z"),
          deletedAt: null,
          author: {
            username: "janedoe",
            profile: {
              firstName: "Jane",
              lastName: "Doe",
              avatarUrl:
                "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
            },
          },
          replies: [
            {
              id: "4",
              content: "Absolutely! What's your favorite coffee blend?",
              authorId: "3",
              postId: "3",
              parentId: "3",
              createdAt: new Date("2024-01-13T09:15:00Z"),
              updatedAt: new Date("2024-01-13T09:15:00Z"),
              deletedAt: null,
              author: {
                username: "mikejohnson",
                profile: {
                  firstName: "Mike",
                  lastName: "Johnson",
                  avatarUrl:
                    "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
                },
              },
              replies: [],
              reactions: [],
            },
          ],
          reactions: [],
        },
      ],
      _count: {
        reactions: 2,
        comments: 2,
      },
    },
  ]
}