import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LinearTicketSnapshotRepository } from './linear/domain/repositories/linear-ticket-snapshot.repository';
import { LinearTicketSnapshotRepositoryMikroOrm } from './linear/infrastructure/persistence/mikro-orm/linear-ticket-snapshot.repository.mikroORM';
import { LinearTicketSnapshotMikroOrm } from './linear/infrastructure/persistence/mikro-orm/models/linear-ticket-snapshot.mikroORM';
import { SlackMessageRepository } from './slack/domain/repositories/slack-message.repository';
import { SlackMessageMikroOrm } from './slack/infrastructure/persistence/mikro-orm/models/slack-message.mikroORM';
import { SlackMessageRepositoryMikroOrm } from './slack/infrastructure/persistence/mikro-orm/slack-message.repository.mikroORM';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([SlackMessageMikroOrm, LinearTicketSnapshotMikroOrm])],
  providers: [
    { provide: SlackMessageRepository, useClass: SlackMessageRepositoryMikroOrm },
    { provide: LinearTicketSnapshotRepository, useClass: LinearTicketSnapshotRepositoryMikroOrm },
  ],
  exports: [SlackMessageRepository, LinearTicketSnapshotRepository],
})
export class IntegrationsModule {}
