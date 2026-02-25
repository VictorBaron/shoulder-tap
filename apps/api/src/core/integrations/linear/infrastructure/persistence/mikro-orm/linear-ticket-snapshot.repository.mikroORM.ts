import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { RepositoryMikroORM } from 'common/domain';

import type { LinearTicketSnapshot } from '@/integrations/linear/domain/aggregates/linear-ticket-snapshot.aggregate';
import { LinearTicketSnapshotRepository } from '@/integrations/linear/domain/repositories/linear-ticket-snapshot.repository';

import { LinearTicketSnapshotMapper } from './mappers/linear-ticket-snapshot.mapper';
import { LinearTicketSnapshotMikroOrm } from './models/linear-ticket-snapshot.mikroORM';

@Injectable()
export class LinearTicketSnapshotRepositoryMikroOrm
  extends RepositoryMikroORM<LinearTicketSnapshot, LinearTicketSnapshotMikroOrm>
  implements LinearTicketSnapshotRepository
{
  constructor(em: EntityManager, eventBus: EventBus) {
    super(em, eventBus, LinearTicketSnapshotMapper, LinearTicketSnapshotMikroOrm);
  }

  async findByProjectAndWeek(projectId: string, weekStart: Date): Promise<LinearTicketSnapshot[]> {
    const entities = await this.em.find(LinearTicketSnapshotMikroOrm, {
      projectId,
      snapshotWeekStart: weekStart,
    });
    return entities.map(LinearTicketSnapshotMapper.toDomain);
  }

  async saveMany(snapshots: LinearTicketSnapshot[]): Promise<LinearTicketSnapshot[]> {
    return super.saveMany(snapshots);
  }
}
