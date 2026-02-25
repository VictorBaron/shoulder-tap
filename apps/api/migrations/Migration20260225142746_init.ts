import { Migration } from '@mikro-orm/migrations';

export class Migration20260225142746_init extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "linear_ticket_snapshot" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "organization_id" varchar(255) not null, "project_id" varchar(255) null, "linear_issue_id" varchar(255) not null, "identifier" varchar(50) not null, "title" text not null, "description" text null, "state_name" varchar(100) not null, "state_type" varchar(50) not null, "priority" int not null, "assignee_name" varchar(255) null, "label_names" jsonb not null, "comment_count" int not null, "snapshot_date" timestamptz not null, "snapshot_week_start" timestamptz not null, constraint "linear_ticket_snapshot_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "linear_ticket_snapshot_linear_issue_id_snapshot_date_index" on "linear_ticket_snapshot" ("linear_issue_id", "snapshot_date");`,
    );
    this.addSql(
      `create index "linear_ticket_snapshot_project_id_snapshot_week_start_index" on "linear_ticket_snapshot" ("project_id", "snapshot_week_start");`,
    );

    this.addSql(
      `create table "member" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "email" varchar(255) not null, "name" varchar(255) not null, "slack_user_id" varchar(255) not null, "avatar_url" varchar(500) null, "role" varchar(50) not null, "organization_id" varchar(255) not null, constraint "member_pkey" primary key ("id"));`,
    );
    this.addSql(`alter table "member" add constraint "member_email_unique" unique ("email");`);
    this.addSql(`create index "member_organization_id_index" on "member" ("organization_id");`);

    this.addSql(
      `create table "organization" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "name" varchar(255) not null, "slack_team_id" varchar(255) not null, "slack_bot_token" text not null, "slack_user_tokens" jsonb not null, "linear_access_token" text null, constraint "organization_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "organization" add constraint "organization_slack_team_id_unique" unique ("slack_team_id");`,
    );

    this.addSql(
      `create table "project" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "name" varchar(255) not null, "emoji" varchar(10) not null, "organization_id" varchar(255) not null, "pm_lead_name" varchar(255) null, "tech_lead_name" varchar(255) null, "team_name" varchar(255) null, "target_date" timestamptz null, "week_number" int not null, "slack_channel_ids" jsonb not null, "linear_project_id" varchar(255) null, "linear_team_id" varchar(255) null, "notion_page_id" varchar(255) null, "product_objective" text null, "objective_origin" text null, "key_results" jsonb null, "is_active" boolean not null, constraint "project_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "project_organization_id_index" on "project" ("organization_id");`);

    this.addSql(
      `create table "report" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "project_id" varchar(255) not null, "week_start" timestamptz not null, "week_end" timestamptz not null, "week_number" int not null, "period_label" varchar(100) not null, "content" jsonb not null, "health" varchar(20) not null, "drift_level" varchar(20) not null, "progress" int not null, "prev_progress" int not null, "slack_message_count" int not null, "linear_ticket_count" int not null, "notion_pages_read" int not null, "model_used" varchar(100) not null, "prompt_tokens" int not null, "completion_tokens" int not null, "generation_time_ms" int not null, "generated_at" timestamptz not null, "slack_delivered_at" timestamptz null, "slack_message_ts" varchar(255) null, constraint "report_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "report_project_id_generated_at_index" on "report" ("project_id", "generated_at");`);
    this.addSql(
      `alter table "report" add constraint "report_project_id_week_start_unique" unique ("project_id", "week_start");`,
    );

    this.addSql(
      `create table "slack_installation" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "team_id" varchar(255) null, "team_name" varchar(255) null, "enterprise_id" varchar(255) null, "enterprise_name" varchar(255) null, "user_id" varchar(255) not null, "bot_token" text null, "user_token" text null, "bot_id" varchar(255) null, "bot_user_id" varchar(255) null, "token_type" varchar(50) null, "is_enterprise_install" boolean not null default false, "raw_installation" jsonb not null, "installed_at" timestamptz not null, constraint "slack_installation_pkey" primary key ("id"));`,
    );
    this.addSql(`create index "slack_installation_team_id_index" on "slack_installation" ("team_id");`);
    this.addSql(`create index "slack_installation_enterprise_id_index" on "slack_installation" ("enterprise_id");`);
    this.addSql(`create index "slack_installation_user_id_index" on "slack_installation" ("user_id");`);
    this.addSql(
      `alter table "slack_installation" add constraint "slack_installation_team_id_enterprise_id_unique" unique ("team_id", "enterprise_id");`,
    );

    this.addSql(
      `create table "slack_message" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, "organization_id" varchar(255) not null, "project_id" varchar(255) null, "channel_id" varchar(255) not null, "message_ts" varchar(255) not null, "thread_ts" varchar(255) null, "user_id" varchar(255) not null, "user_name" varchar(255) not null, "text" text not null, "is_bot" boolean not null, "has_files" boolean not null, "reaction_count" int not null, "reply_count" int not null, "is_filtered" boolean not null, "ingested_at" timestamptz not null, constraint "slack_message_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "slack_message_channel_id_ingested_at_index" on "slack_message" ("channel_id", "ingested_at");`,
    );
    this.addSql(
      `create index "slack_message_project_id_ingested_at_index" on "slack_message" ("project_id", "ingested_at");`,
    );
    this.addSql(
      `alter table "slack_message" add constraint "slack_message_channel_id_message_ts_unique" unique ("channel_id", "message_ts");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "linear_ticket_snapshot" cascade;`);

    this.addSql(`drop table if exists "member" cascade;`);

    this.addSql(`drop table if exists "organization" cascade;`);

    this.addSql(`drop table if exists "project" cascade;`);

    this.addSql(`drop table if exists "report" cascade;`);

    this.addSql(`drop table if exists "slack_installation" cascade;`);

    this.addSql(`drop table if exists "slack_message" cascade;`);
  }
}
