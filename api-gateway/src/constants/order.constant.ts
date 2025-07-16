export const GATEWAY_CONSTANTS = {
  GATEWAY: {
    CONTROLLER: {
      ORDER_CREATE: 'order.create',
      ORDER_RETRY_PAYMENT: 'order.retry_payment',
      ORDER_UPDATE: 'order.update',
      ORDER_GET_ALL: 'order.get_all',
      ORDER_GET_BY_ID: 'order.get_by_id',
      AUTH_REGISTER: 'auth.register',
      AUTH_LOGIN: 'auth.login',
      AUTH_REFRESH_TOKEN: 'auth.refresh_token',
    },
    SERVICE: {
      AUTH: {
        CHECK_USER: 'auth.check_user'
      }
    }
  },


} as const;
