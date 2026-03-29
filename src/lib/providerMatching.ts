import { Provider, PatientProfile, JourneyStep } from '@/data/knowledgeGraph'

// ─── Scoring Weights (Stage 1 — Weighted Scoring) ─────────────────────────────
// NOTE: In production these weights would be learned from data.
// Stage 2: Replace with RAG/Vector similarity (MongoDB Vector Search)
// Stage 3: Replace with Collaborative Filtering (needs 1000+ interactions)
// Stage 4: Replace with XGBoost/Neural Net (needs labeled outcome data)

const WEIGHTS = {
  specialtyFit:    0.30,  // Does provider treat this diagnosis?
  insuranceMatch:  0.25,  // Is provider in patient's network?
  budgetFit:       0.20,  // Is provider within patient's budget?
  locationScore:   0.15,  // Is provider in patient's state?
  sartScore:       0.10,  // Quality signal — SART attested?
}

// ─── Individual Score Functions ───────────────────────────────────────────────

function scoreSpecialtyFit(provider: Provider, step: JourneyStep, profile: PatientProfile): number {
  // Does provider subcategory match what this step needs?
  const goal = profile.goal
  const type = provider.type
  const sub  = provider.subcategory.toLowerCase()

  // Medical providers — specialty matching by journey type
  if (type === 'medical') {
    if (goal === 'IUI' && sub.includes('reproductive')) return 1.0
    if (goal === 'IVF' && sub.includes('reproductive')) return 1.0
    if (goal === 'IVF_donor' && sub.includes('donor'))  return 1.0
    if (goal === 'exploring' && sub.includes('advanced')) return 1.0
    if (sub.includes('laboratory') || sub.includes('radiology')) return 0.8
    if (sub.includes('pharmacy'))  return 0.7
    if (sub.includes('genetics'))  return 0.75
    return 0.5
  }

  // Financial providers — always relevant
  if (type === 'financial') {
    if (profile.budget < 10000) return 1.0  // High priority for budget-constrained
    if (profile.budget < 25000) return 0.8
    return 0.6
  }

  // Emotional providers — more relevant for harder journeys
  if (type === 'emotional') {
    if (goal === 'exploring') return 1.0    // Failed cycles need most support
    if (goal === 'IVF_donor') return 0.9
    if (goal === 'IVF')       return 0.8
    return 0.7
  }

  // Legal providers — most relevant for donor/exploring
  if (type === 'legal') {
    if (goal === 'IVF_donor') return 1.0
    if (goal === 'exploring') return 0.9
    return 0.5
  }

  return 0.5
}

function scoreInsuranceMatch(provider: Provider, profile: PatientProfile): number {
  // In production: real insurance network API call
  // For demo: simulate based on budget tier and provider type
  if (profile.insurance === 'Self-pay / No insurance') {
    return provider.budgetTier === 'low' ? 0.9 : 0.5
  }

  // Mandate states get better insurance coverage simulation
  const MANDATE_STATES = ['MA','IL','NY','NJ','CT','MD','RI','WV','TX','CA','CO','DE','HI','LA','ME','MN','MT','NH','OH']
  const inMandateState = MANDATE_STATES.includes(profile.state)

  if (provider.type === 'financial') return 0.9  // Financial coordinators help with any insurance
  if (inMandateState && provider.type === 'medical') return 0.85
  if (!inMandateState && provider.type === 'medical') return 0.65
  return 0.75
}

function scoreBudgetFit(provider: Provider, profile: PatientProfile): number {
  // Match provider budget tier to patient budget
  const budget = profile.budget
  const tier   = provider.budgetTier

  if (tier === 'any') return 1.0
  if (tier === 'low'    && budget < 10000)  return 1.0
  if (tier === 'medium' && budget < 25000)  return 0.9
  if (tier === 'high'   && budget >= 25000) return 1.0
  if (tier === 'high'   && budget < 25000)  return 0.3  // Provider likely too expensive
  if (tier === 'medium' && budget >= 25000) return 0.8
  if (tier === 'low'    && budget >= 10000) return 0.7
  return 0.5
}

function scoreLocation(provider: Provider, profile: PatientProfile): number {
  // In production: real distance calculation via Google Maps API
  // For demo: state-level matching
  if (!provider.locationStates || provider.locationStates.length === 0) return 0.7
  if (provider.locationStates.includes(profile.state)) return 1.0
  return 0.4
}

function scoreSART(provider: Provider): number {
  // SART attestation is a strong quality signal for medical providers
  if (provider.sartAttested) return 1.0
  if (provider.type === 'medical') return 0.6
  return 0.8  // Non-medical providers don't need SART
}

// ─── Health Condition Boost ───────────────────────────────────────────────────
// Boosts providers that are specifically relevant to the patient's health notes

function getConditionBoost(provider: Provider, profile: PatientProfile): number {
  const notes = profile.healthNotes.toLowerCase()
  const sub   = provider.subcategory.toLowerCase()
  const name  = provider.name.toLowerCase()

  if (notes.includes('pcos') && (sub.includes('reproductive') || name.includes('fertility'))) return 0.10
  if (notes.includes('male factor') && sub.includes('male')) return 0.15
  if (notes.includes('donor') && (sub.includes('donor') || sub.includes('genetics'))) return 0.12
  if (notes.includes('failed') && provider.type === 'emotional') return 0.10
  if (notes.includes('failed') && sub.includes('advanced')) return 0.12
  if (notes.includes('age') && sub.includes('advanced')) return 0.10
  return 0
}

// ─── Main Scoring Function ────────────────────────────────────────────────────

export interface ProviderScore {
  provider:       Provider
  totalScore:     number
  breakdown: {
    specialtyFit:   number
    insuranceMatch: number
    budgetFit:      number
    locationScore:  number
    sartScore:      number
    conditionBoost: number
  }
  matchTier: 'excellent' | 'good' | 'fair' | 'limited'
  matchPercent: number
}

export function scoreProvider(
  provider: Provider,
  step: JourneyStep,
  profile: PatientProfile
): ProviderScore {
  const breakdown = {
    specialtyFit:   scoreSpecialtyFit(provider, step, profile),
    insuranceMatch: scoreInsuranceMatch(provider, profile),
    budgetFit:      scoreBudgetFit(provider, profile),
    locationScore:  scoreLocation(provider, profile),
    sartScore:      scoreSART(provider),
    conditionBoost: getConditionBoost(provider, profile),
  }

  const weightedScore =
    breakdown.specialtyFit   * WEIGHTS.specialtyFit   +
    breakdown.insuranceMatch  * WEIGHTS.insuranceMatch +
    breakdown.budgetFit       * WEIGHTS.budgetFit      +
    breakdown.locationScore   * WEIGHTS.locationScore  +
    breakdown.sartScore       * WEIGHTS.sartScore      +
    breakdown.conditionBoost  // additive bonus, not weighted

  const totalScore    = Math.min(weightedScore, 1.0)
  const matchPercent  = Math.round(totalScore * 100)
  const matchTier     = matchPercent >= 85 ? 'excellent'
                      : matchPercent >= 70 ? 'good'
                      : matchPercent >= 55 ? 'fair'
                      : 'limited'

  return { provider, totalScore, breakdown, matchTier, matchPercent }
}

// ─── Rank All Providers for a Step ───────────────────────────────────────────

export function rankProviders(
  step: JourneyStep,
  profile: PatientProfile
): ProviderScore[] {
  return step.providers
    .map(provider => scoreProvider(provider, step, profile))
    .sort((a, b) => b.totalScore - a.totalScore)
}

// ─── Hard Filters (applied before scoring) ───────────────────────────────────
// These eliminate providers that cannot serve this patient regardless of score
// In production: would include real insurance network API + license verification

export function hardFilter(provider: Provider, profile: PatientProfile): boolean {
  // Budget hard limit — provider tier is 'high' but patient budget is very low
  if (provider.budgetTier === 'high' && profile.budget < 5000) return false

  // Legal providers only relevant for donor/exploring journeys
  if (provider.type === 'legal' && profile.goal === 'IUI') return false

  // Surrogate agency only for exploring journey
  if (provider.id === 'surrogate_agency' && profile.goal !== 'exploring') return false

  return true
}

export function rankProvidersWithFilter(
  step: JourneyStep,
  profile: PatientProfile
): ProviderScore[] {
  return step.providers
    .filter(p => hardFilter(p, profile))
    .map(p => scoreProvider(p, step, profile))
    .sort((a, b) => b.totalScore - a.totalScore)
}

// ─── Build Claude API Prompt ──────────────────────────────────────────────────
// Takes ranked scores and builds a structured prompt for explanation generation

export function buildMatchingPrompt(
  rankedProviders: ProviderScore[],
  step: JourneyStep,
  profile: PatientProfile
): string {
  const top3 = rankedProviders.slice(0, 3)

  return `You are PtP's provider matching assistant. A patient needs help understanding why specific providers were recommended for their fertility journey step.

PATIENT PROFILE:
- Name context: ${profile.name}
- Age: ${profile.age}
- Goal: ${profile.goal}
- Location: ${profile.location} (${profile.state})
- Insurance: ${profile.insurance}
- Budget: $${profile.budget.toLocaleString()}
- Health notes: ${profile.healthNotes}
- State law context: ${profile.statelaw}

CURRENT JOURNEY STEP: ${step.title}
Step description: ${step.subtitle}

TOP MATCHED PROVIDERS (ranked by weighted score):
${top3.map((ps, i) => `
${i + 1}. ${ps.provider.name} — ${ps.matchPercent}% match
   Type: ${ps.provider.type} | ${ps.provider.subcategory}
   Score breakdown:
   - Specialty fit: ${Math.round(ps.breakdown.specialtyFit * 100)}%
   - Insurance match: ${Math.round(ps.breakdown.insuranceMatch * 100)}%
   - Budget fit: ${Math.round(ps.breakdown.budgetFit * 100)}%
   - Location score: ${Math.round(ps.breakdown.locationScore * 100)}%
   - Quality (SART): ${Math.round(ps.breakdown.sartScore * 100)}%
   Provider description: ${ps.provider.description}
   Why relevant: ${ps.provider.relevance}
`).join('')}

YOUR TASK:
Write a short, warm, and clear explanation for this patient covering:
1. Why provider #1 is their best match (2-3 sentences, specific to their profile)
2. One sentence each on providers #2 and #3
3. One "best next step" recommendation — what should the patient do first?
4. If any provider has a limitation for this patient, mention it honestly

IMPORTANT RULES:
- Never give medical advice or diagnoses
- Be warm and encouraging but honest
- Keep total response under 200 words
- Speak directly to the patient ("Your top match is...")
- Reference their specific insurance, location, and budget where relevant
- Do NOT use bullet points — write in natural flowing paragraphs`
}