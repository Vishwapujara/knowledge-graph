'use client'
import { useApp } from '@/context/AppContext'
import { PatientProfile, JOURNEYS } from '@/data/knowledgeGraph'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, User, MapPin, Shield, DollarSign, Heart, Target, ChevronDown } from 'lucide-react'

// ── Dynamic form fields ────────────────────────────────────────────────────────

const GOALS = [
  { value: 'IUI',       label: 'IUI (Intrauterine Insemination)', desc: 'First-line fertility treatment' },
  { value: 'IVF',       label: 'IVF (In Vitro Fertilization)',    desc: 'Advanced fertility treatment' },
  { value: 'IVF_donor', label: 'IVF with Donor Egg or Sperm',    desc: 'Third-party gametes' },
  { value: 'exploring', label: 'Exploring All Pathways',          desc: 'Multiple failed cycles — guidance on all options' },
]

const INSURANCE_OPTIONS = [
  'Aetna', 'Blue Cross Blue Shield', 'United Healthcare',
  'Cigna', 'Humana', 'Empire Blue Cross', 'Self-pay / No insurance',
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const MANDATE_STATES = ['MA','IL','NY','NJ','CT','MD','RI','WV','TX','CA','CO','DE','HI','LA','ME','MN','MT','NH','OH']

const HEALTH_CONDITIONS = [
  'No known issues',
  'PCOS (Polycystic Ovary Syndrome)',
  'Endometriosis',
  'Diminished Ovarian Reserve (DOR)',
  'Male factor infertility',
  'Unexplained infertility',
  'Recurrent pregnancy loss',
  'Prior failed IUI cycles',
  'Prior failed IVF cycles',
  'Advanced maternal age (38+)',
  'Same-sex couple / single parent',
  'Medical barrier to carrying',
]

const MARITAL_OPTIONS = ['Single', 'Married', 'Domestic partner', 'Divorced', 'Widowed']

// ── State law lookup ──────────────────────────────────────────────────────────

function getStateLaw(state: string, goal: string): string {
  const mandated = MANDATE_STATES.includes(state)
  if (goal === 'surrogacy') {
    if (state === 'CA') return 'California is surrogacy-friendly — pre-birth orders available for all family types'
    if (state === 'NY') return 'New York legalized compensated surrogacy in 2021 (Child-Parent Security Act)'
    if (state === 'TX') return 'Texas allows gestational surrogacy agreements under the Family Code'
    return `Check ${state} surrogacy laws — requirements vary significantly by state`
  }
  if (mandated) return `${state} mandates fertility insurance coverage — IUI/IVF likely covered under your plan`
  return `${state} does not mandate fertility coverage — verify your specific plan benefits`
}

function getJourneyColor(goal: string): string {
  const colors: Record<string, string> = {
    IUI: '#E07B39', IVF: '#4A7C59', IVF_donor: '#185FA5', exploring: '#5C3D2E'
  }
  return colors[goal] || '#E07B39'
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProfileSelector() {
  const { setSelectedProfile, setScreen } = useApp()

  const [form, setForm] = useState({
    name: '',
    age: '',
    maritalStatus: 'Single',
    goal: 'IUI',
    state: 'MA',
    insurance: 'Aetna',
    budget: '10000',
    healthNotes: 'No known issues',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generated, setGenerated] = useState(false)

  const update = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: '' }))
    setGenerated(false)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 18 || Number(form.age) > 65)
      e.age = 'Enter a valid age (18–65)'
    if (!form.budget || isNaN(Number(form.budget)) || Number(form.budget) < 0)
      e.budget = 'Enter a valid budget'
    return e
  }

  const handleGenerate = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setGenerated(true)
  }

  const handleLaunch = () => {
    const profile: PatientProfile = {
      id: `user-${Date.now()}`,
      name: `${form.name}, ${form.age}`,
      emoji: getEmoji(form.goal, form.maritalStatus),
      description: `${form.maritalStatus} · ${form.healthNotes}`,
      age: form.age,
      maritalStatus: form.maritalStatus,
      goal: form.goal as any,
      location: `${form.state}, USA`,
      state: form.state,
      insurance: form.insurance,
      budget: Number(form.budget),
      healthNotes: form.healthNotes,
      statelaw: getStateLaw(form.state, form.goal),
      color: getJourneyColor(form.goal),
    }
    setSelectedProfile(profile)
    setScreen('journey')
  }

  const journey = JOURNEYS[form.goal as keyof typeof JOURNEYS]
  const color = getJourneyColor(form.goal)
  const stateLaw = getStateLaw(form.state, form.goal)
  const isMandateState = MANDATE_STATES.includes(form.state)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold tracking-widest text-ptp-orange uppercase mb-2">
          PtP Knowledge Graph — Patient Intake
        </p>
        <h1 className="font-serif text-3xl text-ptp-text mb-2">
          Build your personalized journey
        </h1>
        <p className="text-sm text-ptp-muted max-w-xl">
          Enter your profile below. PtP dynamically generates your fertility journey
          and maps the ecosystem providers you need at every step.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: Form ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-5"
        >

          {/* Section: Who are you */}
          <FormSection title="Who are you?" icon={<User size={14}/>}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" error={errors.name}>
                <input
                  type="text" placeholder="e.g. Priya"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className={inputCls(errors.name)}
                />
              </Field>
              <Field label="Age" error={errors.age}>
                <input
                  type="number" placeholder="e.g. 34" min={18} max={65}
                  value={form.age}
                  onChange={e => update('age', e.target.value)}
                  className={inputCls(errors.age)}
                />
              </Field>
            </div>
            <Field label="Relationship status">
              <Select value={form.maritalStatus} onChange={v => update('maritalStatus', v)}
                options={MARITAL_OPTIONS.map(o => ({ value: o, label: o }))} />
            </Field>
          </FormSection>

          {/* Section: Fertility goal */}
          <FormSection title="Fertility goal" icon={<Target size={14}/>}>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => update('goal', g.value)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200
                    ${form.goal === g.value
                      ? 'border-ptp-orange bg-orange-50/40'
                      : 'border-ptp-border bg-white hover:border-ptp-orange/40'
                    }
                  `}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                      form.goal === g.value ? 'border-ptp-orange bg-ptp-orange' : 'border-ptp-border'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-ptp-text">{g.label}</p>
                    <p className="text-xs text-ptp-muted">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </FormSection>

          {/* Section: Location & Insurance */}
          <FormSection title="Location & insurance" icon={<MapPin size={14}/>}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State">
                <Select value={form.state} onChange={v => update('state', v)}
                  options={US_STATES.map(s => ({ value: s, label: s }))} />
              </Field>
              <Field label="Insurance provider">
                <Select value={form.insurance} onChange={v => update('insurance', v)}
                  options={INSURANCE_OPTIONS.map(o => ({ value: o, label: o }))} />
              </Field>
            </div>
            <Field label="Budget (USD)" error={errors.budget}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ptp-muted text-sm">$</span>
                <input
                  type="number" placeholder="10000"
                  value={form.budget}
                  onChange={e => update('budget', e.target.value)}
                  className={`${inputCls(errors.budget)} pl-7`}
                />
              </div>
              {form.budget && !errors.budget && (
                <p className="text-xs text-ptp-muted mt-1">
                  {Number(form.budget) < 5000
                    ? '⚠️ Limited budget — international options may be surfaced'
                    : Number(form.budget) < 20000
                      ? '✓ Covers IUI/IVF cycles with insurance support'
                      : '✓ Covers most treatment pathways including IVF'}
                </p>
              )}
            </Field>
          </FormSection>

          {/* Section: Health */}
          <FormSection title="Health history" icon={<Heart size={14}/>}>
            <Field label="Primary health consideration">
              <Select value={form.healthNotes} onChange={v => update('healthNotes', v)}
                options={HEALTH_CONDITIONS.map(o => ({ value: o, label: o }))} />
            </Field>
          </FormSection>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white
                       transition-all duration-200 hover:shadow-ptp-elevated"
            style={{ backgroundColor: color }}
          >
            Generate my journey →
          </button>
        </motion.div>

        {/* ── Right: Live preview ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Journey preview card */}
          <div className="bg-white rounded-2xl border border-ptp-border p-4 shadow-ptp-card">
            <p className="text-xs font-semibold text-ptp-muted uppercase tracking-widest mb-3">
              Journey preview
            </p>

            {/* Selected goal */}
            <div
              className="rounded-xl p-3 mb-3"
              style={{ backgroundColor: `${color}12`, border: `1.5px solid ${color}30` }}
            >
              <p className="text-xs font-semibold mb-0.5" style={{ color }}>
                {GOALS.find(g => g.value === form.goal)?.label}
              </p>
              <p className="text-xs text-ptp-muted">{journey?.totalDuration} · {journey?.totalCostRange}</p>
            </div>

            {/* Steps list */}
            <p className="text-xs font-semibold text-ptp-muted mb-2">{journey?.steps.length} steps in this journey:</p>
            <div className="space-y-1.5">
              {journey?.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 text-xs text-ptp-muted">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: color, fontSize: 9 }}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate">{step.title}</span>
                  <span className="ml-auto shrink-0 text-ptp-orange font-medium">${step.yourCost.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-3 pt-3 border-t border-ptp-border flex justify-between text-xs">
              <span className="text-ptp-muted">Est. total (your cost)</span>
              <span className="font-semibold text-ptp-orange">
                ${journey?.steps.reduce((s, step) => s + step.yourCost, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* State law card */}
          <div className={`rounded-2xl border p-4 text-xs leading-relaxed
            ${isMandateState
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
            <p className="font-semibold mb-1">
              {isMandateState ? '✓ Mandate state' : '⚠️ No mandate'}
            </p>
            <p>{stateLaw}</p>
          </div>

          {/* Provider count preview */}
          <div className="bg-white rounded-2xl border border-ptp-border p-4 shadow-ptp-card">
            <p className="text-xs font-semibold text-ptp-muted uppercase tracking-widest mb-3">
              Ecosystem providers
            </p>
            <div className="space-y-2">
              {(['medical','financial','emotional','legal'] as const).map(type => {
                const counts = { medical: 8, financial: 5, emotional: 4, legal: 3 }
                const colors = {
                  medical: '#185FA5', financial: '#BA7517',
                  emotional: '#993556', legal: '#3B6D11'
                }
                const icons = { medical: '🏥', financial: '💰', emotional: '💙', legal: '⚖️' }
                return (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <span>{icons[type]}</span>
                    <span className="capitalize text-ptp-text">{type}</span>
                    <div className="flex-1 h-1.5 bg-ptp-sand rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(counts[type]/10)*100}%`, backgroundColor: colors[type] }}
                      />
                    </div>
                    <span className="text-ptp-muted">{counts[type]} providers</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Launch button — only shows after generate */}
          {generated && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleLaunch}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center
                         justify-center gap-2 transition-all duration-200 hover:shadow-ptp-elevated"
              style={{ backgroundColor: color }}
            >
              View {form.name ? `${form.name}'s` : 'my'} journey map
              <ArrowRight size={14} />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEmoji(goal: string, marital: string): string {
  if (goal === 'adoption') return '🏠'
  if (goal === 'surrogacy') return '🤝'
  if (marital === 'Married' || marital === 'Domestic partner') return '👫'
  return '👤'
}

const inputCls = (err?: string) => `
  w-full px-3 py-2 text-sm rounded-xl border transition-colors duration-200 outline-none
  bg-white text-ptp-text placeholder-ptp-muted
  ${err ? 'border-red-300 focus:border-red-400' : 'border-ptp-border focus:border-ptp-orange'}
`

function FormSection({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-ptp-border p-4 shadow-ptp-card space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-ptp-border">
        <span className="text-ptp-orange">{icon}</span>
        <p className="text-xs font-semibold text-ptp-text uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ptp-muted mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Select({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xl border border-ptp-border bg-white
                   text-ptp-text outline-none focus:border-ptp-orange transition-colors
                   appearance-none cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ptp-muted pointer-events-none" />
    </div>
  )
}