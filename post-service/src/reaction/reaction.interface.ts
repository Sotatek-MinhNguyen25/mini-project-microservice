import { ReactionType } from '@prisma/client';

export interface ReactionSummary {
  type: ReactionType;
  count: number;
}
