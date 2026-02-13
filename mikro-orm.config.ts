import 'dotenv/config';

import { defineConfig } from '@mikro-orm/postgresql';

import { AccountMikroOrm } from './src/core/accounts/infrastructure/persistence/mikro-orm/models/account.mikroORM';
import { MemberMikroOrm } from './src/core/accounts/infrastructure/persistence/mikro-orm/models/member.mikroORM';
import { SlackInstallationMikroOrm } from './src/core/slack/infrastructure/persistence/mikro-orm/models/slack-installation.mikroORM';
import { UserMikroOrm } from './src/core/users/infrastructure/persistence/mikro-orm/models/user.mikroORM';

export default defineConfig({
  entities: [
    UserMikroOrm,
    AccountMikroOrm,
    MemberMikroOrm,
    SlackInstallationMikroOrm,
  ],
  clientUrl: process.env.DATABASE_URL,
  migrations: {
    path: './migrations',
    tableName: 'mikro_orm_migrations',
    transactional: true,
  },
});
