import { RepositoryInMemory } from 'common/domain/repository.in-memory';

import type { Member } from '@/accounts/domain/aggregates/member.aggregate';
import type { MemberRepository } from '@/accounts/domain/repositories/member.repository';

export class MemberRepositoryInMemory extends RepositoryInMemory<Member> implements MemberRepository {
  findById(id: string): Promise<Member | null> {
    return Promise.resolve(this.get(id) ?? null);
  }

  findByEmail(email: string): Promise<Member | null> {
    return this.find((member) => member.getEmail() === email);
  }

  findBySlackUserId(slackUserId: string): Promise<Member | null> {
    return this.find((member) => member.getSlackUserId() === slackUserId);
  }

  findByOrganizationId(organizationId: string): Promise<Member[]> {
    return this.filter((member) => member.getOrganizationId() === organizationId);
  }
}
