'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { PatientProfile, PATIENT_PROFILES, JOURNEYS, Journey, JourneyStep } from '@/data/knowledgeGraph'

type Screen = 'profile' | 'journey' | 'graph'

interface AppContextType {
  screen: Screen
  setScreen: (s: Screen) => void
  selectedProfile: PatientProfile | null
  setSelectedProfile: (p: PatientProfile) => void
  activeJourney: Journey | null
  activeStep: JourneyStep | null
  setActiveStep: (s: JourneyStep | null) => void
  completedSteps: Set<string>
  toggleStepComplete: (id: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('profile')
  const [selectedProfile, setSelectedProfileState] = useState<PatientProfile | null>(null)
  const [activeStep, setActiveStep] = useState<JourneyStep | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const setSelectedProfile = (p: PatientProfile) => {
    setSelectedProfileState(p)
    setActiveStep(null)
    setCompletedSteps(new Set())
  }

  const activeJourney = selectedProfile ? JOURNEYS[selectedProfile.goal] : null

  const toggleStepComplete = (id: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <AppContext.Provider value={{
      screen, setScreen,
      selectedProfile, setSelectedProfile,
      activeJourney, activeStep, setActiveStep,
      completedSteps, toggleStepComplete,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
