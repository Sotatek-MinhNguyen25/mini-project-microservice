export const KAFKA_CLIENTS = {
    AUTH: 'KAFKA_AUTH_SERVICE',
} as const;

export const KAFKA_PATTERNS = {
    AUTH: {
        VERIFY_TOKEN: 'auth.verify-token',
    },
    USER: {
        FIND_ONE: 'user.find-one'
    },
    REACTION: {
        CREATED: 'reaction.created',
    },
    COMMENT: {
        CREATED: 'comment.created',
    },

    NOTIFICATION: {
        CREATE: 'notification.create',
        REACTION_CREATED: 'notification.reaction-created',
        COMMENT_CREATED: 'notification.comment-created',
    },
};
