import type { AggregateRootProps } from 'common/domain';

import type {
  MemberPreferences,
  MemberRole,
  MemberRoleLevel,
} from '@/accounts/domain/value-objects';

import type { Member } from './member.aggregate';

export interface MemberProps extends AggregateRootProps {
  accountId: string;
  userId: string;
  role: MemberRole;
  invitedAt: Date | null;
  activatedAt: Date | null;
  disabledAt: Date | null;
  invitedById: string | null;
  lastActiveAt: Date | null;
  preferences: MemberPreferences;
}

export interface CreateMemberProps {
  userId: string;
  inviter: Member;
}

export interface CreateFounderMemberProps {
  accountId: string;
  userId: string;
}

export interface MemberJSON {
  id: string;
  accountId: string;
  userId: string;
  role: MemberRoleLevel;
  invitedAt: Date | null;
  activatedAt: Date | null;
  disabledAt: Date | null;
  invitedById: string | null;
  lastActiveAt: Date | null;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
