import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import type { GenericMessageEvent } from '@slack/types';
import { BaseCommandHandler } from 'src/common/application/command-handler';
import { AccountRepository, MemberRepository } from '@/accounts';
import { Message, MessageRepository } from '@/messages/domain';

export class FilterIncomingMessageCommand {
  constructor(
    readonly props: {
      messageEvent: GenericMessageEvent;
    },
  ) {}
}

@CommandHandler(FilterIncomingMessageCommand)
export class FilterIncomingMessageHandler extends BaseCommandHandler<FilterIncomingMessageCommand> {
  constructor(
    @Inject(MessageRepository)
    private readonly messageRepository: MessageRepository,
    @Inject(AccountRepository)
    private accountRepository: AccountRepository,
    @Inject(MemberRepository)
    private memberRepository: MemberRepository,
  ) {
    super();
  }

  async execute(
    command: FilterIncomingMessageCommand,
  ): Promise<Message | null> {
    const { messageEvent } = command.props;

    if (!messageEvent.text) {
      this.logger.warn('Received Slack message with no text');
      return null;
    }

    const sender = await this.getSender({
      team: messageEvent.team,
      user: messageEvent.user,
    });

    const message = Message.create({
      sender,
      text: messageEvent.text,
      slackChannelId: messageEvent.channel,
      slackChannelType: messageEvent.channel_type,
      slackThreadTs: messageEvent.thread_ts ?? null,
      slackTs: messageEvent.ts,
    });
    await this.messageRepository.save(message);

    this.logger.log('New message', message);

    return message;
  }

  private async getSender({ team, user }: { team?: string; user: string }) {
    if (!team) throw new Error(`Received message with no team`);

    const account = await this.accountRepository.findBySlackTeamId(team);
    if (!account?.isActive) {
      throw new Error(`No account found for Slack team ${team}`);
    }

    const sender = await this.memberRepository.findByAccountIdAndSlackUserId({
      accountId: account.id,
      slackUserId: user,
    });
    if (!sender) {
      throw new Error(`No user found for Slack user ${user}`);
    }
    return sender;
  }
}
