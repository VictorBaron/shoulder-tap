import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/auth.module';

import { ChannelsModule } from '@/channels/channels.module';
import { UserPersistenceModule } from '@/users/infrastructure';

import { AccountsController } from './accounts.controller';
import {
  AcceptInvitationHandler,
  ChangeMemberRoleHandler,
  CreateAccountHandler,
  DeleteAccountHandler,
  DisableMemberHandler,
  EnableMemberHandler,
  InviteMemberHandler,
  UpdateAccountHandler,
} from './application/commands';
import { ProvisionAccountFromSlackHandler } from './application/commands/provision-account-from-slack';
import {
  GetAccountByIdHandler,
  GetAccountMembersHandler,
  GetPendingInvitationsHandler,
  GetUserAccountsHandler,
} from './application/queries';
import { SLACK_USERS_GATEWAY } from './domain/gateways/slack-users.gateway';
import { WebApiSlackUsersGateway } from './infrastructure/gateways/web-api-slack-users.gateway';
import { AccountPersistenceModule } from './infrastructure/persistence/account-persistence.module';
import { InvitationsController, MembersController } from './members.controller';

@Module({
  imports: [
    AuthModule,
    AccountPersistenceModule.use('orm'),
    UserPersistenceModule.use('orm'),
    ChannelsModule,
  ],
  controllers: [AccountsController, MembersController, InvitationsController],
  providers: [
    CreateAccountHandler,
    UpdateAccountHandler,
    DeleteAccountHandler,
    InviteMemberHandler,
    AcceptInvitationHandler,
    DisableMemberHandler,
    EnableMemberHandler,
    ChangeMemberRoleHandler,
    ProvisionAccountFromSlackHandler,
    { provide: SLACK_USERS_GATEWAY, useClass: WebApiSlackUsersGateway },
    GetAccountByIdHandler,
    GetUserAccountsHandler,
    GetAccountMembersHandler,
    GetPendingInvitationsHandler,
  ],
  exports: [
    GetAccountByIdHandler,
    GetUserAccountsHandler,
    GetAccountMembersHandler,
    GetPendingInvitationsHandler,
    ProvisionAccountFromSlackHandler,
  ],
})
export class AccountsModule {}
