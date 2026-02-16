export interface SlackChannelInfo {
  slackChannelId: string;
  name: string;
  topic: string;
  purpose: string;
  isPrivate: boolean;
  isArchived: boolean;
  memberCount: number;
}

export const SLACK_CHANNELS_GATEWAY = 'SLACK_CHANNELS_GATEWAY';

export interface SlackChannelsGateway {
  listTeamChannels(botToken: string): Promise<SlackChannelInfo[]>;
}
