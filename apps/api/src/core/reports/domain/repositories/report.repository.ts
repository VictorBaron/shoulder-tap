import { RepositoryPort } from 'common/domain';

import type { Report } from '../aggregates/report.aggregate';

export abstract class ReportRepository extends RepositoryPort<Report> {
  abstract findById(id: string): Promise<Report | null>;
  abstract findByProjectAndWeek(projectId: string, weekStart: Date): Promise<Report | null>;
  abstract findByProjectId(projectId: string): Promise<Report[]>;
}
