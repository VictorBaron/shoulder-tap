import { Inject, Injectable, Logger } from '@nestjs/common';
import type { GenericMessageEvent } from '@slack/types';
import type { Account, Member } from '@/accounts/domain';
import { Message, MessageRepository } from '@/messages/domain';
import {
  URGENT_NOTIFICATION_GATEWAY,
  type UrgentNotificationGateway,
} from '@/messages/domain/gateways/urgent-notification.gateway';
import { URGENCY_SCORING_GATEWAY, type UrgencyScoringGateway } from '@/scoring/domain/gateways';

export interface ScoreMessageParams {
  message: Message;
  text: string;
  recipients: Member[];
  sender: Member;
  account: Account;
  channelName: string | null;
  channelType: GenericMessageEvent['channel_type'];
}

@Injectable()
export class MessageScoringService {
  private readonly logger = new Logger(MessageScoringService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    @Inject(URGENCY_SCORING_GATEWAY)
    private readonly scoringGateway: UrgencyScoringGateway,
    @Inject(URGENT_NOTIFICATION_GATEWAY)
    private readonly notificationGateway: UrgentNotificationGateway,
  ) {}

  async score({
    message,
    text,
    recipients,
    sender,
    account,
    channelName,
    channelType,
  }: ScoreMessageParams): Promise<void> {
    const { score, reasoning } = await this.scoringGateway.scoreMessage({ text, recipients });
    message.setUrgencyScore({ score, reasoning });

    await this.messageRepository.save(message);

    if (message.isUrgent()) {
      this.logger.log('🚨 URGENT MESSAGE 🚨');
      await this.notificationGateway.notifyUrgentMessage({
        messageId: message.id,
        text,
        score,
        reasoning,
        sender: {
          name: sender.getName(),
          email: sender.getEmail(),
        },
        channel: {
          name: channelName,
          type: channelType,
        },
        slackLink: `slack://channel?team=${account.getSlackTeamId()}&id=${message.toJSON().slackChannelId}`,
      });
    }
  }
}
