import { RepositoryInMemory } from 'common/domain/repository.in-memory';

import type { Organization } from '@/accounts/domain/aggregates/organization.aggregate';
import type { OrganizationRepository } from '@/accounts/domain/repositories/organization.repository';

export class OrganizationRepositoryInMemory extends RepositoryInMemory<Organization> implements OrganizationRepository {
  findById(id: string): Promise<Organization | null> {
    return Promise.resolve(this.get(id) ?? null);
  }

  findBySlackTeamId(slackTeamId: string): Promise<Organization | null> {
    return this.find((org) => org.getSlackTeamId() === slackTeamId);
  }
}
