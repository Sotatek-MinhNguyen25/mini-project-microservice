export interface AUser {
  id: string;
  email: string;
  username: string;
  password: string | null;
  roles: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  oauthProvider: string | null;
}

// Kiểu dữ liệu meta pagination
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

// Kiểu response của API get users
export interface GetUsersResponse {
  status: string; // "success"
  statusCode: number; // 200
  message: string;
  code: number; // 200
  data: AUser[];
  meta: PaginationMeta;
  timestamp: string;
}
