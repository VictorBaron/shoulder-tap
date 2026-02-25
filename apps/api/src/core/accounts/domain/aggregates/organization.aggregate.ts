import { AggregateRoot, type AggregateRootProps } from 'common/domain';

interface OrganizationProps extends AggregateRootProps {
  name: string;
  slackTeamId: string;
  slackBotToken: string;
  slackUserTokens: Record<string, string>;
  linearAccessToken: string | null;
}

export interface OrganizationJSON {
  id: string;
  name: string;
  slackTeamId: string;
  slackBotToken: string;
  slackUserTokens: Record<string, string>;
  linearAccessToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateOrganizationProps {
  name: string;
  slackTeamId: string;
  slackBotToken: string;
}

export class Organization extends AggregateRoot {
  private name: string;
  private slackTeamId: string;
  private slackBotToken: string;
  private slackUserTokens: Record<string, string>;
  private linearAccessToken: string | null;

  private constructor(props: OrganizationProps) {
    super(props);
    this.name = props.name;
    this.slackTeamId = props.slackTeamId;
    this.slackBotToken = props.slackBotToken;
    this.slackUserTokens = props.slackUserTokens;
    this.linearAccessToken = props.linearAccessToken;
  }

  static create(props: CreateOrganizationProps): Organization {
    const now = new Date();
    return new Organization({
      id: crypto.randomUUID(),
      name: props.name,
      slackTeamId: props.slackTeamId,
      slackBotToken: props.slackBotToken,
      slackUserTokens: {},
      linearAccessToken: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static reconstitute(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  getName(): string {
    return this.name;
  }

  getSlackTeamId(): string {
    return this.slackTeamId;
  }

  getSlackBotToken(): string {
    return this.slackBotToken;
  }

  getSlackUserTokens(): Record<string, string> {
    return this.slackUserTokens;
  }

  getLinearAccessToken(): string | null {
    return this.linearAccessToken;
  }

  updateSlackBotToken(token: string): void {
    this.slackBotToken = token;
    this.updatedAt = new Date();
  }

  addSlackUserToken(userId: string, token: string): void {
    this.slackUserTokens = { ...this.slackUserTokens, [userId]: token };
    this.updatedAt = new Date();
  }

  connectLinear(token: string): void {
    this.linearAccessToken = token;
    this.updatedAt = new Date();
  }

  toJSON(): OrganizationJSON {
    return {
      id: this.id,
      name: this.name,
      slackTeamId: this.slackTeamId,
      slackBotToken: this.slackBotToken,
      slackUserTokens: this.slackUserTokens,
      linearAccessToken: this.linearAccessToken,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
