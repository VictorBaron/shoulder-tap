import {
  Message,
  MessageCreatedEvent,
  type MessageJSON,
} from '@/messages/domain';

describe('Message Aggregate', () => {
  describe('create', () => {
    it('should create a message with the given properties', () => {
      const message = Message.create({
        accountId: 'account-1',
        senderId: 'user-1',
        slackTs: '1234567890.123456',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: null,
        text: 'Hello world',
      });

      expect(message.toJSON()).toMatchObject<Partial<MessageJSON>>({
        accountId: 'account-1',
        senderId: 'user-1',
        slackTs: '1234567890.123456',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: null,
        text: 'Hello world',
      });
    });

    it('should generate an id', () => {
      const message = Message.create({
        accountId: 'account-1',
        senderId: 'user-1',
        slackTs: '1234567890.123456',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: null,
        text: 'Hello world',
      });

      expect(message.id).toBeDefined();
      expect(message.id).not.toBe('');
    });

    it('should emit a MessageCreatedEvent', () => {
      const message = Message.create({
        accountId: 'account-1',
        senderId: 'user-1',
        slackTs: '1234567890.123456',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: null,
        text: 'Hello world',
      });

      const events = message.findEvents(MessageCreatedEvent);
      expect(events).toHaveLength(1);
      expect(events[0].messageId).toBe(message.id);
    });

    it('should handle thread messages with slackThreadTs', () => {
      const message = Message.create({
        accountId: 'account-1',
        senderId: 'user-1',
        slackTs: '1234567890.999999',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: '1234567890.123456',
        text: 'Thread reply',
      });

      expect(message.toJSON().slackThreadTs).toBe('1234567890.123456');
    });

    it('should handle null text', () => {
      const message = Message.create({
        accountId: 'account-1',
        senderId: 'user-1',
        slackTs: '1234567890.123456',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: null,
        text: null,
      });

      expect(message.toJSON().text).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a message without emitting events', () => {
      const message = Message.reconstitute({
        id: 'existing-id',
        accountId: 'account-1',
        senderId: 'user-1',
        slackTs: '1234567890.123456',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: null,
        text: 'Hello world',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        deletedAt: null,
      });

      expect(message.id).toBe('existing-id');
      expect(message.findEvents(MessageCreatedEvent)).toHaveLength(0);
    });
  });
});
