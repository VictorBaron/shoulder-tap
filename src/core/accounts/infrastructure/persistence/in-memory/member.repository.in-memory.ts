import { RepositoryInMemory } from 'common/domain/repository.in-memory';

import { Member, MemberRepository } from '@/accounts/domain';

export class InMemoryMemberRepository
  extends RepositoryInMemory<Member>
  implements MemberRepository
{
  async findByAccountId(accountId: string): Promise<Member[]> {
    return Promise.resolve(
      this.toArray().filter((m) => m.getAccountId() === accountId),
    );
  }

  async findByUserId(userId: string): Promise<Member[]> {
    return Promise.resolve(
      this.toArray().filter((m) => m.getUserId() === userId),
    );
  }

  async findByAccountIdAndUserId(props: {
    accountId: string;
    userId: string;
  }): Promise<Member | null> {
    return Promise.resolve(
      this.toArray().find(
        (m) =>
          m.getAccountId() === props.accountId &&
          m.getUserId() === props.userId,
      ) ?? null,
    );
  }

  async findPendingByUserId(userId: string): Promise<Member[]> {
    return Promise.resolve(
      this.toArray().filter((m) => m.getUserId() === userId && m.isPending()),
    );
  }

  async findActiveAdminsByAccountId(accountId: string): Promise<Member[]> {
    return Promise.resolve(
      this.toArray().filter(
        (m) => m.getAccountId() === accountId && m.isAdmin() && m.isActive(),
      ),
    );
  }
}
