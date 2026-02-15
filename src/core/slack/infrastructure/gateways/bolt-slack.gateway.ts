import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { App, ExpressReceiver, type InstallationStore } from '@slack/bolt';
import type { Application } from 'express';

import { FilterIncomingMessageCommand } from '@/filtering/application/commands/filter-incoming-message.command';
import { SlackGateway } from '@/slack/domain/slack.gateway';
import { INSTALLATION_STORE } from '@/slack/infrastructure/persistence/installation-store.token';
import { isGenericMessage } from '@/slack/types';

const SLACK_SCOPES = [
  'chat:write',
  'im:write',
  'users:read',
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

  constructor(
    private config: ConfigService,
    private commandBus: CommandBus,
    @Inject(INSTALLATION_STORE)
    private installationStore: InstallationStore,
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

    this.bolt.use(async ({ body, next }) => {
      // You should see `type: "events_api"` envelopes and inside them `event.type`
      console.log('INCOMING:', JSON.stringify(body, null, 2));
      await next();
    });
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

      await this.commandBus.execute(
        new FilterIncomingMessageCommand({ message: event }),
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
