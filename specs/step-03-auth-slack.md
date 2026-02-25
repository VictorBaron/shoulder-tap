# Étape 3: Authentification & Onboarding Slack

**Durée estimée** : 4-6h

## Prompt Claude Code

```
Implémente l'authentification Slack OAuth pour Drift.

CONTEXTE :
- Drift est une Slack App. L'utilisateur clique "Add to Slack" sur le site web.
- Le OAuth flow installe l'app sur le workspace ET authentifie l'utilisateur.
- On a besoin du bot token (pour lire les channels) et du user token (pour accès aux channels privés si nécessaire).

FLOW :
1. GET /auth/slack → redirige vers Slack OAuth avec scopes
2. GET /auth/slack/callback → échange le code, crée/update Organization + Member
3. Redirige vers le dashboard web avec un JWT session token

SCOPES SLACK NÉCESSAIRES (Bot Token) :
- channels:history (lire messages channels publics)
- channels:read (lister les channels)
- groups:history (lire messages channels privés où le bot est invité)
- groups:read (lister les channels privés)
- users:read (résoudre les noms des users)
- chat:write (envoyer les rapports en DM)
- im:write (ouvrir des DMs)

SCOPES SLACK NÉCESSAIRES (User Token) :
- identity.basic, identity.email (identifier l'utilisateur)

IMPLÉMENTATION :
- Module : apps/api/src/auth/
- AuthModule avec AuthController et AuthService
- Utiliser @nestjs/jwt pour les sessions (JWT stocké en httpOnly cookie)
- Guard JwtAuthGuard sur les routes protégées
- Endpoint GET /auth/me → retourne l'utilisateur courant + son organization
- Stocker le bot token chiffré (utiliser crypto.createCipheriv avec une clé depuis .env)
- Utiliser les repositories Organization et Member (injection via NestJS DI)

SÉCURITÉ :
- Vérifier le state parameter pour CSRF
- Chiffrer les tokens avant stockage
- httpOnly + secure cookies en production
```

## Validation

- [ ] Cliquer "Add to Slack" redirige vers Slack OAuth
- [ ] Après autorisation, l'Organization est créée en DB avec le bot token
- [ ] Le Member est créé avec son slackUserId
- [ ] Le JWT cookie est set et le guard fonctionne
- [ ] GET /auth/me retourne l'user connecté
- [ ] Les tokens stockés sont chiffrés en DB
