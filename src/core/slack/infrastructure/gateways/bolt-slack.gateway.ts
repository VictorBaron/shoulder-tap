import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { App, ExpressReceiver, type InstallationStore } from '@slack/bolt';
import type { Application } from 'express';

import { AccountRepository } from '@/accounts/domain';
import { FilterIncomingMessageCommand } from '@/messages/application/commands/filter-incoming-message';
import { SlackGateway } from '@/slack/domain/slack.gateway';
import { INSTALLATION_STORE } from '@/slack/infrastructure/persistence/installation-store.token';
import { isGenericMessage } from '@/slack/types';
import { UserRepository } from '@/users/domain/repositories/user.repository';

const SLACK_SCOPES = [
  'chat:write',
  'im:write',
  'users:read',
  'users:read.email',
  'reactions:read',
] as const;

const USER_SCOPES = [
  'channels:history',
  'groups:history',
  'im:history',
  'mpim:history',
  'channels:read',
  'groups:read',
  'im:read',
  'mpim:read',
  'users:read',
  'reactions:read',
] as const;

@Injectable()
export class BoltSlackGateway implements SlackGateway, OnModuleInit {
  private bolt: App;
  private receiver: ExpressReceiver;
  private readonly logger = new Logger(BoltSlackGateway.name);

  constructor(
    private config: ConfigService,
    private commandBus: CommandBus,
    @Inject(INSTALLATION_STORE)
    private installationStore: InstallationStore,
    @Inject(AccountRepository)
    private accountRepository: AccountRepository,
    @Inject(UserRepository)
    private userRepository: UserRepository,
  ) {
    this.receiver = new ExpressReceiver({
      signingSecret: this.config.getOrThrow('SLACK_SIGNING_SECRET'),
      clientId: this.config.get('SLACK_CLIENT_ID'),
      clientSecret: this.config.get('SLACK_CLIENT_SECRET'),
      stateSecret: this.config.getOrThrow('SLACK_STATE_SECRET'),
      scopes: [...SLACK_SCOPES],
      endpoints: { events: '/events' },
      installerOptions: {
        userScopes: [...USER_SCOPES],
        installPath: '/install',
        redirectUriPath: '/oauth/callback',
      },
      installationStore: this.installationStore,
      redirectUri: `${this.config.getOrThrow('SLACK_REDIRECT_URI')}/slack/oauth/callback`,
    });

    this.bolt = new App({ receiver: this.receiver });
  }

  onModuleInit() {
    this.registerEventHandlers();
  }

  getExpressApp(): Application {
    return this.receiver.app;
  }

  private registerEventHandlers() {
    this.bolt.event('message', async ({ event }) => {
      if (!isGenericMessage(event)) return;

      const account = await this.accountRepository.findBySlackTeamId(
        event.team!,
      );
      if (!account) {
        this.logger.warn(`No account found for Slack team ${event.team}`);
        return;
      }

      const user = await this.userRepository.findBySlackId(event.user);
      if (!user) {
        this.logger.warn(`No user found for Slack user ${event.user}`);
        return;
      }

      await this.commandBus.execute(
        new FilterIncomingMessageCommand({
          accountId: account.getId(),
          senderId: user.getId(),
          message: event,
        }),
      );
    });

    this.bolt.event('reaction_added', async ({ event }) => {
      console.log(event);
      await Promise.resolve(
        console.log('Reaction added:', {
          user: event.user,
          reaction: event.reaction,
          itemUser: event.item_user,
        }),
      );
    });
  }
}
