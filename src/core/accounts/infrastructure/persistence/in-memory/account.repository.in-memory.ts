import { RepositoryInMemory } from 'common/domain/repository.in-memory';

import type { Account, AccountRepository } from '@/accounts/domain';

export class AccountRepositoryInMemory
  extends RepositoryInMemory<Account>
  implements AccountRepository
{
  findBySlackTeamId(teamId: string): Promise<Account | null> {
    return Promise.resolve(
      this.toArray().find(
        (account) => account.toJSON().slackTeamId === teamId,
      ) ?? null,
    );
  }
}
