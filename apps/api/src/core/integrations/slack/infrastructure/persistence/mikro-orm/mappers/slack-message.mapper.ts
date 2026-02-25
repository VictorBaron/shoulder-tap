import { SlackMessage } from '@/integrations/slack/domain/aggregates/slack-message.aggregate';
import { SlackMessageMikroOrm } from '../models/slack-message.mikroORM';

export class SlackMessageMapper {
  static toDomain(raw: SlackMessageMikroOrm): SlackMessage {
    return SlackMessage.reconstitute({
      id: raw.id,
      organizationId: raw.organizationId,
      projectId: raw.projectId,
      channelId: raw.channelId,
      messageTs: raw.messageTs,
      threadTs: raw.threadTs,
      userId: raw.userId,
      userName: raw.userName,
      text: raw.text,
      isBot: raw.isBot,
      hasFiles: raw.hasFiles,
      reactionCount: raw.reactionCount,
      replyCount: raw.replyCount,
      isFiltered: raw.isFiltered,
      ingestedAt: raw.ingestedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(message: SlackMessage): SlackMessageMikroOrm {
    const json = message.toJSON();
    return SlackMessageMikroOrm.build({
      id: json.id,
      organizationId: json.organizationId,
      projectId: json.projectId,
      channelId: json.channelId,
      messageTs: json.messageTs,
      threadTs: json.threadTs,
      userId: json.userId,
      userName: json.userName,
      text: json.text,
      isBot: json.isBot,
      hasFiles: json.hasFiles,
      reactionCount: json.reactionCount,
      replyCount: json.replyCount,
      isFiltered: json.isFiltered,
      ingestedAt: json.ingestedAt,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      deletedAt: json.deletedAt,
    });
  }
}
