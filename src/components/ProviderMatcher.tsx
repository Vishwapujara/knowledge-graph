'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JourneyStep, PatientProfile } from '@/data/knowledgeGraph'
import { rankProvidersWithFilter, buildMatchingPrompt, ProviderScore } from '@/lib/providerMatching'
import { PROVIDER_TYPE_CONFIG } from '@/lib/providerConfig'
import { Sparkles, ChevronDown, ChevronUp, Star, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

// ─── Match tier config ────────────────────────────────────────────────────────

const TIER_CONFIG = {
  excellent: { label: 'Excellent match', color: '#4A7C59', bg: '#EAF3DE', border: '#C0DD97' },
  good:      { label: 'Good match',      color: '#185FA5', bg: '#E6F1FB', border: '#B5D4F4' },
  fair:      { label: 'Fair match',      color: '#BA7517', bg: '#FEF3DF', border: '#FAC775' },
  limited:   { label: 'Limited match',   color: '#8C7B6E', bg: '#F5F4F1', border: '#D3D1C7' },
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ptp-muted w-28 shrink-0" style={{ fontSize: 10 }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-ptp-sand rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-ptp-muted w-8 text-right shrink-0" style={{ fontSize: 10 }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

// ─── Single provider match card ───────────────────────────────────────────────

function ProviderMatchCard({ ps, rank, defaultOpen }: {
  ps: ProviderScore; rank: number; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen || false)
  const cfg     = PROVIDER_TYPE_CONFIG[ps.provider.type]
  const tierCfg = TIER_CONFIG[ps.matchTier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: tierCfg.border }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-ptp-sand/30"
        style={{ backgroundColor: `${tierCfg.bg}80` }}
      >
        {/* Rank badge */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: tierCfg.color, fontSize: 11, fontWeight: 600 }}
        >
          {rank}
        </div>

        {/* Provider info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold text-ptp-text truncate">
              {ps.provider.name}
            </span>
            {ps.provider.sartAttested && (
              <Star size={9} className="text-blue-500 shrink-0" fill="currentColor" />
            )}
          </div>
          <span className="text-xs" style={{ color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Match percent */}
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold" style={{ color: tierCfg.color }}>
            {ps.matchPercent}%
          </div>
          <div className="text-xs" style={{ color: tierCfg.color, fontSize: 9 }}>
            {tierCfg.label}
          </div>
        </div>

        {open ? <ChevronUp size={12} className="text-ptp-muted shrink-0" />
               : <ChevronDown size={12} className="text-ptp-muted shrink-0" />}
      </button>

      {/* Expanded score breakdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-2 space-y-1.5 border-t"
                 style={{ borderColor: tierCfg.border, backgroundColor: `${tierCfg.bg}40` }}>
              <p className="text-ptp-muted mb-2" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Score breakdown
              </p>
              <ScoreBar label="Specialty fit"    value={ps.breakdown.specialtyFit}   color={tierCfg.color} />
              <ScoreBar label="Insurance match"  value={ps.breakdown.insuranceMatch}  color={tierCfg.color} />
              <ScoreBar label="Budget fit"       value={ps.breakdown.budgetFit}       color={tierCfg.color} />
              <ScoreBar label="Location"         value={ps.breakdown.locationScore}   color={tierCfg.color} />
              <ScoreBar label="Quality (SART)"   value={ps.breakdown.sartScore}       color={tierCfg.color} />
              {ps.breakdown.conditionBoost > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-ptp-green text-xs">✓ Condition boost +{Math.round(ps.breakdown.conditionBoost * 100)}%</span>
                </div>
              )}
              <p className="text-ptp-muted pt-1 leading-relaxed" style={{ fontSize: 10 }}>
                {ps.provider.relevance}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main ProviderMatcher component ──────────────────────────────────────────

interface Props {
  step: JourneyStep
  profile: PatientProfile
}

export default function ProviderMatcher({ step, profile }: Props) {
  const [isOpen,       setIsOpen]       = useState(false)
  const [aiLoading,    setAiLoading]    = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const [aiError,      setAiError]      = useState<string | null>(null)

  // Run scoring when panel opens
  const ranked = rankProvidersWithFilter(step, profile)

  const fetchAIExplanation = async () => {
    setAiLoading(true)
    setAiError(null)
    setAiExplanation(null)

    try {
      const prompt = buildMatchingPrompt(ranked, step, profile)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      const text = data.content
        ?.filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('')

      if (text) {
        setAiExplanation(text)
      } else {
        setAiError('No response from AI. Please try again.')
      }
    } catch (err) {
      setAiError('Could not reach AI service. Showing scored results only.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="border-t border-ptp-border">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left
                   hover:bg-ptp-sand/40 transition-colors"
      >
        <div className="w-6 h-6 rounded-lg bg-ptp-orange flex items-center justify-center shrink-0">
          <Sparkles size={13} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-ptp-text">
            Provider Matching Agent
          </p>
          <p className="text-xs text-ptp-muted">
            Ranked for {profile.name} · {profile.insurance} · {profile.state}
          </p>
        </div>
        <span className="text-xs font-semibold text-ptp-orange">
          {ranked.length} ranked
        </span>
        {isOpen
          ? <ChevronUp size={14} className="text-ptp-muted shrink-0" />
          : <ChevronDown size={14} className="text-ptp-muted shrink-0" />
        }
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">

              {/* Patient context chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: profile.state,      color: '#185FA5' },
                  { label: profile.insurance,  color: '#BA7517' },
                  { label: `$${profile.budget.toLocaleString()}`, color: '#4A7C59' },
                  { label: profile.healthNotes.split(',')[0], color: '#993556' },
                ].map((chip, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ color: chip.color, borderColor: `${chip.color}40`, backgroundColor: `${chip.color}10` }}>
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* Scoring model note */}
              <div className="bg-ptp-sand rounded-xl px-3 py-2">
                <p className="text-ptp-muted leading-relaxed" style={{ fontSize: 10 }}>
                  <span className="font-semibold text-ptp-brown">Stage 1 — Weighted Scoring Model: </span>
                  Providers ranked by specialty fit (30%), insurance match (25%), budget fit (20%), location (15%), SART quality (10%) + condition-specific boost.
                </p>
              </div>

              {/* Ranked provider cards */}
              <div className="space-y-2">
                {ranked.map((ps, i) => (
                  <ProviderMatchCard
                    key={ps.provider.id}
                    ps={ps}
                    rank={i + 1}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>

              {/* AI explanation section */}
              <div className="border-t border-ptp-border pt-3">
                {!aiExplanation && !aiLoading && (
                  <button
                    onClick={fetchAIExplanation}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               text-xs font-semibold text-white transition-all duration-200
                               hover:shadow-ptp-elevated"
                    style={{ backgroundColor: '#E07B39' }}
                  >
                    <Sparkles size={13} />
                    Explain these matches with AI
                    <ArrowRight size={12} />
                  </button>
                )}

                {aiLoading && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 size={14} className="animate-spin text-ptp-orange" />
                    <span className="text-xs text-ptp-muted">
                      AI is analyzing your profile and matches...
                    </span>
                  </div>
                )}

                {aiError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600">{aiError}</p>
                  </div>
                )}

                {aiExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={12} className="text-ptp-orange" />
                      <p className="text-xs font-semibold text-ptp-orange uppercase tracking-wide">
                        AI Match Explanation
                      </p>
                    </div>
                    <p className="text-xs text-ptp-text leading-relaxed whitespace-pre-wrap">
                      {aiExplanation}
                    </p>
                    <button
                      onClick={fetchAIExplanation}
                      className="mt-3 text-xs text-ptp-orange hover:underline"
                    >
                      Regenerate explanation
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Future roadmap note */}
              <div className="bg-ptp-sand/60 rounded-xl px-3 py-2 border border-ptp-border">
                <p className="text-ptp-muted leading-relaxed" style={{ fontSize: 10 }}>
                  <span className="font-semibold text-ptp-brown">Production roadmap: </span>
                  Stage 2 will replace this with RAG + MongoDB Vector Search for semantic matching.
                  Stage 3 adds collaborative filtering once 1,000+ patient interactions are logged.
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}