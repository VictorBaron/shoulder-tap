import { RepositoryInMemory } from 'common/domain/repository.in-memory';

import type { Report } from '@/reports/domain/aggregates/report.aggregate';
import type { ReportRepository } from '@/reports/domain/repositories/report.repository';

export class ReportRepositoryInMemory extends RepositoryInMemory<Report> implements ReportRepository {
  findById(id: string): Promise<Report | null> {
    return Promise.resolve(this.get(id) ?? null);
  }

  findByProjectAndWeek(projectId: string, weekStart: Date): Promise<Report | null> {
    return this.find(
      (report) => report.getProjectId() === projectId && report.getWeekStart().getTime() === weekStart.getTime(),
    );
  }

  findByProjectId(projectId: string): Promise<Report[]> {
    return this.filter((report) => report.getProjectId() === projectId);
  }
}
