import { Installation } from '@slack/bolt';

import { SlackInstallation } from '@/slack/domain/slack-installation.aggregate';

import { SlackInstallationMikroOrm } from './models/slack-installation.mikroORM';

export class SlackInstallationMapper {
  static toDomain(raw: SlackInstallationMikroOrm): SlackInstallation {
    return SlackInstallation.reconstitute({
      id: raw.id,
      teamId: raw.teamId,
      teamName: raw.teamName,
      enterpriseId: raw.enterpriseId,
      enterpriseName: raw.enterpriseName,
      userId: raw.userId,
      botToken: raw.botToken,
      userToken: raw.userToken,
      botId: raw.botId,
      botUserId: raw.botUserId,
      tokenType: raw.tokenType,
      isEnterpriseInstall: raw.isEnterpriseInstall,
      rawInstallation: raw.rawInstallation,
      installedAt: raw.installedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersistence(
    slackInstallation: SlackInstallation,
  ): SlackInstallationMikroOrm {
    const json = slackInstallation.toJSON();
    const entity = new SlackInstallationMikroOrm();
    entity.id = json.id;
    entity.teamId = json.teamId;
    entity.teamName = json.teamName;
    entity.enterpriseId = json.enterpriseId;
    entity.enterpriseName = json.enterpriseName;
    entity.userId = json.userId;
    entity.botToken = json.botToken;
    entity.userToken = json.userToken;
    entity.botId = json.botId;
    entity.botUserId = json.botUserId;
    entity.tokenType = json.tokenType;
    entity.isEnterpriseInstall = json.isEnterpriseInstall;
    entity.rawInstallation = json.rawInstallation;
    entity.installedAt = json.installedAt;
    return entity;
  }

  static toInstallation(
    slackInstallation: SlackInstallation,
  ): Installation<'v1' | 'v2', boolean> {
    const json = slackInstallation.toJSON();
    return {
      team: { id: json.teamId ?? '', name: json.teamName ?? '' },
      enterprise: {
        id: json.enterpriseId ?? '',
        name: json.enterpriseName ?? '',
      },
      user: {
        id: json.userId,
        token: json.userToken ?? undefined,
        scopes: undefined,
      },
      bot:
        json.botId && json.botToken && json.botUserId
          ? {
              id: json.botId,
              token: json.botToken,
              userId: json.botUserId,
              scopes: [],
            }
          : undefined,
      tokenType: json.tokenType === 'bot' ? 'bot' : undefined,
      isEnterpriseInstall: json.isEnterpriseInstall,
      appId: process.env.SLACK_APP_ID,
      metadata: undefined,
    };
  }
}
