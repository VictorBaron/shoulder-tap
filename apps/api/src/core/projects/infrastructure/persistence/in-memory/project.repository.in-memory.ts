import { RepositoryInMemory } from 'common/domain/repository.in-memory';

import type { Project } from '@/projects/domain/aggregates/project.aggregate';
import type { ProjectRepository } from '@/projects/domain/repositories/project.repository';

export class ProjectRepositoryInMemory extends RepositoryInMemory<Project> implements ProjectRepository {
  findById(id: string): Promise<Project | null> {
    return Promise.resolve(this.get(id) ?? null);
  }

  findByOrganizationId(organizationId: string): Promise<Project[]> {
    return this.filter((project) => project.getOrganizationId() === organizationId);
  }

  findActiveByOrganizationId(organizationId: string): Promise<Project[]> {
    return this.filter((project) => project.getOrganizationId() === organizationId && project.getIsActive());
  }
}
