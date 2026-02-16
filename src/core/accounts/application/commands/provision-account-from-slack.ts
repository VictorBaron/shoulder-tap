import { Inject, Injectable } from '@nestjs/common';

import {
  Account,
  AccountRepository,
  Member,
  MemberRepository,
} from '@/accounts/domain';
import {
  SLACK_USERS_GATEWAY,
  type SlackUsersGateway,
} from '@/accounts/domain/gateways/slack-users.gateway';
import { Channel, ChannelRepository } from '@/channels/domain';
import {
  SLACK_CHANNELS_GATEWAY,
  type SlackChannelsGateway,
} from '@/channels/domain/gateways/slack-channels.gateway';
import { User, UserRepository } from '@/users/domain';

export class ProvisionAccountFromSlackCommand {
  constructor(
    readonly props: {
      teamId: string;
      teamName: string;
      botToken: string;
      installerSlackUserId: string;
    },
  ) {}
}

@Injectable()
export class ProvisionAccountFromSlackHandler {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly memberRepository: MemberRepository,
    private readonly userRepository: UserRepository,
    private readonly channelRepository: ChannelRepository,
    @Inject(SLACK_USERS_GATEWAY)
    private readonly slackUsersGateway: SlackUsersGateway,
    @Inject(SLACK_CHANNELS_GATEWAY)
    private readonly slackChannelsGateway: SlackChannelsGateway,
  ) {}

  async execute(command: ProvisionAccountFromSlackCommand): Promise<void> {
    const { teamId, teamName, botToken, installerSlackUserId } = command.props;

    const account = await this.findOrCreateAccount({ teamId, teamName });

    await this.importUsers({ account, botToken, installerSlackUserId });
    await this.importChannels({ account, botToken });
  }

  private async findOrCreateAccount({
    teamId,
    teamName,
  }: {
    teamId: string;
    teamName: string;
  }): Promise<Account> {
    const existing = await this.accountRepository.findBySlackTeamId(teamId);
    if (existing) return existing;

    const account = Account.create({ name: teamName, slackTeamId: teamId });
    await this.accountRepository.save(account);
    return account;
  }

  private async importUsers({
    account,
    botToken,
    installerSlackUserId,
  }: {
    account: Account;
    botToken: string;
    installerSlackUserId: string;
  }): Promise<void> {
    const slackUsers = await this.slackUsersGateway.listTeamMembers(botToken);
    const eligibleUsers = slackUsers.filter((u) => !u.isBot && !u.deleted);

    for (const slackUser of eligibleUsers) {
      const user = await this.findOrCreateUser(slackUser);

      const existingMember =
        await this.memberRepository.findByAccountIdAndUserId({
          accountId: account.getId(),
          userId: user.getId(),
        });
      if (existingMember) continue;

      const isInstaller = slackUser.slackId === installerSlackUserId;
      const member = isInstaller
        ? Member.createFounder({
            accountId: account.getId(),
            userId: user.getId(),
          })
        : Member.createActive({
            accountId: account.getId(),
            userId: user.getId(),
          });

      await this.memberRepository.save(member);
    }
  }

  private async importChannels({
    account,
    botToken,
  }: {
    account: Account;
    botToken: string;
  }): Promise<void> {
    const slackChannels =
      await this.slackChannelsGateway.listTeamChannels(botToken);

    for (const sc of slackChannels) {
      const existing = await this.channelRepository.findBySlackChannelId({
        accountId: account.getId(),
        slackChannelId: sc.slackChannelId,
      });

      if (existing) {
        existing.update({
          name: sc.name,
          topic: sc.topic,
          purpose: sc.purpose,
          isPrivate: sc.isPrivate,
          isArchived: sc.isArchived,
          memberCount: sc.memberCount,
        });
        await this.channelRepository.save(existing);
      } else {
        const channel = Channel.create({
          accountId: account.getId(),
          slackChannelId: sc.slackChannelId,
          name: sc.name,
          topic: sc.topic,
          purpose: sc.purpose,
          isPrivate: sc.isPrivate,
          isArchived: sc.isArchived,
          memberCount: sc.memberCount,
        });
        await this.channelRepository.save(channel);
      }
    }
  }

  private async findOrCreateUser(slackUser: {
    slackId: string;
    email: string | null;
    name: string;
  }): Promise<User> {
    const existing = await this.userRepository.findBySlackId(slackUser.slackId);
    if (existing) return existing;

    const user = User.createFromSlack({
      slackId: slackUser.slackId,
      email: slackUser.email ?? `${slackUser.slackId}@slack.placeholder`,
      name: slackUser.name,
    });

    await this.userRepository.save(user);
    return user;
  }
}
