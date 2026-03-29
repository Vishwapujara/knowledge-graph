'use client'
import { useApp } from '@/context/AppContext'
import ProfileSelector from './ProfileSelector'
import JourneyMap from './JourneyMap'
import KnowledgeGraph from './KnowledgeGraph'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, GitBranch, User } from 'lucide-react'

export default function MainApp() {
  const { screen, setScreen, selectedProfile } = useApp()

  return (
    <div className="min-h-screen bg-ptp-cream flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-ptp-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ptp-orange flex items-center justify-center">
              <span className="text-white text-xs font-semibold">PtP</span>
            </div>
            <div>
              <span className="font-semibold text-ptp-text text-sm">Partners to Parenthood</span>
              <span className="ml-2 text-xs text-ptp-muted">Knowledge Graph</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <NavBtn
              icon={<User size={14} />}
              label="Patient Profile"
              active={screen === 'profile'}
              onClick={() => setScreen('profile')}
            />
            <NavBtn
              icon={<Map size={14} />}
              label="Journey Map"
              active={screen === 'journey'}
              onClick={() => setScreen('journey')}
              disabled={!selectedProfile}
            />
            <NavBtn
              icon={<GitBranch size={14} />}
              label="Knowledge Graph"
              active={screen === 'graph'}
              onClick={() => setScreen('graph')}
              disabled={!selectedProfile}
            />
          </nav>

          {/* Active profile badge */}
          {selectedProfile && (
            <div className="flex items-center gap-2 bg-ptp-sand px-3 py-1.5 rounded-full border border-ptp-border">
              <span className="text-base leading-none">{selectedProfile.emoji}</span>
              <span className="text-xs font-medium text-ptp-brown">{selectedProfile.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Screen content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {screen === 'profile' && (
            <motion.div key="profile"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <ProfileSelector />
            </motion.div>
          )}
          {screen === 'journey' && (
            <motion.div key="journey"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <JourneyMap />
            </motion.div>
          )}
          {screen === 'graph' && (
            <motion.div key="graph"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <KnowledgeGraph />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function NavBtn({ icon, label, active, onClick, disabled }: {
  icon: React.ReactNode; label: string; active: boolean
  onClick: () => void; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${active
          ? 'bg-ptp-orange text-white shadow-sm'
          : disabled
            ? 'text-ptp-border cursor-not-allowed'
            : 'text-ptp-muted hover:text-ptp-text hover:bg-ptp-sand'
        }
      `}
    >
      {icon}{label}
    </button>
  )
}
