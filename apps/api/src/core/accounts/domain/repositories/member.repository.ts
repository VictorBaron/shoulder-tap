import { RepositoryPort } from 'common/domain';

import type { Member } from '../aggregates/member.aggregate';

export abstract class MemberRepository extends RepositoryPort<Member> {
  abstract findById(id: string): Promise<Member | null>;
  abstract findByEmail(email: string): Promise<Member | null>;
  abstract findBySlackUserId(slackUserId: string): Promise<Member | null>;
  abstract findByOrganizationId(organizationId: string): Promise<Member[]>;
}
