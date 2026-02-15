import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FilterIncomingMessageHandler } from './application/commands/filter-incoming-message.command';
import { FilterIncomingReactionHandler } from './application/commands/filter-incoming-reaction.command';

@Module({
  imports: [CqrsModule],
  providers: [FilterIncomingMessageHandler, FilterIncomingReactionHandler],
})
export class FilteringModule {}
