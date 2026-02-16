import { Injectable, NotFoundException } from '@nestjs/common';

import type { Member, MemberRepository } from '@/accounts/domain';

export class DisableMemberCommand {
  constructor(
    readonly props: {
      accountId: string;
      memberId: string;
      actor: Member;
    },
  ) {}
}

@Injectable()
export class DisableMemberHandler {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(command: DisableMemberCommand): Promise<Member> {
    const { actor, memberId } = command.props;

    const member = await this.memberRepository.findById(memberId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.disable(actor);
    await this.memberRepository.save(member);

    return member;
  }
}
