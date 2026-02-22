import { Test } from '@nestjs/testing';
import { GenericMessageEvent } from '@slack/web-api';
import { AccountFactory } from '@/accounts/__tests__/factories/account.factory';
import { MemberFactory } from '@/accounts/__tests__/factories/member.factory';
import { Account } from '@/accounts/domain';
import { MessageFactory } from '@/messages/__tests__/factories/message.factory';
import { MessageRepository, MessageScoredEvent } from '@/messages/domain';
import { URGENT_NOTIFICATION_GATEWAY } from '@/messages/domain/gateways/urgent-notification.gateway';
import { FakeUrgentNotificationGateway } from '@/messages/infrastructure/gateways/fake-urgent-notification.gateway';
import { MessageRepositoryInMemory } from '@/messages/infrastructure/persistence/in-memory/message.repository.in-memory';
import { URGENCY_SCORING_GATEWAY } from '@/scoring/domain/gateways';
import { FakeUrgencyScoringGateway } from '@/scoring/infrastructure/gateways';
import { UserFactory } from '@/users/__tests__/factories/user.factory';
import { Email } from '@/users/domain';
import { MessageScoringService } from './message-scoring.service';

describe('MessageScoringService', () => {
  let service: MessageScoringService;
  let messageRepository: MessageRepositoryInMemory;
  let scoringGateway: FakeUrgencyScoringGateway;
  let notificationGateway: FakeUrgentNotificationGateway;

  let sender: ReturnType<typeof MemberFactory.create>;
  let account: Account;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MessageScoringService,
        { provide: MessageRepository, useClass: MessageRepositoryInMemory },
        { provide: URGENCY_SCORING_GATEWAY, useClass: FakeUrgencyScoringGateway },
        { provide: URGENT_NOTIFICATION_GATEWAY, useClass: FakeUrgentNotificationGateway },
      ],
    }).compile();

    service = module.get(MessageScoringService);
    messageRepository = module.get<MessageRepositoryInMemory>(MessageRepository);
    scoringGateway = module.get<FakeUrgencyScoringGateway>(URGENCY_SCORING_GATEWAY);
    notificationGateway = module.get<FakeUrgentNotificationGateway>(URGENT_NOTIFICATION_GATEWAY);

    messageRepository.clear();

    account = AccountFactory.create({ id: 'accountId', slackTeamId: 'T_SLACK' });
    sender = MemberFactory.create({
      id: 'senderId',
      accountId: 'accountId',
      user: UserFactory.create({
        id: 'senderUserId',
        name: 'Alice Martin',
        email: Email.create('alice@example.com'),
      }),
    });
  });

  it('should score the message and set urgency score on the aggregate', async () => {
    scoringGateway.setScore(3, 'Moderate urgency');
    const message = MessageFactory.create({ id: 'msg-1', accountId: 'accountId', senderId: 'senderId' });
    await messageRepository.save(message);

    await service.score({
      message,
      text: 'Can you take a look?',
      recipients: [],
      sender,
      account,
      channelName: 'general',
      channelType: 'channel',
    });

    const saved = await messageRepository.findById('msg-1');
    expect(saved?.toJSON().urgencyScore).toBe(3);
    expect(saved?.toJSON().urgencyReasoning).toBe('Moderate urgency');
  });

  it('should persist the scored message', async () => {
    scoringGateway.setScore(2, 'Low urgency');
    const message = MessageFactory.create({ id: 'msg-2', accountId: 'accountId', senderId: 'senderId' });
    await messageRepository.save(message);

    await service.score({
      message,
      text: 'FYI — new customer signed up',
      recipients: [],
      sender,
      account,
      channelName: null,
      channelType: 'im',
    });

    const saved = await messageRepository.findById('msg-2');
    expect(saved).not.toBeNull();
    expect(saved?.toJSON().urgencyScore).toBe(2);
  });

  it('should emit a MessageScoredEvent on the aggregate', async () => {
    scoringGateway.setScore(4, 'High importance');
    const message = MessageFactory.create({ id: 'msg-3', accountId: 'accountId', senderId: 'senderId' });
    await messageRepository.save(message);

    await service.score({
      message,
      text: 'Need your input on this PR',
      recipients: [],
      sender,
      account,
      channelName: 'engineering',
      channelType: 'channel',
    });

    const events = message.findEvents(MessageScoredEvent);
    expect(events).toHaveLength(1);
    expect(events[0].score).toBe(4);
    expect(events[0].reasoning).toBe('High importance');
  });

  describe('when message scores 5', () => {
    beforeEach(() => {
      scoringGateway.setScore(5, 'Prod is down');
    });

    it('should call the urgent notification gateway', async () => {
      const message = MessageFactory.create({
        id: 'msg-urgent',
        accountId: 'accountId',
        senderId: 'senderId',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        text: 'Production is down!',
      });
      await messageRepository.save(message);

      await service.score({
        message,
        text: 'Production is down!',
        recipients: [],
        sender,
        account,
        channelName: 'general',
        channelType: 'channel',
      });

      expect(notificationGateway.getCallCount()).toBe(1);
    });

    it('should include message text, id, score, and reasoning in the notification payload', async () => {
      const message = MessageFactory.create({
        id: 'msg-payload',
        accountId: 'accountId',
        senderId: 'senderId',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        text: 'Production is down!',
      });
      await messageRepository.save(message);

      await service.score({
        message,
        text: 'Production is down!',
        recipients: [],
        sender,
        account,
        channelName: 'general',
        channelType: 'channel',
      });

      const payload = notificationGateway.getLastPayload();
      expect(payload).toMatchObject({
        messageId: 'msg-payload',
        text: 'Production is down!',
        score: 5,
        reasoning: 'Prod is down',
      });
    });

    it('should include sender name and email in the notification payload', async () => {
      const message = MessageFactory.create({
        id: 'msg-sender',
        accountId: 'accountId',
        senderId: 'senderId',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
      });
      await messageRepository.save(message);

      await service.score({
        message,
        text: 'Production is down!',
        recipients: [],
        sender,
        account,
        channelName: 'general',
        channelType: 'channel',
      });

      expect(notificationGateway.getLastPayload().sender).toEqual({
        name: 'Alice Martin',
        email: 'alice@example.com',
      });
    });

    it('should include channel name and type in the notification payload', async () => {
      const message = MessageFactory.create({
        id: 'msg-channel',
        accountId: 'accountId',
        senderId: 'senderId',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
      });
      await messageRepository.save(message);

      await service.score({
        message,
        text: 'Production is down!',
        recipients: [],
        sender,
        account,
        channelName: 'general',
        channelType: 'channel',
      });

      expect(notificationGateway.getLastPayload().channel).toEqual({
        name: 'general',
        type: 'channel',
      });
    });

    it('should include a slack deep link in the notification payload', async () => {
      const message = MessageFactory.create({
        id: 'msg-link',
        accountId: 'accountId',
        senderId: 'senderId',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
      });
      await messageRepository.save(message);

      await service.score({
        message,
        text: 'Production is down!',
        recipients: [],
        sender,
        account,
        channelName: 'general',
        channelType: 'channel',
      });

      expect(notificationGateway.getLastPayload().slackLink).toBe('slack://channel?team=T_SLACK&id=C_GENERAL');
    });

    it('should set channel.name to null in the notification payload when message is a direct message', async () => {
      const message = MessageFactory.create({
        id: 'msg-dm',
        accountId: 'accountId',
        senderId: 'senderId',
        slackChannelId: 'D_DM',
        slackChannelType: 'im',
      });
      await messageRepository.save(message);

      await service.score({
        message,
        text: 'Production is down!',
        recipients: [],
        sender,
        account,
        channelName: null,
        channelType: 'im',
      });

      expect(notificationGateway.getLastPayload().channel).toEqual({
        name: null,
        type: 'im',
      });
    });
  });

  it('should NOT call the urgent notification gateway when message scores less than 5', async () => {
    scoringGateway.setScore(4, 'Important but not critical');
    const message = MessageFactory.create({
      id: 'msg-not-urgent',
      accountId: 'accountId',
      senderId: 'senderId',
      slackChannelId: 'C_GENERAL',
      slackChannelType: 'channel',
    });
    await messageRepository.save(message);

    await service.score({
      message,
      text: 'Hey, can you check this?',
      recipients: [],
      sender,
      account,
      channelName: 'general',
      channelType: 'channel',
    });

    expect(notificationGateway.getCallCount()).toBe(0);
  });
});
