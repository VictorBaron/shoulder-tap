import { RepositoryInMemory } from 'common/domain/repository.in-memory';

import type { LinearTicketSnapshot } from '@/integrations/linear/domain/aggregates/linear-ticket-snapshot.aggregate';
import type { LinearTicketSnapshotRepository } from '@/integrations/linear/domain/repositories/linear-ticket-snapshot.repository';

export class LinearTicketSnapshotRepositoryInMemory
  extends RepositoryInMemory<LinearTicketSnapshot>
  implements LinearTicketSnapshotRepository
{
  findByProjectAndWeek(projectId: string, weekStart: Date): Promise<LinearTicketSnapshot[]> {
    return this.filter(
      (snapshot) =>
        snapshot.getProjectId() === projectId && snapshot.toJSON().snapshotWeekStart.getTime() === weekStart.getTime(),
    );
  }

  async saveMany(snapshots: LinearTicketSnapshot[]): Promise<LinearTicketSnapshot[]> {
    for (const snapshot of snapshots) {
      await this.save(snapshot);
    }
    return snapshots;
  }
}
