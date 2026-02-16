import { Message } from '@/messages/domain';
import { MessageMikroOrm } from '@/messages/infrastructure/persistence/mikro-orm/models';

export class MessageMapper {
  static toDomain(raw: MessageMikroOrm): Message {
    if (!raw.account)
      throw new Error('Error reconstructing message: missing account');
    if (!raw.sender)
      throw new Error('Error reconstructing message: missing sender');
    return Message.reconstitute({
      id: raw.id,
      accountId: raw.account?.id,
      senderId: raw.sender?.id,
      slackTs: raw.slackTs,
      slackChannelId: raw.slackChannelId,
      slackChannelType: raw.slackChannelType,
      slackThreadTs: raw.slackThreadTs,
      text: raw.text,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(message: Message): MessageMikroOrm {
    const json = message.toJSON();
    return MessageMikroOrm.build({ ...json });
  }
}
