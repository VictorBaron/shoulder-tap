import { RepositoryPort } from 'common/domain';

import type { Project } from '../aggregates/project.aggregate';

export abstract class ProjectRepository extends RepositoryPort<Project> {
  abstract findById(id: string): Promise<Project | null>;
  abstract findByOrganizationId(organizationId: string): Promise<Project[]>;
  abstract findActiveByOrganizationId(organizationId: string): Promise<Project[]>;
}
