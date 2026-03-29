'use client'
import { useApp } from '@/context/AppContext'
import { JourneyStep, Provider } from '@/data/knowledgeGraph'
import { PROVIDER_TYPE_CONFIG } from '@/lib/providerConfig'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, ChevronRight, X, MapPin, Shield,
  DollarSign, Clock, ArrowRight, GitBranch, ExternalLink,
  AlertCircle, Star
} from 'lucide-react'
import { useState } from 'react'
import ProviderMatcher from './ProviderMatcher'

export default function JourneyMap() {
  const { activeJourney, selectedProfile, activeStep, setActiveStep,
          completedSteps, toggleStepComplete, setScreen } = useApp()

  if (!activeJourney || !selectedProfile) return null

  const totalSteps = activeJourney.steps.length
  const completedCount = completedSteps.size
  const progressPct = (completedCount / totalSteps) * 100

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left: Journey road */}
      <div className="flex-1 overflow-y-auto bg-ptp-cream relative">
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Journey header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{selectedProfile.emoji}</span>
              <span className="text-xs font-semibold text-ptp-orange uppercase tracking-widest">
                {selectedProfile.name}
              </span>
            </div>
            <h2 className="font-serif text-2xl text-ptp-text leading-snug mb-1">
              {activeJourney.title}
            </h2>
            <p className="text-sm text-ptp-muted">{activeJourney.subtitle}</p>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              <MetaPill icon={<Clock size={11}/>} label={activeJourney.totalDuration} />
              <MetaPill icon={<DollarSign size={11}/>} label={activeJourney.totalCostRange} />
              <MetaPill icon={<MapPin size={11}/>} label={selectedProfile.location} />
              <MetaPill icon={<Shield size={11}/>} label={selectedProfile.insurance} />
            </div>

            {/* State law alert */}
            <div className="mt-3 flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">{selectedProfile.state} law: </span>
                {selectedProfile.statelaw}
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-ptp-muted">Overall Progress</span>
              <span className="text-xs font-semibold text-ptp-orange">
                {completedCount} of {totalSteps} completed
              </span>
            </div>
            <div className="h-2 bg-ptp-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-ptp-orange"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Steps with animated road */}
          <div className="relative">
            {/* Animated road line */}
            <div className="absolute left-[22px] top-6 bottom-6 w-[2px] overflow-hidden">
              <div className="absolute inset-0 bg-ptp-border" />
              <motion.div
                className="absolute inset-0 bg-ptp-orange origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: progressPct / 100 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              {/* Animated dashes overlay */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 2 100" preserveAspectRatio="none">
                <line x1="1" y1="0" x2="1" y2="100"
                  stroke="rgba(224,123,57,0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="road-path"
                />
              </svg>
            </div>

            {/* Step cards */}
            <div className="space-y-4">
              {activeJourney.steps.map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i}
                  isActive={activeStep?.id === step.id}
                  isCompleted={completedSteps.has(step.id)}
                  onClick={() => setActiveStep(activeStep?.id === step.id ? null : step)}
                  onToggleComplete={() => toggleStepComplete(step.id)}
                  totalSteps={activeJourney.steps.length}
                />
              ))}
            </div>
          </div>

          {/* View in graph CTA */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => setScreen('graph')}
              className="inline-flex items-center gap-2 bg-ptp-brown text-white px-6 py-3 rounded-full
                         text-sm font-medium hover:bg-ptp-brown/90 transition-all duration-200
                         hover:shadow-ptp-elevated"
            >
              <GitBranch size={15} />
              View Full Knowledge Graph
              <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Right: Provider panel */}
      <AnimatePresence>
        {activeStep && (
          <motion.div
            key={activeStep.id}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[380px] shrink-0 bg-white border-l border-ptp-border overflow-y-auto"
          >
            <ProviderPanel
              step={activeStep}
              profile={selectedProfile}
              onClose={() => setActiveStep(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({ step, index, isActive, isCompleted, onClick, onToggleComplete, totalSteps }: {
  step: JourneyStep; index: number; isActive: boolean
  isCompleted: boolean; onClick: () => void; onToggleComplete: () => void; totalSteps: number
}) {
  const providerCount = step.providers.length
  const medicalCount = step.providers.filter(p => p.type === 'medical').length

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex gap-4"
    >
      {/* Step indicator on the road */}
      <div className="relative z-10 shrink-0">
        <button
          onClick={onToggleComplete}
          className={`
            w-11 h-11 rounded-full border-2 flex items-center justify-center
            transition-all duration-300 mt-3
            ${isCompleted
              ? 'bg-ptp-green border-ptp-green text-white shadow-md'
              : isActive
                ? 'bg-ptp-orange border-ptp-orange text-white pulse-ring shadow-ptp-glow'
                : 'bg-white border-ptp-border text-ptp-muted hover:border-ptp-orange'
            }
          `}
          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted
            ? <CheckCircle2 size={18} />
            : <span className="text-xs font-semibold">{step.stepNumber}</span>
          }
        </button>
      </div>

      {/* Card */}
      <div
        onClick={onClick}
        className={`
          flex-1 rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 mb-1
          ${isActive
            ? 'border-ptp-orange bg-orange-50/40 shadow-ptp-elevated'
            : isCompleted
              ? 'border-ptp-green/30 bg-green-50/30'
              : 'border-ptp-border bg-white hover:border-ptp-orange/40 hover:shadow-ptp-card'
          }
        `}
      >
        {/* Step header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{step.icon}</span>
            <div>
              <div className="text-xs text-ptp-muted font-medium mb-0.5">
                Step {step.stepNumber} of {totalSteps} · {step.duration}
              </div>
              <h3 className={`font-semibold text-sm leading-snug ${isCompleted ? 'line-through text-ptp-muted' : 'text-ptp-text'}`}>
                {step.title}
              </h3>
            </div>
          </div>
          <ChevronRight
            size={16}
            className={`shrink-0 mt-1 transition-transform duration-200 text-ptp-muted
                        ${isActive ? 'rotate-90' : ''}`}
          />
        </div>

        {/* Cost row */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <CostPill label="Total" value={`$${step.totalCost.toLocaleString()}`} color="text-ptp-muted" />
          <CostPill label="Insurance" value={`-$${step.insuranceCoverage.toLocaleString()}`} color="text-ptp-green" />
          <CostPill label="Your cost" value={`$${step.yourCost.toLocaleString()}`} color="text-ptp-orange font-semibold" />
        </div>

        {/* Provider teaser */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {(['medical','financial','emotional','legal'] as const).map(type => {
              const count = step.providers.filter(p => p.type === type).length
              if (!count) return null
              const cfg = PROVIDER_TYPE_CONFIG[type]
              return (
                <span key={type}
                  className="tag-pill"
                  style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                  {cfg.icon} {count}
                </span>
              )
            })}
          </div>
          <span className="text-xs text-ptp-orange font-medium flex items-center gap-1">
            {isActive ? 'Close panel' : 'View providers'}
            <ExternalLink size={10} />
          </span>
        </div>

        {/* Expanded: key tasks */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-ptp-border">
                <p className="text-xs font-semibold text-ptp-muted mb-2 uppercase tracking-wide">Key Tasks</p>
                <div className="space-y-1.5">
                  {step.keyTasks.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-ptp-text">
                      <Circle size={6} className="mt-1.5 shrink-0 text-ptp-orange fill-ptp-orange" />
                      <span>{t.task}</span>
                      <span className="ml-auto shrink-0 text-ptp-muted">{t.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function CostPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-ptp-muted" style={{ fontSize: 10 }}>{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  )
}

// ─── Provider Panel ───────────────────────────────────────────────────────────

function ProviderPanel({ step, profile, onClose }: {
  step: JourneyStep
  profile: NonNullable<ReturnType<typeof useApp>['selectedProfile']>
  onClose: () => void
}) {
  const [activeType, setActiveType] = useState<string>('all')

  const providerTypes = ['all', 'medical', 'financial', 'emotional', 'legal'] as const
  const filtered = activeType === 'all'
    ? step.providers
    : step.providers.filter(p => p.type === activeType)

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="p-5 border-b border-ptp-border">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs text-ptp-orange font-semibold uppercase tracking-widest mb-1">
              Step {step.stepNumber} Providers
            </p>
            <h3 className="font-semibold text-ptp-text text-sm leading-snug">{step.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-ptp-sand flex items-center justify-center
                       hover:bg-ptp-border transition-colors"
          >
            <X size={14} className="text-ptp-muted" />
          </button>
        </div>

        {/* Patient context chips */}
        <div className="flex flex-wrap gap-1 mt-3">
          <ContextChip icon={<MapPin size={9}/>} label={profile.state} />
          <ContextChip icon={<Shield size={9}/>} label={profile.insurance} />
          <ContextChip icon={<DollarSign size={9}/>} label={`$${profile.budget.toLocaleString()} budget`} />
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-ptp-border overflow-x-auto">
        {providerTypes.map(type => {
          const count = type === 'all' ? step.providers.length : step.providers.filter(p => p.type === type).length
          if (type !== 'all' && count === 0) return null
          const cfg = type === 'all' ? null : PROVIDER_TYPE_CONFIG[type]
          const isActive = activeType === type
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`
                shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                transition-all duration-200
                ${isActive
                  ? type === 'all'
                    ? 'bg-ptp-orange text-white'
                    : 'text-white'
                  : 'bg-ptp-sand text-ptp-muted hover:text-ptp-text'
                }
              `}
              style={isActive && cfg ? { backgroundColor: cfg.color } : undefined}
            >
              {cfg?.icon} {type === 'all' ? 'All' : cfg?.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Provider list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map((provider, i) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ProviderCard provider={provider} />
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-ptp-border bg-ptp-sand/50">
        <p className="text-xs text-ptp-muted leading-relaxed">
          <span className="font-semibold text-ptp-brown">
            {step.providers.length} providers
          </span>
          {' '}in the PtP ecosystem can support you at this step.
          Filtered for <span className="font-medium">{profile.state}</span> and{' '}
          <span className="font-medium">{profile.insurance}</span>.
        </p>
      </div>

      {/* AI Provider Matching Agent */}
      <ProviderMatcher step={step} profile={profile} />
    </div>
  )
}

function ProviderCard({ provider }: { provider: Provider }) {
  const cfg = PROVIDER_TYPE_CONFIG[provider.type]
  return (
    <div
      className="provider-card rounded-xl border p-3"
      style={{ borderColor: cfg.border, backgroundColor: `${cfg.bg}80` }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{cfg.icon}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-ptp-text">{provider.name}</h4>
              {provider.sartAttested && (
                <span className="tag-pill bg-blue-50 text-blue-700 border border-blue-200">
                  <Star size={8} className="inline mr-0.5" />SART
                </span>
              )}
            </div>
            <p className="text-xs text-ptp-muted">{provider.subcategory}</p>
          </div>
        </div>
        <span
          className="tag-pill shrink-0"
          style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
          {cfg.label}
        </span>
      </div>
      <p className="text-xs text-ptp-muted mb-2 leading-relaxed">{provider.description}</p>
      <div className="flex items-start gap-1.5 bg-white/70 rounded-lg px-2 py-1.5">
        <ArrowRight size={10} className="mt-0.5 shrink-0" style={{ color: cfg.color }} />
        <p className="text-xs leading-relaxed" style={{ color: cfg.color }}>
          <span className="font-medium">Why now: </span>{provider.relevance}
        </p>
      </div>
    </div>
  )
}

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-ptp-muted bg-white border border-ptp-border
                     px-2.5 py-1 rounded-full">
      <span className="text-ptp-orange">{icon}</span>{label}
    </span>
  )
}

function ContextChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-ptp-muted bg-white border border-ptp-border
                     px-2 py-0.5 rounded-full">
      <span className="text-ptp-orange">{icon}</span>{label}
    </span>
  )
}