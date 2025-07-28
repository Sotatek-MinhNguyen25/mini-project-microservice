export const CONSTANTS = {
  MESSAGE_PATTERN: {
    POST: {
      GET: 'post.get',
      CREATE: 'post.create',
      GET_DETAIL: 'post.get-detail',
      UPDATE: 'post.update',
      DELETE: 'post.delete',
    },
    COMMENT: {
      CREATE: 'comment.create',
      GET_BY_POST: 'comment.get_by_post',
      UPDATE: 'comment.update',
      DELETE: 'comment.delete',
      GET_CHILD: 'comment.get-child',
    },
    REACTION: {
      GET_BY_POST: 'reaction.get_by_post',
      GET_SUMMARY_BY_POST: 'reaction.get_summary_by_post',
      CREATE: 'reaction.create',
      UPDATE: 'reaction.update',
      DELETE: 'reaction.delete',
    },
    TAG: {
      GET: 'tag.get',
      CREATE: 'tag.create',
      UPDATE: 'tag.update',
      DELETE: 'tag.delete',
      GET_BY_POST_ID: 'tag.get_by_post',
      CREATE_POST_TAG: 'posttag.create',
      DELETE_POST_TAG: 'posttag.delete',
    },
    AUTH: {
      GET_USER: 'user.find-one',
      GET_USERS: 'user.find-ids',
    },
  },

  KAFKA_SERVICE: {
    AUTH: 'KAFKA_AUTH_SERVICE',
    NOTIFICATION: "KAFKA_NOTIFICATION_SERVICE"
  },
} as const;
