# Étape 7: Pipeline LLM — Génération du Status

**Durée estimée** : 8-12h (l'étape la plus critique)

## Prompt Claude Code

```
Implémente le pipeline de génération de rapport Drift via Claude API.

CONTEXTE :
- C'est le cœur du produit. Ce module prend les données brutes (Slack messages, Linear tickets,
  Notion spec) et génère un rapport structuré en JSON via Claude.
- La qualité de ce rapport détermine si le produit fonctionne ou non.

MODULE : apps/api/src/core/pipeline/
Suivre l'architecture hexagonale.

COMPOSANTS À CRÉER :

1. GenerateReportCommand + handler (application/commands/)
   Orchestration via repositories et gateways (jamais d'ORM direct) :
   a) Récupérer le Project via ProjectRepository
   b) Récupérer les SlackMessages du projet pour la semaine (non filtrés uniquement)
   c) Récupérer les LinearTicketSnapshots du projet pour la semaine
   d) Calculer les delivery stats via ComputeDeliveryStatsQuery
   e) Lire le contenu Notion (si pageId configuré et page modifiée) via ReadNotionPageQuery
   f) Récupérer le rapport de la semaine précédente via ReportRepository
   g) Assembler le prompt via PromptBuilderService
   h) Appeler Claude API via LlmGateway
   i) Parser la réponse JSON via ReportParserService
   j) Créer et sauvegarder le Report aggregate via ReportRepository
   k) Retourner le reportId

2. PromptBuilderService (domain service)
   - Méthode : buildPrompt(data: PipelineData) → { systemPrompt, userPrompt }
   - Le prompt complet est décrit dans la Section 4 de Drift-specs-V1.md

3. LlmGateway (port interface dans domain/gateways/)
   - Méthode : generate(systemPrompt: string, userPrompt: string) → string
   - Implémentation utilisant @anthropic-ai/sdk :
     * model: "claude-sonnet-4-20250514"
     * max_tokens: 4096
     * temperature: 0.3
   - Retry avec backoff sur erreurs 429/500
   - Logger les tokens utilisés (input + output)
   - Fake gateway pour les tests

4. ReportParserService (domain service)
   - Méthode : parseReport(llmOutput: string) → ReportContent
   - Extraire le JSON du output LLM (gérer le cas où il est entouré de ```json```)
   - Valider le JSON contre le schéma ReportContent (voir Section 5)
   - Si la validation échoue, retry une fois avec un prompt de correction via LlmGateway

5. GenerationCronService (infrastructure/cron/)
   - Cron : lundi à 7h UTC ("0 7 * * 1")
   - Pour chaque Organization et chaque Project actif, déclencher GenerateReportCommand
   - En cas d'erreur sur un projet, logger et continuer avec le suivant

6. ReportsController (infrastructure/controllers/)
   - POST /reports/generate/:projectId → génération manuelle (admin only)
   - GET /reports/latest → dernier rapport de chaque projet actif de l'org
   - GET /reports/:id → rapport complet

IMPORTANT :
- Le prompt est le produit. Son contenu exact est détaillé dans Drift-specs-V1.md Section 4.
- Logger TOUT : durée de génération, tokens utilisés, erreurs de parsing.
```

## Validation

- [ ] Avec des données de test en DB, GenerateReportCommand produit un rapport valide
- [ ] Le JSON de sortie est conforme au schéma ReportContent
- [ ] Le rapport contient narrative, decisions, blockers, drift, delivery stats
- [ ] Les tokens sont loggués
- [ ] La génération manuelle fonctionne via POST /reports/generate/:projectId
- [ ] Si le LLM retourne du JSON invalide, le retry fonctionne
- [ ] Le cron du lundi déclenche la génération pour tous les projets
