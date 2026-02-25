import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MemberRepository } from './domain/repositories/member.repository';
import { OrganizationRepository } from './domain/repositories/organization.repository';
import { MemberRepositoryMikroOrm } from './infrastructure/persistence/mikro-orm/member.repository.mikroORM';
import { MemberMikroOrm } from './infrastructure/persistence/mikro-orm/models/member.mikroORM';
import { OrganizationMikroOrm } from './infrastructure/persistence/mikro-orm/models/organization.mikroORM';
import { OrganizationRepositoryMikroOrm } from './infrastructure/persistence/mikro-orm/organization.repository.mikroORM';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([OrganizationMikroOrm, MemberMikroOrm])],
  providers: [
    { provide: OrganizationRepository, useClass: OrganizationRepositoryMikroOrm },
    { provide: MemberRepository, useClass: MemberRepositoryMikroOrm },
  ],
  exports: [OrganizationRepository, MemberRepository],
})
export class AccountsModule {}
