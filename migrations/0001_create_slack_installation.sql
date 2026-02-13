CREATE TABLE IF NOT EXISTS "slack_installation" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz,
  "team_id" varchar(255),
  "enterprise_id" varchar(255),
  "user_id" varchar(255) NOT NULL,
  "bot_token" text,
  "user_token" text,
  "bot_id" varchar(255),
  "bot_user_id" varchar(255),
  "token_type" varchar(50),
  "is_enterprise_install" boolean NOT NULL DEFAULT false,
  "raw_installation" jsonb NOT NULL,
  "installed_at" timestamptz NOT NULL,
  CONSTRAINT "slack_installation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "slack_installation_team_id_enterprise_id_unique" UNIQUE ("team_id", "enterprise_id")
);

CREATE INDEX IF NOT EXISTS "slack_installation_team_id_index" ON "slack_installation" ("team_id");
CREATE INDEX IF NOT EXISTS "slack_installation_enterprise_id_index" ON "slack_installation" ("enterprise_id");
