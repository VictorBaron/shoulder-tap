import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AccountPersistenceModule } from '@/accounts/infrastructure';
import { FilterIncomingMessageHandler } from './application/commands/filter-incoming-message';
import { FilterIncomingReactionHandler } from './application/commands/filter-incoming-reaction';
import { MessagePersistenceModule } from './infrastructure/persistence/message-persistence.module';

@Module({
  imports: [
    CqrsModule,
    MessagePersistenceModule.use('orm'),
    AccountPersistenceModule.use('orm'),
  ],
  providers: [FilterIncomingMessageHandler, FilterIncomingReactionHandler],
})
export class MessagesModule {}
