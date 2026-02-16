import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountsModule } from '@/accounts/accounts.module';
import { MessagesModule } from '@/messages/messages.module';
import { UsersModule } from '@/users/users.module';

import { AccountMikroOrm } from './core/accounts/infrastructure/persistence/mikro-orm/models/account.mikroORM';
import { MemberMikroOrm } from './core/accounts/infrastructure/persistence/mikro-orm/models/member.mikroORM';
import { ChannelMikroOrm } from './core/channels/infrastructure/persistence/mikro-orm/models/channel.mikroORM';
import { MessageMikroOrm } from './core/messages/infrastructure/persistence/mikro-orm/models/message.mikroORM';
import { SlackInstallationMikroOrm } from './core/slack/infrastructure/persistence/mikro-orm/models/slack-installation.mikroORM';
import { SlackModule } from './core/slack/slack.module';
import { UserMikroOrm } from './core/users/infrastructure/persistence/mikro-orm/models/user.mikroORM';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    MikroOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        entities: [
          UserMikroOrm,
          AccountMikroOrm,
          MemberMikroOrm,
          ChannelMikroOrm,
          MessageMikroOrm,
          SlackInstallationMikroOrm,
        ],
        driver: PostgreSqlDriver,
        clientUrl: config.get<string>('DATABASE_URL'),
        allowGlobalContext: true,
      }),
      inject: [ConfigService],
    }),
    AccountsModule,
    UsersModule,
    SlackModule,
    MessagesModule,
  ],
})
export class AppModule {}
