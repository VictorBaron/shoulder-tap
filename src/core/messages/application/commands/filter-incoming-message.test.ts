import { Test } from '@nestjs/testing';
import { GenericMessageEvent } from '@slack/web-api';
import { AccountRepository, MemberRepository } from '@/accounts';
import { AccountFactory } from '@/accounts/__tests__/factories/account.factory';
import { MemberFactory } from '@/accounts/__tests__/factories/member.factory';
import { AccountRepositoryInMemory } from '@/accounts/infrastructure/persistence/in-memory/account.repository.in-memory';
import { MemberRepositoryInMemory } from '@/accounts/infrastructure/persistence/in-memory/member.repository.in-memory';
import {
  Message,
  MessageCreatedEvent,
  type MessageJSON,
  MessageRepository,
  MessageScoredEvent,
} from '@/messages/domain';
import { MessageRepositoryInMemory } from '@/messages/infrastructure/persistence/in-memory/message.repository.in-memory';
import { URGENCY_SCORING_GATEWAY } from '@/scoring/domain/gateways';
import { FakeUrgencyScoringGateway } from '@/scoring/infrastructure/gateways';
import { UserFactory } from '@/users/__tests__/factories/user.factory';
import {
  FilterIncomingMessageCommand,
  FilterIncomingMessageHandler,
} from './filter-incoming-message';

const createGenericMessageEvent = (
  props: Partial<GenericMessageEvent>,
): GenericMessageEvent => {
  return {
    type: 'message',
    subtype: undefined,
    event_ts: 'event_ts',
    team: 'teamId',
    channel: 'channelId',
    user: 'slackUserId',
    text: 'Message text',
    ts: 'ts',
    channel_type: 'channel',
    ...props,
  };
};

describe('Filter incoming message', () => {
  let handler: FilterIncomingMessageHandler;
  let messageRepository: MessageRepositoryInMemory;
  let accountRepository: AccountRepositoryInMemory;
  let memberRepository: MemberRepositoryInMemory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FilterIncomingMessageHandler,
        { provide: MessageRepository, useClass: MessageRepositoryInMemory },
        { provide: AccountRepository, useClass: AccountRepositoryInMemory },
        { provide: MemberRepository, useClass: MemberRepositoryInMemory },
        {
          provide: URGENCY_SCORING_GATEWAY,
          useClass: FakeUrgencyScoringGateway,
        },
      ],
    }).compile();

    handler = module.get(FilterIncomingMessageHandler);
    messageRepository =
      module.get<MessageRepositoryInMemory>(MessageRepository);
    accountRepository =
      module.get<AccountRepositoryInMemory>(AccountRepository);
    memberRepository = module.get<MemberRepositoryInMemory>(MemberRepository);

    messageRepository.clear();
    accountRepository.clear();
    memberRepository.clear();
    accountRepository.save(
      AccountFactory.create({
        id: 'accountId',
        slackTeamId: 'teamId',
      }),
    );
    memberRepository.save(
      MemberFactory.create({
        id: 'senderId',
        accountId: 'accountId',
        user: UserFactory.create({
          slackId: 'slackUserId',
        }),
      }),
    );
  });

  it('should create and persist a message', async () => {
    const command = new FilterIncomingMessageCommand({
      messageEvent: createGenericMessageEvent({
        ts: '1234567890.123456',
        channel: 'C_GENERAL',
        channel_type: 'channel',
        thread_ts: undefined,
        text: 'Hello world',
      }),
    });

    const result = await handler.execute(command);
    expect(result).toBeInstanceOf(Message);

    const saved = await messageRepository.findById(result!.id);
    expect(saved).not.toBeNull();
    expect(saved?.toJSON()).toMatchObject<Partial<MessageJSON>>({
      accountId: 'accountId',
      senderId: 'senderId',
      slackTs: '1234567890.123456',
      slackChannelId: 'C_GENERAL',
      slackChannelType: 'channel',
      slackThreadTs: null,
      text: 'Hello world',
    });
  });

  it('should emit a MessageCreatedEvent on the aggregate', async () => {
    const command = new FilterIncomingMessageCommand({
      messageEvent: createGenericMessageEvent({
        user: 'slackUserId',
        ts: '1234567890.123456',
        channel: 'C_GENERAL',
        channel_type: 'channel',
        thread_ts: undefined,
        text: 'Hello world',
      }),
    });

    const result = await handler.execute(command);
    const events = result!.findEvents(MessageCreatedEvent);
    expect(events).toHaveLength(1);
    expect(events[0].messageId).toBe(result!.id);
  });

  it('should persist a thread reply with thread_ts', async () => {
    const command = new FilterIncomingMessageCommand({
      messageEvent: createGenericMessageEvent({
        user: 'slackUserId',
        ts: '1234567890.123456',
        channel: 'C_GENERAL',
        channel_type: 'channel',
        thread_ts: '1234567890.123456',
        text: 'Thread reply',
      }),
    });

    const result = await handler.execute(command);
    const saved = await messageRepository.findById(result!.id);
    expect(saved?.toJSON().slackThreadTs).toBe('1234567890.123456');
  });

  it('should score the message urgency and persist it', async () => {
    const command = new FilterIncomingMessageCommand({
      messageEvent: createGenericMessageEvent({
        text: 'Production is down!',
      }),
    });

    const result = await handler.execute(command);
    const saved = await messageRepository.findById(result!.id);

    expect(saved?.toJSON()).toMatchObject<Partial<MessageJSON>>({
      urgencyScore: 3,
      urgencyReasoning: 'Fake scoring',
    });
  });

  it('should emit a MessageScoredEvent', async () => {
    const command = new FilterIncomingMessageCommand({
      messageEvent: createGenericMessageEvent({
        text: 'Production is down!',
      }),
    });

    const result = await handler.execute(command);
    const events = result!.findEvents(MessageScoredEvent);

    expect(events).toHaveLength(1);
    expect(events[0].score).toBe(3);
    expect(events[0].reasoning).toBe('Fake scoring');
  });
});
