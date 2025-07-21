export const KAFKA_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH_TOKEN: 'auth.refresh-token',
  CHECK_USER: 'auth.check-user',
  LOGOUT: 'auth.logout',
  FORGOT_PASSWORD: 'auth.forgot-password',
  VERIFY_FORGOT_PASSWORD: 'auth.verify-forgot-password',
  UPDATE_PASSWORD: 'auth.update-password',

  USER_CREATE: 'user.create',
  USER_FIND_ONE: 'user.find-one',
  USER_FIND_IDS: 'user.find-ids',
  USER_FIND_MANY: 'user.find-many',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  USER_DETAIL_GET: 'user.detail.get',
  USER_DETAIL_UPDATE: 'user.detail.update',
  USER_DETAIL_AVATAR_UPDATE: 'user.detail.avatar-update',
} as const;
