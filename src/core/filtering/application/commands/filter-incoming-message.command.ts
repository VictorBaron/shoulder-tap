import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { GenericMessageEvent } from '@slack/types';

export class FilterIncomingMessageCommand {
  constructor(
    readonly props: {
      message: GenericMessageEvent;
    },
  ) {}
}

@CommandHandler(FilterIncomingMessageCommand)
export class FilterIncomingMessageHandler
  implements ICommandHandler<FilterIncomingMessageCommand>
{
  async execute(command: FilterIncomingMessageCommand): Promise<void> {
    const { message } = command.props;

    console.log('Message received:', message);

    return Promise.resolve();
  }
}
