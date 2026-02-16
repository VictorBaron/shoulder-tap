import { Inject, Injectable } from '@nestjs/common';
import type { GenericMessageEvent } from '@slack/types';

import {
  SaveIncomingMessageCommand,
  SaveIncomingMessageHandler,
} from './save-incoming-message';

export class FilterIncomingMessageCommand {
  constructor(
    readonly props: {
      accountId: string;
      senderId: string;
      message: GenericMessageEvent;
    },
  ) {}
}

@Injectable()
export class FilterIncomingMessageHandler {
  constructor(
    @Inject(SaveIncomingMessageHandler)
    private readonly saveIncomingMessage: SaveIncomingMessageHandler,
  ) {}

  async execute(command: FilterIncomingMessageCommand): Promise<void> {
    const { accountId, senderId, message } = command.props;

    await this.saveIncomingMessage.execute(
      new SaveIncomingMessageCommand({
        accountId,
        senderId,
        slackTs: message.ts,
        slackChannelId: message.channel,
        slackChannelType: message.channel_type,
        slackThreadTs: message.thread_ts ?? null,
        text: message.text ?? null,
      }),
    );
  }
}
