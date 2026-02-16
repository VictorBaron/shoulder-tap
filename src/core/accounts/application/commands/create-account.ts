import { Injectable } from '@nestjs/common';

import {
  Account,
  AccountRepository,
  Member,
  MemberRepository,
} from '@/accounts/domain';

export class CreateAccountCommand {
  constructor(
    readonly props: {
      name: string;
      creatorUserId: string;
      slackTeamId: string;
    },
  ) {}
}

@Injectable()
export class CreateAccountHandler {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async execute(command: CreateAccountCommand): Promise<Account> {
    const { name, creatorUserId, slackTeamId } = command.props;

    const account = Account.create({
      name,
      slackTeamId,
    });

    const founder = Member.createFounder({
      accountId: account.getId(),
      userId: creatorUserId,
    });

    await this.accountRepository.save(account);
    await this.memberRepository.save(founder);

    return account;
  }
}
