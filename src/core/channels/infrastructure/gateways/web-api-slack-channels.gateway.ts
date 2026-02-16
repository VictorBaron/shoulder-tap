import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';

import type {
  SlackChannelInfo,
  SlackChannelsGateway,
} from '@/channels/domain/gateways/slack-channels.gateway';

@Injectable()
export class WebApiSlackChannelsGateway implements SlackChannelsGateway {
  async listTeamChannels(botToken: string): Promise<SlackChannelInfo[]> {
    const client = new WebClient(botToken);
    const channels: SlackChannelInfo[] = [];
    let cursor: string | undefined;

    do {
      const response = await client.conversations.list({
        cursor,
        limit: 200,
        exclude_archived: false,
        types: 'public_channel,private_channel',
      });

      for (const channel of response.channels ?? []) {
        if (!channel.id) continue;
        channels.push({
          slackChannelId: channel.id,
          name: channel.name ?? '',
          topic: channel.topic?.value ?? '',
          purpose: channel.purpose?.value ?? '',
          isPrivate: channel.is_private ?? false,
          isArchived: channel.is_archived ?? false,
          memberCount: channel.num_members ?? 0,
        });
      }

      cursor = response.response_metadata?.next_cursor || undefined;
    } while (cursor);

    return channels;
  }
}
