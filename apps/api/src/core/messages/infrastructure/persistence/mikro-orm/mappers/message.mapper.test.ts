import { AccountMikroOrm } from '@/accounts/infrastructure/persistence/mikro-orm/models/account.mikroORM';
import { MemberMikroOrm } from '@/accounts/infrastructure/persistence/mikro-orm/models/member.mikroORM';
import { Message, type MessageJSON } from '@/messages/domain';
import { MessageMikroOrm } from '@/messages/infrastructure/persistence/mikro-orm/models';
import { MessageMapper } from './message.mapper';

const now = new Date('2026-01-01');

const baseMikroOrmProps = {
  id: 'msg-1',
  slackTs: '1234567890.123456',
  slackChannelId: 'C_GENERAL',
  slackChannelType: 'channel' as const,
  slackThreadTs: null,
  text: 'Hello world',
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
  account: Object.assign(new AccountMikroOrm(), { id: 'account-1' }),
  sender: Object.assign(new MemberMikroOrm(), { id: 'member-1' }),
};

describe('MessageMapper', () => {
  describe('toDomain', () => {
    it('should map urgency fields from persistence to domain', () => {
      const raw = Object.assign(new MessageMikroOrm(), {
        ...baseMikroOrmProps,
        urgencyScore: 4,
        urgencyReasoning: 'Urgent request from manager',
      });

      const message = MessageMapper.toDomain(raw);

      expect(message.toJSON()).toMatchObject<Partial<MessageJSON>>({
        ...baseMikroOrmProps,
      });
    });
  });

  describe('toPersistence', () => {
    it('should map urgency fields from domain to persistence', () => {
      const message = Message.reconstitute({
        id: 'msg-1',
        accountId: 'account-1',
        senderId: 'member-1',
        slackTs: '1234567890.123456',
        slackChannelId: 'C_GENERAL',
        slackChannelType: 'channel',
        slackThreadTs: null,
        text: 'Hello world',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      const persistence = MessageMapper.toPersistence(message);

      expect(message.toJSON()).toMatchObject<Partial<MessageJSON>>({
        ...persistence,
      });
    });
  });
});
