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
    @Inject(SLACK_USERS_GATEWAY)
    private readonly slackUsersGateway: SlackUsersGateway,
  ) {}

  async execute(command: ProvisionAccountFromSlackCommand): Promise<void> {
    const { teamId, teamName, botToken, installerSlackUserId } = command.props;

    const existing = await this.accountRepository.findBySlackTeamId(teamId);
    if (existing) return;

    const slackUsers = await this.slackUsersGateway.listTeamMembers(botToken);

    const account = Account.create({
      name: teamName,
      slackTeamId: teamId,
    });

    const eligibleUsers = slackUsers.filter((u) => !u.isBot && !u.deleted);

    for (const slackUser of eligibleUsers) {
      const user = await this.findOrCreateUser(slackUser);

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

    await this.accountRepository.save(account);
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
