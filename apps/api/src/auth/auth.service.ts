import { Injectable, NotFoundException } from '@nestjs/common';
import { MemberRepository } from '@/accounts/domain/repositories/member.repository';
import { OrganizationRepository } from '@/accounts/domain/repositories/organization.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly memberRepo: MemberRepository,
    private readonly orgRepo: OrganizationRepository,
  ) {}

  async getMe(memberId: string) {
    const member = await this.memberRepo.findById(memberId);
    if (!member) throw new NotFoundException('Member not found');

    const organization = await this.orgRepo.findById(member.getOrganizationId());
    if (!organization) throw new NotFoundException('Organization not found');

    const org = organization.toJSON();

    return {
      member: member.toJSON(),
      organization: {
        id: org.id,
        name: org.name,
        slackTeamId: org.slackTeamId,
        hasLinear: org.linearAccessToken !== null,
        createdAt: org.createdAt,
      },
    };
  }
}
