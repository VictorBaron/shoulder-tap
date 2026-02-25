# Étape 4: Ingestion Slack

**Durée estimée** : 6-8h

## Prompt Claude Code

```
Implémente le module d'ingestion Slack pour Drift.

CONTEXTE :
- Chaque Project a un tableau slackChannelIds qui contient les IDs des channels à surveiller.
- On ingère les messages de ces channels à intervalle régulier.
- Les messages sont stockés via le SlackMessageRepository.
- Un filtrage heuristique marque les messages non-pertinents (isFiltered = true).

MODULE : apps/api/src/core/integrations/slack/
Suivre l'architecture hexagonale du projet : domain → application → infrastructure

COMPOSANTS À CRÉER :

1. SlackApiGateway (port interface dans domain/gateways/)
   - Méthodes :
     * getChannelHistory(token, channelId, oldest, latest) → messages[]
     * getThreadReplies(token, channelId, threadTs) → messages[]
     * listChannels(token) → channels[]
     * getUserInfo(token, userId) → user info
     * postMessage(token, channelId, blocks) → message
     * postDM(token, userId, blocks) → message
   - Implémentation (infrastructure/gateways/web-api-slack-channels.gateway.ts) avec @slack/web-api
   - Fake (infrastructure/gateways/fake-slack-api.gateway.ts) pour les tests
   - Gestion des rate limits (retry avec exponential backoff)
   - Cache des user info (Map en mémoire, TTL 1h)

2. IngestSlackMessagesCommand + handler (application/commands/)
   - Méthode principale : pour un projectId donné
     * Pour chaque channelId du projet :
       - Récupérer les messages depuis la dernière ingestion (ou 7 jours si première fois)
       - Pour chaque message avec replyCount > 0, récupérer le thread
       - Upsert dans SlackMessageRepository (sur channelId+messageTs)
       - Appliquer le filtre heuristique

3. SlackFilterService (domain service)
   - Filtre heuristique qui marque isFiltered = true sur les messages non-pertinents :
     * Messages de bots (sauf GitHub deploy notifications)
     * Messages très courts sans contexte : "ok", "done", "👍", "thanks", "+1", "lgtm"
       (SAUF s'ils sont une réponse dans un thread de décision)
     * Messages qui ne contiennent que des URLs sans texte
     * Messages qui ne contiennent que des réactions/emojis
     * Messages de type "channel_join", "channel_leave"
   - Conserver :
     * Tout message > 20 caractères d'un humain
     * Tout message avec > 2 réactions (signal de consensus)
     * Tout thread avec > 3 réponses (signal de discussion importante)

4. SlackIngestionCron (infrastructure/cron/)
   - Cron job : toutes les heures, de 8h à 20h UTC, du lundi au vendredi
   - Pattern : "0 8-20 * * 1-5"
   - Pour chaque Organization active, déclencher IngestSlackMessagesCommand pour tous les projets

IMPORTANT :
- Ne jamais appeler l'ORM directement depuis le handler — passer par SlackMessageRepository
- Logger le nombre de messages ingérés et filtrés par run
```

## Validation

- [ ] Avec un Slack workspace de test, les messages d'un channel sont ingérés
- [ ] Les threads sont récupérés
- [ ] Les messages de bots sont filtrés (isFiltered = true)
- [ ] Les messages courts sans contexte sont filtrés
- [ ] Le cron tourne et ingère automatiquement
- [ ] L'ingestion incrémentale ne crée pas de doublons
- [ ] Les rate limits Slack sont respectés (pas d'erreur 429)
