import { LinearTicketSnapshot } from '@/integrations/linear/domain/aggregates/linear-ticket-snapshot.aggregate';
import { LinearTicketSnapshotMikroOrm } from '../models/linear-ticket-snapshot.mikroORM';

export class LinearTicketSnapshotMapper {
  static toDomain(raw: LinearTicketSnapshotMikroOrm): LinearTicketSnapshot {
    return LinearTicketSnapshot.reconstitute({
      id: raw.id,
      organizationId: raw.organizationId,
      projectId: raw.projectId,
      linearIssueId: raw.linearIssueId,
      identifier: raw.identifier,
      title: raw.title,
      description: raw.description,
      stateName: raw.stateName,
      stateType: raw.stateType,
      priority: raw.priority,
      assigneeName: raw.assigneeName,
      labelNames: raw.labelNames,
      commentCount: raw.commentCount,
      snapshotDate: raw.snapshotDate,
      snapshotWeekStart: raw.snapshotWeekStart,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(snapshot: LinearTicketSnapshot): LinearTicketSnapshotMikroOrm {
    const json = snapshot.toJSON();
    return LinearTicketSnapshotMikroOrm.build({
      id: json.id,
      organizationId: json.organizationId,
      projectId: json.projectId,
      linearIssueId: json.linearIssueId,
      identifier: json.identifier,
      title: json.title,
      description: json.description,
      stateName: json.stateName,
      stateType: json.stateType,
      priority: json.priority,
      assigneeName: json.assigneeName,
      labelNames: json.labelNames,
      commentCount: json.commentCount,
      snapshotDate: json.snapshotDate,
      snapshotWeekStart: json.snapshotWeekStart,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      deletedAt: json.deletedAt,
    });
  }
}
