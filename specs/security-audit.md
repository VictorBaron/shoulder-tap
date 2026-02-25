# Security Audit Report — Drift API

**Date:** 2026-02-25
**Scope:** `apps/api/src/` — post step-03 (Slack OAuth / Auth implementation)

---

## A01: Broken Access Control

**Severity: HIGH**

**No authorization on the `/auth/me` endpoint beyond authentication.** The `getMe` handler looks up the member by `sub` from the JWT, which is correct. However, the `AuthService.getMe` response includes:

```typescript
// apps/api/src/auth/auth.service.ts:19-29
return {
  member: member.toJSON(),   // includes role, orgId, slackUserId, email...
  organization: { ... hasLinear, ... }
};
```

`member.toJSON()` returns the full `MemberJSON` including `organizationId`, `role`, `slackUserId`. This is acceptable for the `/me` endpoint, but the concern is there are no other HTTP controllers yet — the surface is minimal. As you add more controllers, every endpoint needs a guard.

**Current guard coverage:** Only `/auth/me` has `@UseGuards(JwtAuthGuard)`. The health endpoint is deliberately public. All other modules (projects, reports, integrations, pipeline, scheduler) have no HTTP controllers yet.

**Risk:** As controllers are added, there is no global guard fallback. The app currently applies `JwtAuthGuard` manually per route — one missed decorator means an unprotected endpoint.

**Recommendation:** Register `JwtAuthGuard` as a global guard in `AppModule` using `APP_GUARD`, and use a `@Public()` decorator to explicitly opt out on the health endpoint and OAuth callback.

**No organization-level authorization.** The JWT payload is:
```typescript
// apps/api/src/auth/current-user.decorator.ts
export interface JwtPayload {
  sub: string;   // memberId
  orgId: string; // organizationId
}
```

When future controllers serve projects/reports by ID, they must verify `project.organizationId === user.orgId` to prevent IDOR (Insecure Direct Object Reference). There is currently no enforcement layer for this — it will need to be built into each query handler.

---

## A02: Cryptographic Failures

**Severity: MEDIUM**

**AES-256-CBC instead of AES-256-GCM.** The `TokenEncryption` service uses `aes-256-cbc`:

```typescript
// apps/api/src/auth/token-encryption.ts
const ALGORITHM = 'aes-256-cbc';
```

CBC mode provides confidentiality but no authentication. This means a modified ciphertext will decrypt to garbage without raising an error — there is no integrity check. An attacker who can flip bits in a stored token (via a DB write) could produce a different decrypted value without detection. AES-256-GCM provides authenticated encryption (AEAD) and is the correct choice.

**User tokens stored in plaintext.** The Slack `userToken` is stored in two places:
1. `slack_installation.userToken` (text column, no encryption)
2. `organization.slackUserTokens` (JSONB column, no encryption)

Only the `slackBotToken` on `Organization` gets encrypted via `tokenEncryption.encrypt()`. The `userToken` in `SlackInstallation` and `Organization.slackUserTokens` are stored as raw OAuth tokens. These are user-delegated credentials with `channels:history` scope — a DB breach exposes them in full.

```typescript
// apps/api/src/core/slack/infrastructure/gateways/bolt-slack.gateway.ts:110
if (userToken) org.addSlackUserToken(userId, userToken);  // stored plaintext
```

**JWT expiry is 30 days.** Long-lived tokens increase the window of exposure if a cookie is stolen. Since there is no token revocation mechanism (no refresh token, no session store), a compromised JWT remains valid for 30 days.

---

## A03: Injection

**Severity: LOW (currently safe, watch going forward)**

MikroORM is used for all DB queries via its entity manager, which parameterizes queries by default. No raw SQL was found. No `em.getConnection().execute()` calls exist.

No command injection vectors found (no `child_process`, no `exec`).

**One item to watch:** The `ParseJsonOutputService` receives raw LLM output and calls `JSON.parse()` on it after stripping markdown fences. This is safe from injection but could lead to DoS from excessively large payloads if the LLM response is not length-bounded before parsing.

---

## A05: Security Misconfiguration

**Severity: HIGH**

**No Helmet.** `main.ts` does not use `helmet`:

```typescript
// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ ... });
  // No helmet()
}
```

Missing security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, `X-XSS-Protection`, `Referrer-Policy`.

**No rate limiting.** `@nestjs/throttler` is listed in `dependencies` but `ThrottlerModule` is never imported in `AppModule` and `ThrottlerGuard` is never registered. The OAuth callback endpoint at `/slack/oauth/callback` and the `/auth/me` endpoint are completely unprotected against brute force or enumeration.

**`SLACK_APP_ID` read from `process.env` directly** in the mapper:

```typescript
// apps/api/src/core/slack/infrastructure/persistence/mikro-orm/slack-installation.mapper.ts:78
appId: process.env.SLACK_APP_ID,
```

This bypasses the `ConfigService` pattern used elsewhere and silently returns `undefined` if the variable is not set.

**MikroORM `allowGlobalContext: true`** in `AppModule`:

```typescript
allowGlobalContext: true,
```

This is a development shortcut that disables entity manager context isolation. In production this is a data integrity risk (cross-request data leaks).

**`SLACK_STATE_SECRET=EoleIsMyLove4Ever`** — the state secret is a human-memorable phrase, not a cryptographically random value. This weakens CSRF protection in the OAuth flow.

---

## A07: Identification and Authentication Failures

**Severity: MEDIUM**

**Token extracted from raw cookie header via regex.** The `JwtAuthGuard` parses cookies manually:

```typescript
// apps/api/src/auth/jwt-auth.guard.ts:24-26
private extractToken(request: Request): string | null {
  const cookieHeader = request.headers.cookie ?? '';
  const match = /(?:^|;\s*)session=([^;]+)/.exec(cookieHeader);
  return match ? match[1] : null;
}
```

`cookie-parser` is registered in `main.ts`, so `request.cookies` is available. Using `request.cookies['session']` is safer and less error-prone than raw regex parsing.

**All first-time OAuth installers get `role: 'admin'`** unconditionally:

```typescript
// apps/api/src/core/slack/infrastructure/gateways/bolt-slack.gateway.ts:115
member = Member.create({
  ...
  role: 'admin',   // Every new member gets admin
  organizationId: org.getId(),
});
```

Every workspace user who completes the OAuth flow for the first time becomes an admin. This will need revisiting before multiple members can join an existing organization.

---

## A09: Security Logging and Monitoring Failures

**Severity: MEDIUM**

Security-relevant events are not consistently logged:

- Successful OAuth installs: not logged
- JWT verification failures: caught and re-thrown as `UnauthorizedException` without any log
- Failed member lookups: `NotFoundException` thrown, no security log
- `BoltSlackGateway` only logs the error case of the OAuth success handler

No audit trail exists for:
- Who authenticated and when
- Failed authentication attempts
- Token encryption/decryption errors

---

## A02 Additional: Seed File Contains Plaintext Token

**File:** `apps/api/src/database/seed.ts:24`

```typescript
const org = Organization.create({
  name: 'Acme Corp',
  slackTeamId: 'T_TEST',
  slackBotToken: 'xoxb-test-bot-token',  // plaintext, unencrypted
});
```

The seed creates an organization with a plaintext bot token, bypassing `TokenEncryption`. The seed should call `tokenEncryption.encrypt()` or clearly document it is dev-only.

---

## Summary

| Finding | Severity | Location |
|---|---|---|
| Live secrets in `.env` (Anthropic, Slack, Google, JWT) | CRITICAL | `apps/api/.env` |
| No Helmet (missing security headers) | HIGH | `src/main.ts` |
| `@nestjs/throttler` installed but not wired | HIGH | `src/app.module.ts` |
| AES-256-CBC (no integrity check) instead of AES-256-GCM | MEDIUM | `src/auth/token-encryption.ts` |
| Slack user tokens stored plaintext | MEDIUM | `organization.aggregate.ts`, `slack-installation.aggregate.ts` |
| JWT 30-day expiry, no revocation | MEDIUM | `src/auth/auth.module.ts` |
| `allowGlobalContext: true` in MikroORM | MEDIUM | `src/app.module.ts` |
| Every new OAuth user assigned `admin` role | MEDIUM | `bolt-slack.gateway.ts:115` |
| No global `JwtAuthGuard` — per-route only | MEDIUM | `src/main.ts` |
| Cookie parsed via regex instead of `request.cookies` | LOW | `src/auth/jwt-auth.guard.ts:24` |
| `SLACK_APP_ID` read via `process.env`, not ConfigService | LOW | `slack-installation.mapper.ts:78` |
| Seed file uses plaintext bot token | LOW | `src/database/seed.ts:24` |
| Minimal security logging | MEDIUM | multiple files |

---

## Immediate Actions (Priority Order)

1. **Rotate all secrets** — the `.env` file contains live Anthropic, Slack, and Google credentials.
2. **Add Helmet** — `app.use(helmet())` in `main.ts`.
3. **Wire up ThrottlerModule** — already installed; add to `AppModule.imports` and apply `ThrottlerGuard` globally.
4. **Switch to AES-256-GCM** in `TokenEncryption` and encrypt user tokens using the same service.
5. **Set `allowGlobalContext: false`** in MikroORM config for production.
6. **Register `JwtAuthGuard` globally** via `APP_GUARD` to prevent accidentally unguarded routes as the API grows.
