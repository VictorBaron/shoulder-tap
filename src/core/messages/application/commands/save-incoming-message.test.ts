import { Test } from '@nestjs/testing';

import {
  Message,
  MessageCreatedEvent,
  type MessageJSON,
  MessageRepository,
} from '@/messages/domain';
import { MessageRepositoryInMemory } from '@/messages/infrastructure/persistence/in-memory/message.repository.in-memory';

import {
  SaveIncomingMessageCommand,
  SaveIncomingMessageHandler,
} from './save-incoming-message';

describe('SaveIncomingMessageHandler', () => {
  let handler: SaveIncomingMessageHandler;
  let messageRepository: MessageRepositoryInMemory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SaveIncomingMessageHandler,
        { provide: MessageRepository, useClass: MessageRepositoryInMemory },
      ],
    }).compile();

    handler = module.get<SaveIncomingMessageHandler>(
      SaveIncomingMessageHandler,
    );
    messageRepository =
      module.get<MessageRepositoryInMemory>(MessageRepository);

    messageRepository.clear();
  });

  it('should create and persist a message', async () => {
    const command = new SaveIncomingMessageCommand({
      accountId: 'account-1',
      senderId: 'user-1',
      slackTs: '1234567890.123456',
      slackChannelId: 'C_GENERAL',
      slackChannelType: 'channel',
      slackThreadTs: null,
      text: 'Hello world',
    });

    const result = await handler.execute(command);
    expect(result).toBeInstanceOf(Message);

    const saved = await messageRepository.findById(result.id);
    expect(saved).not.toBeNull();
    expect(saved?.toJSON()).toMatchObject<Partial<MessageJSON>>({
      accountId: 'account-1',
      senderId: 'user-1',
      slackTs: '1234567890.123456',
      slackChannelId: 'C_GENERAL',
      slackChannelType: 'channel',
      slackThreadTs: null,
      text: 'Hello world',
    });
  });

  it('should emit a MessageCreatedEvent on the aggregate', async () => {
    const command = new SaveIncomingMessageCommand({
      accountId: 'account-1',
      senderId: 'user-1',
      slackTs: '1234567890.123456',
      slackChannelId: 'C_GENERAL',
      slackChannelType: 'channel',
      slackThreadTs: null,
      text: 'Hello world',
    });

    const result = await handler.execute(command);
    const events = result.findEvents(MessageCreatedEvent);
    expect(events).toHaveLength(1);
    expect(events[0].messageId).toBe(result.id);
  });

  it('should persist a thread reply with slackThreadTs', async () => {
    const command = new SaveIncomingMessageCommand({
      accountId: 'account-1',
      senderId: 'user-1',
      slackTs: '1234567890.999999',
      slackChannelId: 'C_GENERAL',
      slackChannelType: 'channel',
      slackThreadTs: '1234567890.123456',
      text: 'Thread reply',
    });

    const result = await handler.execute(command);
    const saved = await messageRepository.findById(result.id);
    expect(saved?.toJSON().slackThreadTs).toBe('1234567890.123456');
  });

  it('should be findable by slackTs after saving', async () => {
    const command = new SaveIncomingMessageCommand({
      accountId: 'account-1',
      senderId: 'user-1',
      slackTs: '1234567890.123456',
      slackChannelId: 'C_GENERAL',
      slackChannelType: 'channel',
      slackThreadTs: null,
      text: 'Hello world',
    });

    await handler.execute(command);
    const found = await messageRepository.findBySlackTs('1234567890.123456');
    expect(found).not.toBeNull();
    expect(found?.toJSON().text).toBe('Hello world');
  });
});
