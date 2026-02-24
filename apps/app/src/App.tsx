import { useState } from 'react';

const PROJECTS = [
  {
    id: 1,
    name: 'Checkout Revamp',
    emoji: '💳',
    health: 'on-track',
    healthLabel: 'On Track',
    pmLead: 'Julie P.',
    techLead: 'Marie D.',
    team: 'Payments',
    period: 'Week 7 · Feb 17–23',
    progress: 68,
    prevProgress: 61,
    targetDate: 'Mar 15',
    daysToTarget: 20,
    sources: { slack: 47, linear: 23, notion: 4 },
    objective: {
      goal: 'Reduce cart abandonment rate from 18% to 12%',
      origin: 'Q1 Roadmap · Product Board Review, Jan 6',
      keyResults: [
        { text: 'Stripe Connect integrated', done: true },
        { text: 'Checkout flow < 3 steps', done: false },
        { text: 'Mobile conversion +15%', done: false },
      ],
    },
    narrative:
      'Strong engineering velocity — 5 tickets merged, 2 in review. The Stripe Connect decision was finalized after a 3-day discussion, closing a key architectural question. The main risk is design-side: the confirmation screen handoff from Sarah is 3 days late, which could push the launch by a week. Product-wise, the current implementation aligns with the original spec, but the team is considering dropping the guest checkout shortcut to hit the deadline — this would impact the abandonment KR.',
    decisions: [
      {
        text: 'Stripe Connect over custom payment integration',
        tradeoff: 'Faster to ship (+2 weeks saved), but less customizable for future multi-currency support',
        who: 'Marie D. + Julie P.',
        where: 'Slack #checkout-v2',
        when: 'Wed, Feb 19',
        alignedWithIntent: true,
      },
      {
        text: 'Postponing Apple Pay to v2.1',
        tradeoff: 'Reduces scope, but Apple Pay users have 22% higher conversion — could limit KR impact',
        who: 'Julie P.',
        where: 'Linear CHK-89',
        when: 'Thu, Feb 20',
        alignedWithIntent: 'partial',
      },
    ],
    drift: {
      level: 'low',
      label: 'Minor Drift',
      details:
        'Guest checkout shortcut may be cut for deadline. Original spec identified this as a key driver of the abandonment KR (est. 3-4% impact). Recommend: explicit decision with CPO before cutting.',
    },
    blockers: [
      {
        text: 'Figma handoff for confirmation screen not delivered',
        owner: 'Sarah K.',
        severity: 'medium',
        since: '3 days',
        impact: 'Could delay launch by ~1 week',
      },
    ],
    delivery: {
      merged: 5,
      inReview: 2,
      blocked: 1,
      created: 3,
      velocity: '+18%',
      velocityLabel: 'vs last week',
    },
    threads: [
      {
        title: 'Stripe Connect vs Custom integration',
        participants: ['Marie D.', 'Thomas R.', 'Julie P.'],
        messages: 14,
        outcome: 'Decision: Stripe Connect',
        channel: '#checkout-v2',
      },
      {
        title: 'Should we cut guest checkout for deadline?',
        participants: ['Julie P.', 'Marie D.'],
        messages: 6,
        outcome: 'Open — needs CPO input',
        channel: '#checkout-v2',
      },
    ],
  },
  {
    id: 2,
    name: 'Search Rewrite',
    emoji: '🔍',
    health: 'at-risk',
    healthLabel: 'At Risk',
    pmLead: 'Alex M.',
    techLead: 'Thomas R.',
    team: 'Core Platform',
    period: 'Week 4 · Feb 17–23',
    progress: 34,
    prevProgress: 31,
    targetDate: 'Apr 10',
    daysToTarget: 46,
    sources: { slack: 82, linear: 15, notion: 2 },
    objective: {
      goal: 'Improve search relevance score from 64% to 85% and reduce p95 latency to <200ms',
      origin: 'Q1 Roadmap · Tech Debt Review, Dec 12',
      keyResults: [
        { text: 'OpenSearch migration complete', done: false },
        { text: 'Relevance score > 85%', done: false },
        { text: 'p95 latency < 200ms', done: false },
      ],
    },
    narrative:
      "Project is falling behind — only 2 tickets completed vs 6 planned. A critical data consistency issue discovered Monday consumed most of the team's bandwidth. The OpenSearch migration is proving significantly more complex than estimated. An architecture decision on index sharding is blocking further progress and requires CTO review. At current velocity, the April 10 target is at serious risk — the team estimates a 2-3 week delay unless the sharding decision is made this week.",
    decisions: [
      {
        text: 'Switching from managed Elasticsearch to OpenSearch',
        tradeoff: 'Better cost structure and AWS-native, but migration path is more complex than initially estimated',
        who: 'Thomas R.',
        where: 'Slack #search-rewrite',
        when: 'Mon, Feb 17',
        alignedWithIntent: true,
      },
    ],
    drift: {
      level: 'high',
      label: 'Significant Drift',
      details:
        'Original scope was "re-index and optimize ranking." Current work has expanded into a full infrastructure migration (Elasticsearch → OpenSearch). Scope increased ~40% without formal Product review. The relevance improvements haven\'t started yet — all effort is on migration.',
    },
    blockers: [
      {
        text: 'Data consistency gap between legacy and new search indices',
        owner: 'Thomas R.',
        severity: 'high',
        since: '5 days',
        impact: 'All ranking work blocked until resolved',
      },
      {
        text: 'Architecture decision on index sharding strategy',
        owner: 'Victor L. (CTO)',
        severity: 'high',
        since: '3 days',
        impact: 'Team idle on core path without this decision',
      },
    ],
    delivery: {
      merged: 2,
      inReview: 1,
      blocked: 3,
      created: 2,
      velocity: '-62%',
      velocityLabel: 'vs last week',
    },
    threads: [
      {
        title: 'Data sync issue — legacy index 6h behind',
        participants: ['Thomas R.', 'Marie D.'],
        messages: 23,
        outcome: 'Investigation ongoing',
        channel: '#search-rewrite',
      },
      {
        title: 'Do we need to rethink sharding entirely?',
        participants: ['Thomas R.', 'Victor L.'],
        messages: 8,
        outcome: 'Waiting for CTO decision',
        channel: '#search-rewrite',
      },
    ],
  },
  {
    id: 3,
    name: 'Onboarding V2',
    emoji: '🚀',
    health: 'on-track',
    healthLabel: 'On Track',
    pmLead: 'Julie P.',
    techLead: 'Léa B.',
    team: 'Growth',
    period: 'Week 2 · Feb 17–23',
    progress: 22,
    prevProgress: 11,
    targetDate: 'May 2',
    daysToTarget: 68,
    sources: { slack: 29, linear: 18, notion: 7 },
    objective: {
      goal: 'Increase Day-7 activation rate from 34% to 55%',
      origin: 'Q1 Roadmap · Growth Review, Jan 13',
      keyResults: [
        { text: 'User research synthesis done', done: true },
        { text: 'Progressive profiling shipped', done: false },
        { text: 'A/B test 3-step vs 5-step launched', done: false },
      ],
    },
    narrative:
      'Ahead of schedule. User research synthesis was completed and specs are finalized in Notion. Julie and Léa aligned on the progressive profiling approach, which directly supports the activation KR. 4 new tickets created and estimated. The project is well-scoped and the team has strong Product-Eng alignment on the approach.',
    decisions: [
      {
        text: 'Progressive profiling instead of single long form',
        tradeoff: 'Better UX and higher expected completion, but adds 1 week of engineering complexity',
        who: 'Julie P. + Léa B.',
        where: 'Notion Onboarding V2 Spec',
        when: 'Tue, Feb 18',
        alignedWithIntent: true,
      },
      {
        text: 'A/B test between 3-step and 5-step onboarding flows',
        tradeoff: 'Adds 3-4 days to validate, but de-risks the final approach with data',
        who: 'Julie P.',
        where: 'Slack #growth-eng',
        when: 'Thu, Feb 20',
        alignedWithIntent: true,
      },
    ],
    drift: {
      level: 'none',
      label: 'Aligned',
      details: 'Implementation matches original spec and product intent. No divergence detected.',
    },
    blockers: [],
    delivery: {
      merged: 1,
      inReview: 0,
      blocked: 0,
      created: 4,
      velocity: '+100%',
      velocityLabel: 'from zero (project start)',
    },
    threads: [
      {
        title: 'Research synthesis — 3 key patterns',
        participants: ['Julie P.', 'Léa B.', 'Alex M.'],
        messages: 11,
        outcome: 'Patterns validated, specs updated',
        channel: '#growth-eng',
      },
    ],
  },
];

const healthConfig = {
  'on-track': { bg: '#E8F5E9', text: '#2E7D32', dot: '#43A047' },
  'at-risk': { bg: '#FFF3E0', text: '#E65100', dot: '#FB8C00' },
  'off-track': { bg: '#FFEBEE', text: '#C62828', dot: '#E53935' },
};

const driftConfig = {
  none: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7', icon: '✓' },
  low: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082', icon: '◐' },
  high: { bg: '#FBE9E7', text: '#BF360C', border: '#FFAB91', icon: '⚠' },
};

function HealthBadge({ health, label }) {
  const c = healthConfig[health];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 20,
        background: c.bg,
        color: c.text,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {label}
    </span>
  );
}

function DriftBadge({ level, label }) {
  const c = driftConfig[level];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 20,
        background: c.bg,
        color: c.text,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.03em',
        border: `1px solid ${c.border}`,
      }}
    >
      <span style={{ fontSize: 10 }}>{c.icon}</span>
      {label}
    </span>
  );
}

function SourceTag({ type, count }) {
  const labels = { slack: 'Slack', linear: 'Linear', notion: 'Notion' };
  const colors = { slack: '#4A154B', linear: '#5E6AD2', notion: '#000000' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 4,
        background: `${colors[type]}11`,
        color: colors[type],
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      {labels[type]} · {count}
    </span>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: color || '#A09B94',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

function KRItem({ text, done }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 0',
        fontSize: 13,
        color: done ? '#8A8580' : '#1A1A1A',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? '#43A047' : 'transparent',
          border: done ? 'none' : '1.5px solid #D4D0C8',
          fontSize: 11,
          color: '#FFF',
          flexShrink: 0,
        }}
      >
        {done && '✓'}
      </span>
      <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{text}</span>
    </div>
  );
}

function DecisionCard({ decision }) {
  const alignColors = {
    true: { bg: '#E8F5E9', label: 'Aligned', color: '#2E7D32' },
    partial: { bg: '#FFF8E1', label: 'Partial', color: '#F57F17' },
    false: { bg: '#FFEBEE', label: 'Misaligned', color: '#C62828' },
  };
  const align = alignColors[String(decision.alignedWithIntent)];
  return (
    <div
      style={{
        padding: '14px 16px',
        background: '#FAFAF8',
        borderRadius: 10,
        marginBottom: 10,
        borderLeft: '3px solid #1A1A1A',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.4, flex: 1 }}>
          {decision.text}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            background: align.bg,
            color: align.color,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {align.label}
        </span>
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#6B6560',
          lineHeight: 1.5,
          marginBottom: 8,
          fontStyle: 'italic',
          paddingLeft: 0,
        }}
      >
        ↳ Trade-off: {decision.tradeoff}
      </div>
      <div style={{ fontSize: 11, color: '#A09B94', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span>{decision.who}</span>
        <span style={{ color: '#D4D0C8' }}>·</span>
        <span>{decision.where}</span>
        <span style={{ color: '#D4D0C8' }}>·</span>
        <span>{decision.when}</span>
      </div>
    </div>
  );
}

function ProjectCard({ project, isExpanded, onToggle }) {
  const p = project;
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #E8E6E1',
        overflow: 'hidden',
        transition: 'box-shadow 0.25s ease',
        boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* Card Header */}
      <div
        onClick={onToggle}
        style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
      >
        <span style={{ fontSize: 26, lineHeight: 1, marginTop: 2 }}>{p.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
            <span
              style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 19, fontWeight: 400, color: '#1A1A1A' }}
            >
              {p.name}
            </span>
            <HealthBadge health={p.health} label={p.healthLabel} />
            <DriftBadge level={p.drift.level} label={p.drift.label} />
          </div>
          <div style={{ fontSize: 12, color: '#A09B94', display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <span>
              PM: <strong style={{ color: '#6B6560' }}>{p.pmLead}</strong>
            </span>
            <span style={{ color: '#D4D0C8' }}>·</span>
            <span>
              Tech: <strong style={{ color: '#6B6560' }}>{p.techLead}</strong>
            </span>
            <span style={{ color: '#D4D0C8' }}>·</span>
            <span>
              Target: <strong style={{ color: '#6B6560' }}>{p.targetDate}</strong> ({p.daysToTarget}d)
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                flex: 1,
                maxWidth: 220,
                height: 5,
                background: '#F0EEED',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${p.prevProgress}%`,
                  background: '#E0DDD8',
                  borderRadius: 3,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${p.progress}%`,
                  background: '#1A1A1A',
                  borderRadius: 3,
                  transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{p.progress}%</span>
            <span style={{ fontSize: 11, color: p.progress > p.prevProgress ? '#43A047' : '#E53935', fontWeight: 500 }}>
              {p.progress > p.prevProgress ? '+' : ''}
              {p.progress - p.prevProgress}%
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <SourceTag type="slack" count={p.sources.slack} />
            <SourceTag type="linear" count={p.sources.linear} />
            <SourceTag type="notion" count={p.sources.notion} />
          </div>
        </div>
        <span
          style={{
            fontSize: 16,
            color: '#C4C0BA',
            transition: 'transform 0.3s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            marginTop: 4,
          }}
        >
          ▾
        </span>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid #E8E6E1' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E8E6E1', padding: '0 24px' }}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'decisions', label: `Decisions (${p.decisions.length})` },
              { key: 'delivery', label: 'Delivery' },
              { key: 'threads', label: `Key Threads (${p.threads.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: 'transparent',
                  color: activeTab === t.key ? '#1A1A1A' : '#A09B94',
                  borderBottom: activeTab === t.key ? '2px solid #1A1A1A' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                {/* Objective */}
                <div
                  style={{
                    padding: '16px 18px',
                    background: '#F8F7F5',
                    borderRadius: 10,
                    marginBottom: 20,
                    border: '1px solid #ECEAE6',
                  }}
                >
                  <SectionLabel>
                    <span style={{ fontSize: 13 }}>🎯</span> Product Objective
                  </SectionLabel>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#1A1A1A',
                      marginBottom: 6,
                      fontFamily: "'Newsreader', Georgia, serif",
                      lineHeight: 1.4,
                    }}
                  >
                    {p.objective.goal}
                  </div>
                  <div style={{ fontSize: 11, color: '#A09B94', marginBottom: 14 }}>Source: {p.objective.origin}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {p.objective.keyResults.map((kr, i) => (
                      <KRItem key={i} text={kr.text} done={kr.done} />
                    ))}
                  </div>
                </div>

                {/* Narrative */}
                <div style={{ marginBottom: 20 }}>
                  <SectionLabel>
                    <span style={{ fontSize: 13 }}>📝</span> Weekly Narrative
                  </SectionLabel>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.75,
                      color: '#3A3530',
                      margin: 0,
                      fontFamily: "'Source Serif 4', Georgia, serif",
                    }}
                  >
                    {p.narrative}
                  </p>
                </div>

                {/* Drift Alert */}
                {p.drift.level !== 'none' && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 10,
                      marginBottom: 20,
                      background: driftConfig[p.drift.level].bg,
                      border: `1px solid ${driftConfig[p.drift.level].border}`,
                    }}
                  >
                    <SectionLabel color={driftConfig[p.drift.level].text}>
                      <span style={{ fontSize: 13 }}>{driftConfig[p.drift.level].icon}</span> Intent Drift Detected
                    </SectionLabel>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: driftConfig[p.drift.level].text }}>
                      {p.drift.details}
                    </div>
                  </div>
                )}

                {/* Blockers */}
                {p.blockers.length > 0 && (
                  <div>
                    <SectionLabel>
                      <span style={{ fontSize: 13 }}>🚧</span> Blockers
                      <span style={{ color: '#E53935', fontSize: 10 }}>({p.blockers.length})</span>
                    </SectionLabel>
                    {p.blockers.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '12px 16px',
                          background: b.severity === 'high' ? '#FFF8F6' : '#FFFDF5',
                          borderRadius: 10,
                          marginBottom: 8,
                          borderLeft: `3px solid ${b.severity === 'high' ? '#E53935' : '#FB8C00'}`,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', marginBottom: 4 }}>{b.text}</div>
                        <div style={{ fontSize: 12, color: '#8A8580', marginBottom: 2 }}>
                          Owner: {b.owner} · Since {b.since}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: b.severity === 'high' ? '#C62828' : '#E65100',
                            fontWeight: 500,
                          }}
                        >
                          Impact: {b.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DECISIONS TAB */}
            {activeTab === 'decisions' && (
              <div>
                <div style={{ fontSize: 13, color: '#6B6560', marginBottom: 16, lineHeight: 1.5 }}>
                  Decisions auto-detected from Slack conversations, Linear comments, and Notion changes. Each is
                  evaluated for alignment with the original product intent.
                </div>
                {p.decisions.map((d, i) => (
                  <DecisionCard key={i} decision={d} />
                ))}
                {p.drift.level !== 'none' && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 10,
                      marginTop: 16,
                      background: driftConfig[p.drift.level].bg,
                      border: `1px solid ${driftConfig[p.drift.level].border}`,
                    }}
                  >
                    <div
                      style={{ fontSize: 12, fontWeight: 600, color: driftConfig[p.drift.level].text, marginBottom: 6 }}
                    >
                      {driftConfig[p.drift.level].icon} Cumulative Impact on Intent
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: driftConfig[p.drift.level].text }}>
                      {p.drift.details}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DELIVERY TAB */}
            {activeTab === 'delivery' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Merged', value: p.delivery.merged, color: '#43A047' },
                    { label: 'In Review', value: p.delivery.inReview, color: '#FB8C00' },
                    { label: 'Blocked', value: p.delivery.blocked, color: '#E53935' },
                    { label: 'Created', value: p.delivery.created, color: '#78909C' },
                    {
                      label: 'Velocity',
                      value: p.delivery.velocity,
                      color: p.delivery.velocity.startsWith('+') ? '#43A047' : '#E53935',
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{ padding: '14px', background: '#F8F7F5', borderRadius: 10, textAlign: 'center' }}
                    >
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: '#A09B94', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <SectionLabel>
                  <span style={{ fontSize: 13 }}>📅</span> Timeline Risk
                </SectionLabel>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 10,
                    background: '#F8F7F5',
                    border: '1px solid #ECEAE6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>Target: {p.targetDate}</div>
                    <div style={{ fontSize: 12, color: '#A09B94' }}>{p.daysToTarget} days remaining</div>
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: p.health === 'at-risk' ? '#FFF3E0' : '#E8F5E9',
                      color: p.health === 'at-risk' ? '#E65100' : '#2E7D32',
                    }}
                  >
                    {p.health === 'at-risk' ? '⚠ At risk of delay (est. 2-3 weeks)' : 'On track for target date'}
                  </div>
                </div>
              </div>
            )}

            {/* THREADS TAB */}
            {activeTab === 'threads' && (
              <div>
                <div style={{ fontSize: 13, color: '#6B6560', marginBottom: 16, lineHeight: 1.5 }}>
                  Key Slack conversations with the most activity and decision-making signal this week.
                </div>
                {p.threads.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '14px 18px',
                      background: '#F8F7F5',
                      borderRadius: 10,
                      marginBottom: 10,
                      border: '1px solid #ECEAE6',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.4 }}>
                        {t.title}
                      </span>
                      <span style={{ fontSize: 11, color: '#A09B94', whiteSpace: 'nowrap', marginLeft: 12 }}>
                        {t.messages} messages
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {t.participants.map((p, j) => (
                        <span
                          key={j}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: '#ECEAE6',
                            color: '#6B6560',
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#A09B94' }}>{t.channel}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: t.outcome.includes('Decision')
                            ? '#E8F5E9'
                            : t.outcome.includes('Open')
                              ? '#FFF3E0'
                              : '#F0EEED',
                          color: t.outcome.includes('Decision')
                            ? '#2E7D32'
                            : t.outcome.includes('Open')
                              ? '#E65100'
                              : '#6B6560',
                        }}
                      >
                        {t.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PulseDashboard() {
  const [expanded, setExpanded] = useState(new Set([1]));
  const [viewMode, setViewMode] = useState('all');

  const toggleProject = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered =
    viewMode === 'all'
      ? PROJECTS
      : viewMode === 'drifting'
        ? PROJECTS.filter((p) => p.drift.level !== 'none')
        : PROJECTS.filter((p) => p.health === viewMode);

  const totalDecisions = PROJECTS.reduce((a, p) => a + p.decisions.length, 0);
  const totalBlockers = PROJECTS.reduce((a, p) => a + p.blockers.length, 0);
  const driftingCount = PROJECTS.filter((p) => p.drift.level !== 'none').length;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F3EF',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Newsreader:wght@400;500;600&family=Source+Serif+4:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* Nav */}
      <div
        style={{
          background: '#1A1A1A',
          padding: '11px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FFF', letterSpacing: '-0.03em' }}>
            pulse<span style={{ color: '#FF6B35' }}>.</span>
          </span>
          <span
            style={{
              fontSize: 10,
              color: '#666',
              background: '#2A2A2A',
              padding: '2px 7px',
              borderRadius: 4,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            BETA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Last sync: 2 min ago</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#FF6B35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              VL
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#5E6AD2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: 11,
                fontWeight: 700,
                marginLeft: -8,
                border: '2px solid #1A1A1A',
              }}
            >
              JP
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#A09B94',
              marginBottom: 6,
            }}
          >
            Monday, February 23, 2026
          </div>
          <h1
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: 34,
              fontWeight: 400,
              color: '#1A1A1A',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Weekly pulse — Product × Engineering
          </h1>
          <p style={{ fontSize: 14, color: '#6B6560', margin: 0, lineHeight: 1.5 }}>
            Auto-generated from <strong>158 Slack messages</strong>, <strong>56 Linear tickets</strong>, and{' '}
            <strong>13 Notion pages</strong>. Covering 3 active projects for the duo <strong>Victor L.</strong> (CTO) &{' '}
            <strong>Julie P.</strong> (CPO).
          </p>
        </div>

        {/* Portfolio Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Active Projects', value: '3', sub: '2 on track, 1 at risk', color: '#1A1A1A' },
            { label: 'Decisions', value: String(totalDecisions), sub: 'This week', color: '#1A1A1A' },
            { label: 'Blockers', value: String(totalBlockers), sub: '2 critical', color: '#E53935' },
            {
              label: 'Intent Drift',
              value: String(driftingCount),
              sub: 'projects drifting',
              color: driftingCount > 0 ? '#F57F17' : '#43A047',
            },
            { label: 'Avg Velocity', value: '+12%', sub: 'vs last week', color: '#43A047' },
          ].map((s, i) => (
            <div
              key={i}
              style={{ background: '#FFF', borderRadius: 10, padding: '14px 16px', border: '1px solid #E8E6E1' }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#A09B94',
                  marginBottom: 5,
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#A09B94' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Attention needed */}
        {PROJECTS.some((p) => p.drift.level === 'high') && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: 10,
              marginBottom: 20,
              background: 'linear-gradient(135deg, #FBE9E7 0%, #FFF3E0 100%)',
              border: '1px solid #FFAB91',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#BF360C', marginBottom: 4 }}>
                Needs attention this week
              </div>
              <div style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6 }}>
                <strong>Search Rewrite</strong> has significant intent drift — scope expanded ~40% into an
                infrastructure migration without Product review. The CTO needs to make the sharding decision (blocked 3
                days) and the CPO should validate whether the expanded scope still serves the original relevance KR.
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'drifting', label: '⚠ Drifting' },
            { key: 'at-risk', label: 'At Risk' },
            { key: 'on-track', label: 'On Track' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setViewMode(t.key)}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                border: '1px solid',
                transition: 'all 0.15s ease',
                borderColor: viewMode === t.key ? '#1A1A1A' : '#E8E6E1',
                background: viewMode === t.key ? '#1A1A1A' : '#FFF',
                color: viewMode === t.key ? '#FFF' : '#6B6560',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} isExpanded={expanded.has(p.id)} onToggle={() => toggleProject(p.id)} />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 28,
            padding: '14px 20px',
            background: '#FFF',
            borderRadius: 10,
            border: '1px solid #E8E6E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 12, color: '#A09B94' }}>
            ⚡ Generated in <strong style={{ color: '#1A1A1A' }}>14 seconds</strong> · Next auto-update: Monday, Mar 2
            at 8:00 AM
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #E8E6E1',
                background: '#FFF',
                color: '#6B6560',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Share to #leadership
            </button>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: '#1A1A1A',
                color: '#FFF',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
