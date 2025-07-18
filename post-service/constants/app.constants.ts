export const CONSTANTS = {
  MESSAGE_PATTERN: {
    POST: {
      GET: 'post.get',
      CREATE: 'post.create',
      GET_DETAIL: 'post.get-detail',
    },
    COMMENT: {
      CREATE: 'comment.create',
    },
    REACTION: {
      GET_BY_POST: 'reaction.get_by_post',
      CREATE: 'reaction.create',
      UPDATE: 'reaction.update',
      DELETE: 'reaction.delete',
    },
    TAG: {
      GET_TAGS: 'tag.get',
      CREATE_TAG: 'tag.create',
      UPDATE_TAG: 'tag.update',
      DELETE_TAG: 'tag.delete',
      GET_BY_POST_ID: 'tag.get_by_post',
      CREATE_POST_TAG: 'posttag.create',
      DELETE_POST_TAG: 'posttag.delete',
    },
  },

  KAFKA_SERVICE: {
    AUTH: 'KAFKA_AUTH_SERVICE',
  },
};
