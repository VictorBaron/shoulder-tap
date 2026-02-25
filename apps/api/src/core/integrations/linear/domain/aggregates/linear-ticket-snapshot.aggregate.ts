import { AggregateRoot, type AggregateRootProps } from 'common/domain';

interface LinearTicketSnapshotProps extends AggregateRootProps {
  organizationId: string;
  projectId: string | null;
  linearIssueId: string;
  identifier: string;
  title: string;
  description: string | null;
  stateName: string;
  stateType: string;
  priority: number;
  assigneeName: string | null;
  labelNames: string[];
  commentCount: number;
  snapshotDate: Date;
  snapshotWeekStart: Date;
}

export interface LinearTicketSnapshotJSON {
  id: string;
  organizationId: string;
  projectId: string | null;
  linearIssueId: string;
  identifier: string;
  title: string;
  description: string | null;
  stateName: string;
  stateType: string;
  priority: number;
  assigneeName: string | null;
  labelNames: string[];
  commentCount: number;
  snapshotDate: Date;
  snapshotWeekStart: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SnapshotProps {
  organizationId: string;
  projectId: string | null;
  linearIssueId: string;
  identifier: string;
  title: string;
  description: string | null;
  stateName: string;
  stateType: string;
  priority: number;
  assigneeName: string | null;
  labelNames: string[];
  commentCount: number;
  snapshotDate: Date;
  snapshotWeekStart: Date;
}

export class LinearTicketSnapshot extends AggregateRoot {
  private organizationId: string;
  private projectId: string | null;
  private linearIssueId: string;
  private identifier: string;
  private title: string;
  private description: string | null;
  private stateName: string;
  private stateType: string;
  private priority: number;
  private assigneeName: string | null;
  private labelNames: string[];
  private commentCount: number;
  private snapshotDate: Date;
  private snapshotWeekStart: Date;

  private constructor(props: LinearTicketSnapshotProps) {
    super(props);
    this.organizationId = props.organizationId;
    this.projectId = props.projectId;
    this.linearIssueId = props.linearIssueId;
    this.identifier = props.identifier;
    this.title = props.title;
    this.description = props.description;
    this.stateName = props.stateName;
    this.stateType = props.stateType;
    this.priority = props.priority;
    this.assigneeName = props.assigneeName;
    this.labelNames = props.labelNames;
    this.commentCount = props.commentCount;
    this.snapshotDate = props.snapshotDate;
    this.snapshotWeekStart = props.snapshotWeekStart;
  }

  static snapshot(props: SnapshotProps): LinearTicketSnapshot {
    const now = new Date();
    return new LinearTicketSnapshot({
      id: crypto.randomUUID(),
      ...props,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static reconstitute(props: LinearTicketSnapshotProps): LinearTicketSnapshot {
    return new LinearTicketSnapshot(props);
  }

  getOrganizationId(): string {
    return this.organizationId;
  }

  getProjectId(): string | null {
    return this.projectId;
  }

  getLinearIssueId(): string {
    return this.linearIssueId;
  }

  getIdentifier(): string {
    return this.identifier;
  }

  getTitle(): string {
    return this.title;
  }

  getStateType(): string {
    return this.stateType;
  }

  toJSON(): LinearTicketSnapshotJSON {
    return {
      id: this.id,
      organizationId: this.organizationId,
      projectId: this.projectId,
      linearIssueId: this.linearIssueId,
      identifier: this.identifier,
      title: this.title,
      description: this.description,
      stateName: this.stateName,
      stateType: this.stateType,
      priority: this.priority,
      assigneeName: this.assigneeName,
      labelNames: this.labelNames,
      commentCount: this.commentCount,
      snapshotDate: this.snapshotDate,
      snapshotWeekStart: this.snapshotWeekStart,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
