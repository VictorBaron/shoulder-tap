import { AggregateRoot, type AggregateRootProps } from 'common/domain';

export type MemberRole = 'admin' | 'member';

interface MemberProps extends AggregateRootProps {
  email: string;
  name: string;
  slackUserId: string;
  avatarUrl: string | null;
  role: MemberRole;
  organizationId: string;
}

export interface MemberJSON {
  id: string;
  email: string;
  name: string;
  slackUserId: string;
  avatarUrl: string | null;
  role: MemberRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateMemberProps {
  email: string;
  name: string;
  slackUserId: string;
  avatarUrl: string | null;
  role: MemberRole;
  organizationId: string;
}

export class Member extends AggregateRoot {
  private email: string;
  private name: string;
  private slackUserId: string;
  private avatarUrl: string | null;
  private role: MemberRole;
  private organizationId: string;

  private constructor(props: MemberProps) {
    super(props);
    this.email = props.email;
    this.name = props.name;
    this.slackUserId = props.slackUserId;
    this.avatarUrl = props.avatarUrl;
    this.role = props.role;
    this.organizationId = props.organizationId;
  }

  static create(props: CreateMemberProps): Member {
    const now = new Date();
    return new Member({
      id: crypto.randomUUID(),
      ...props,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static reconstitute(props: MemberProps): Member {
    return new Member(props);
  }

  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }

  getSlackUserId(): string {
    return this.slackUserId;
  }

  getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  getRole(): MemberRole {
    return this.role;
  }

  getOrganizationId(): string {
    return this.organizationId;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  toJSON(): MemberJSON {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      slackUserId: this.slackUserId,
      avatarUrl: this.avatarUrl,
      role: this.role,
      organizationId: this.organizationId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
