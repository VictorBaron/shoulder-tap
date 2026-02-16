import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FilterIncomingMessageHandler } from './application/commands/filter-incoming-message';
import { FilterIncomingReactionHandler } from './application/commands/filter-incoming-reaction';
import { SaveIncomingMessageHandler } from './application/commands/save-incoming-message';
import { MessagePersistenceModule } from './infrastructure/persistence/message-persistence.module';

@Module({
  imports: [CqrsModule, MessagePersistenceModule.use('orm')],
  providers: [
    FilterIncomingMessageHandler,
    FilterIncomingReactionHandler,
    SaveIncomingMessageHandler,
  ],
})
export class MessagesModule {}
