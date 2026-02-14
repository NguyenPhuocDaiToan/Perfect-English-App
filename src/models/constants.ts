
export const TOPIC_CATEGORIES = ['Grammar', 'Vocabulary', 'Skills', 'Writing', 'Speaking'] as const;
export type TopicCategory = typeof TOPIC_CATEGORIES[number];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type CEFRLevel = typeof CEFR_LEVELS[number];

export const PUBLISH_STATUSES = ['Published', 'Draft'] as const;
export type PublishStatus = typeof PUBLISH_STATUSES[number];

export const USER_ROLES = ['Admin', 'Editor', 'Teacher', 'Student'] as const;
export type UserRole = typeof USER_ROLES[number];

export const USER_STATUSES = ['Active', 'Inactive', 'Suspended', 'Pending'] as const;
export type UserStatus = typeof USER_STATUSES[number];

export const QUESTION_TOPICS = ['Grammar', 'Vocabulary', 'Reading', 'Listening'] as const;
export type QuestionTopic = typeof QUESTION_TOPICS[number];
