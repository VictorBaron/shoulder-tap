import type { AggregateRootJSON, AggregateRootProps } from 'common/domain';

export interface MessageProps extends AggregateRootProps {
  accountId: string;
  senderId: string;
  slackTs: string;
  slackChannelId: string;
  slackChannelType: string;
  slackThreadTs: string | null;
  text: string | null;
}

export interface CreateMessageProps {
  accountId: string;
  senderId: string;
  slackTs: string;
  slackChannelId: string;
  slackChannelType: string;
  slackThreadTs: string | null;
  text: string | null;
}

export interface MessageJSON extends AggregateRootJSON {
  accountId: string;
  senderId: string;
  slackTs: string;
  slackChannelId: string;
  slackChannelType: string;
  slackThreadTs: string | null;
  text: string | null;
}
