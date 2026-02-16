import { Inject, Injectable } from '@nestjs/common';

import { Message, MessageRepository } from '@/messages/domain';

export class SaveIncomingMessageCommand {
  constructor(
    readonly props: {
      accountId: string;
      senderId: string;
      slackTs: string;
      slackChannelId: string;
      slackChannelType: string;
      slackThreadTs: string | null;
      text: string | null;
    },
  ) {}
}

@Injectable()
export class SaveIncomingMessageHandler {
  constructor(
    @Inject(MessageRepository)
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(command: SaveIncomingMessageCommand): Promise<Message> {
    const message = Message.create(command.props);
    await this.messageRepository.save(message);
    return message;
  }
}
