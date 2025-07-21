export type User = {
  id: string;
  email: string;
  username: string;
  status: 'PENDING' | 'VERIFIED' | 'BANNED'; // hoặc string nếu không chắc enum
  createdAt: string; // hoặc Date nếu bạn parse về dạng Date
  updatedAt: string;
  deletedAt: string | null;
  oauthProvider: string | null;
};
