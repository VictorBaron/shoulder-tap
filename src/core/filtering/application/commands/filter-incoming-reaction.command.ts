import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { ReactionAddedEvent } from '@slack/types';

export class FilterIncomingReactionCommand {
  constructor(
    readonly props: {
      event: ReactionAddedEvent;
    },
  ) {}
}

@CommandHandler(FilterIncomingReactionCommand)
export class FilterIncomingReactionHandler
  implements ICommandHandler<FilterIncomingReactionCommand>
{
  async execute(command: FilterIncomingReactionCommand): Promise<void> {
    const { event } = command.props;

    console.log('Reaction received:', event);

    return Promise.resolve();
  }
}
