import { AggregateRoot, type AggregateRootProps } from 'common/domain';

interface SlackMessageProps extends AggregateRootProps {
  organizationId: string;
  projectId: string | null;
  channelId: string;
  messageTs: string;
  threadTs: string | null;
  userId: string;
  userName: string;
  text: string;
  isBot: boolean;
  hasFiles: boolean;
  reactionCount: number;
  replyCount: number;
  isFiltered: boolean;
  ingestedAt: Date;
}

export interface SlackMessageJSON {
  id: string;
  organizationId: string;
  projectId: string | null;
  channelId: string;
  messageTs: string;
  threadTs: string | null;
  userId: string;
  userName: string;
  text: string;
  isBot: boolean;
  hasFiles: boolean;
  reactionCount: number;
  replyCount: number;
  isFiltered: boolean;
  ingestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IngestSlackMessageProps {
  organizationId: string;
  projectId: string | null;
  channelId: string;
  messageTs: string;
  threadTs: string | null;
  userId: string;
  userName: string;
  text: string;
  isBot: boolean;
  hasFiles: boolean;
  reactionCount: number;
  replyCount: number;
}

export class SlackMessage extends AggregateRoot {
  private organizationId: string;
  private projectId: string | null;
  private channelId: string;
  private messageTs: string;
  private threadTs: string | null;
  private userId: string;
  private userName: string;
  private text: string;
  private isBot: boolean;
  private hasFiles: boolean;
  private reactionCount: number;
  private replyCount: number;
  private isFiltered: boolean;
  private ingestedAt: Date;

  private constructor(props: SlackMessageProps) {
    super(props);
    this.organizationId = props.organizationId;
    this.projectId = props.projectId;
    this.channelId = props.channelId;
    this.messageTs = props.messageTs;
    this.threadTs = props.threadTs;
    this.userId = props.userId;
    this.userName = props.userName;
    this.text = props.text;
    this.isBot = props.isBot;
    this.hasFiles = props.hasFiles;
    this.reactionCount = props.reactionCount;
    this.replyCount = props.replyCount;
    this.isFiltered = props.isFiltered;
    this.ingestedAt = props.ingestedAt;
  }

  static ingest(props: IngestSlackMessageProps): SlackMessage {
    const now = new Date();
    return new SlackMessage({
      id: crypto.randomUUID(),
      ...props,
      isFiltered: false,
      ingestedAt: now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static reconstitute(props: SlackMessageProps): SlackMessage {
    return new SlackMessage(props);
  }

  getOrganizationId(): string {
    return this.organizationId;
  }

  getProjectId(): string | null {
    return this.projectId;
  }

  getChannelId(): string {
    return this.channelId;
  }

  getMessageTs(): string {
    return this.messageTs;
  }

  getText(): string {
    return this.text;
  }

  getIsFiltered(): boolean {
    return this.isFiltered;
  }

  markFiltered(): void {
    this.isFiltered = true;
    this.updatedAt = new Date();
  }

  toJSON(): SlackMessageJSON {
    return {
      id: this.id,
      organizationId: this.organizationId,
      projectId: this.projectId,
      channelId: this.channelId,
      messageTs: this.messageTs,
      threadTs: this.threadTs,
      userId: this.userId,
      userName: this.userName,
      text: this.text,
      isBot: this.isBot,
      hasFiles: this.hasFiles,
      reactionCount: this.reactionCount,
      replyCount: this.replyCount,
      isFiltered: this.isFiltered,
      ingestedAt: this.ingestedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
