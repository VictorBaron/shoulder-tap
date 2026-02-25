import { Organization } from '@/accounts/domain/aggregates/organization.aggregate';
import { OrganizationMikroOrm } from '../models/organization.mikroORM';

export class OrganizationMapper {
  static toDomain(raw: OrganizationMikroOrm): Organization {
    return Organization.reconstitute({
      id: raw.id,
      name: raw.name,
      slackTeamId: raw.slackTeamId,
      slackBotToken: raw.slackBotToken,
      slackUserTokens: raw.slackUserTokens ?? {},
      linearAccessToken: raw.linearAccessToken,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(organization: Organization): OrganizationMikroOrm {
    const json = organization.toJSON();
    return OrganizationMikroOrm.build({
      id: json.id,
      name: json.name,
      slackTeamId: json.slackTeamId,
      slackBotToken: json.slackBotToken,
      slackUserTokens: json.slackUserTokens,
      linearAccessToken: json.linearAccessToken,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      deletedAt: json.deletedAt,
    });
  }
}
