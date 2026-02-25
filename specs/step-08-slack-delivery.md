# Étape 8: Delivery — Envoi du Rapport Slack

**Durée estimée** : 4-5h

## Prompt Claude Code

```
Implémente l'envoi du rapport Drift par message Slack.

CONTEXTE :
- Après la génération du rapport, on l'envoie par DM Slack aux admins de l'organization.
- Le message utilise les Slack Block Kit pour un formatage riche.

MODULE : apps/api/src/core/integrations/slack/ (compléter le module existant)

COMPOSANTS À CRÉER :

1. SlackReportFormatterService (domain service)
   - Méthode : formatReport(report: ReportContent, project: Project) → SlackBlock[]
   - Formatage Block Kit du rapport :

   STRUCTURE DU MESSAGE :
   ┌─────────────────────────────────────────────┐
   │ 💳 *Checkout Revamp* — Week 7                │
   │ 🟢 On Track · Progress: 68% (+7%)            │
   │ PM: Julie P. · Tech: Marie D.                │
   ├─────────────────────────────────────────────┤
   │ *🎯 Objective*                                │
   │ Reduce cart abandonment rate from 18% to 12% │
   │ ✅ Stripe Connect integrated                  │
   │ ☐ Checkout flow < 3 steps                    │
   ├─────────────────────────────────────────────┤
   │ *📝 This Week*                                │
   │ Strong engineering velocity — 5 tickets...   │
   ├─────────────────────────────────────────────┤
   │ *⚡ Decisions*                                │
   │ • Stripe Connect over custom integration     │
   │   ↳ Aligned · Trade-off: Faster to ship...  │
   ├─────────────────────────────────────────────┤
   │ *⚠️ Intent Drift: Minor Drift*               │
   │ Guest checkout shortcut may be cut...        │
   ├─────────────────────────────────────────────┤
   │ *🚧 Blockers (1)*                            │
   │ 🟡 Figma handoff — Owner: Sarah K.           │
   ├─────────────────────────────────────────────┤
   │ *📊 Delivery*                                 │
   │ ✅ 5 merged · 🔄 2 in review · 🔴 1 blocked  │
   │ 📈 Velocity: +18% vs last week               │
   ├─────────────────────────────────────────────┤
   │ 🔗 View full report on Drift                 │
   └─────────────────────────────────────────────┘

2. DeliverReportCommand + handler (application/commands/)
   - Récupérer le Report et le Project via leurs repositories
   - Formater le rapport en Slack blocks
   - Envoyer par DM à chaque Member avec role 'admin' via SlackApiGateway
   - Stocker slackDeliveredAt et slackMessageTs dans le Report aggregate
   - Sauvegarder via ReportRepository

3. DeliverPortfolioSummaryCommand + handler
   - Générer un message résumé de tous les projets de la semaine
   - Envoyer par DM aux admins

4. Intégrer dans GenerationCronService :
   - Après GenerateReportCommand, déclencher DeliverReportCommand
   - Après tous les reports, déclencher DeliverPortfolioSummaryCommand
```

## Validation

- [ ] Le message Slack est correctement formaté
- [ ] Les DMs sont envoyés aux admins
- [ ] Le portfolio summary liste tous les projets
- [ ] slackDeliveredAt est mis à jour après l'envoi
- [ ] Si l'envoi échoue, l'erreur est loggée mais ne casse pas le reste
