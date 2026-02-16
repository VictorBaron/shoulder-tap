import { Channel } from '@/channels/domain';
import { ChannelMikroOrm } from '@/channels/infrastructure/persistence/mikro-orm/models/channel.mikroORM';

export class ChannelMapper {
  static toDomain(raw: ChannelMikroOrm): Channel {
    if (!raw.account)
      throw new Error('Error reconstructing Channel: missing account');
    return Channel.reconstitute({
      id: raw.id,
      accountId: raw.account?.id,
      slackChannelId: raw.slackChannelId,
      name: raw.name,
      topic: raw.topic,
      purpose: raw.purpose,
      isPrivate: raw.isPrivate,
      isArchived: raw.isArchived,
      memberCount: raw.memberCount,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(channel: Channel): ChannelMikroOrm {
    const json = channel.toJSON();
    return ChannelMikroOrm.build({ ...json });
  }
}
