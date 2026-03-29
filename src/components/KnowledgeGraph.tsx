'use client'
import { useApp } from '@/context/AppContext'
import { JourneyStep, Provider } from '@/data/knowledgeGraph'
import { PROVIDER_TYPE_CONFIG } from '@/lib/providerConfig'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { X, ArrowRight, Star, Map } from 'lucide-react'
import ProviderMatcher from './ProviderMatcher'

interface GraphNode {
  id: string
  label: string
  sublabel?: string
  type: 'patient' | 'journey' | 'step' | 'provider'
  providerType?: string
  x: number
  y: number
  r: number
  color: string
  data?: JourneyStep | Provider
}

interface GraphEdge {
  from: string; to: string; color: string
}

function buildGraph(
  profile: NonNullable<ReturnType<typeof useApp>['selectedProfile']>,
  journey: NonNullable<ReturnType<typeof useApp>['activeJourney']>,
  inactiveSteps: Set<string>,
  completedSteps: Set<string>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const CX = 600, CY = 400

  // Patient node (center)
  nodes.push({
    id: 'patient', label: profile.emoji, sublabel: profile.name,
    type: 'patient', x: CX, y: CY, r: 36,
    color: '#E07B39',
  })

  // Journey node
  const journeyAngle = -Math.PI / 2
  const journeyR = 110
  const jx = CX + journeyR * Math.cos(journeyAngle)
  const jy = CY + journeyR * Math.sin(journeyAngle)
  nodes.push({
    id: 'journey', label: profile.goal, sublabel: journey.totalCostRange,
    type: 'journey', x: jx, y: jy, r: 28, color: '#5C3D2E',
  })
  edges.push({ from: 'patient', to: 'journey', color: '#E07B39' })

  // Step nodes — arranged in a circle around patient
  const stepCount = journey.steps.length
  const stepRadius = 220
  journey.steps.forEach((step, i) => {
    const angle = -Math.PI / 2 + (i / stepCount) * 2 * Math.PI
    const sx = CX + stepRadius * Math.cos(angle)
    const sy = CY + stepRadius * Math.sin(angle)
    const isCompleted = completedSteps.has(step.id)
    // Active by default — inactive only if user clicked to deactivate
    const isInactive = inactiveSteps.has(step.id)
    nodes.push({
      id: step.id,
      label: step.icon,
      sublabel: `${step.stepNumber}. ${step.title.split(' ').slice(0,3).join(' ')}`,
      type: 'step',
      x: sx, y: sy, r: 24,
      color: isCompleted ? '#4A7C59' : isInactive ? '#C4B5AC' : '#E07B39',
      data: step,
    })
    edges.push({ from: 'journey', to: step.id, color: isCompleted ? '#4A7C59' : isInactive ? '#E8DDD4' : '#E07B39' })

    // Provider nodes — always show for active steps, hide for inactive steps
    if (!isInactive) {
      const providers = (step as JourneyStep).providers
      const provRadius = 90
      const totalAngleSpread = Math.PI * 0.6
      providers.forEach((prov, j) => {
        const provAngle = angle - totalAngleSpread / 2 + (j / Math.max(providers.length - 1, 1)) * totalAngleSpread
        const px = sx + provRadius * Math.cos(provAngle)
        const py = sy + provRadius * Math.sin(provAngle)
        const cfg = PROVIDER_TYPE_CONFIG[prov.type]
        nodes.push({
          id: `prov-${step.id}-${prov.id}`,
          label: cfg.icon,
          sublabel: prov.name,
          type: 'provider',
          providerType: prov.type,
          x: px, y: py, r: 12,
          color: cfg.color,
          data: prov,
        })
        edges.push({
          from: step.id,
          to: `prov-${step.id}-${prov.id}`,
          color: cfg.color,
        })
      })
    }
  })

  return { nodes, edges }
}

export default function KnowledgeGraph() {
  const { activeJourney, selectedProfile, completedSteps, setScreen } = useApp()
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [filter, setFilter] = useState<string>('all')
  // All steps active by default — clicking a step toggles it inactive
  const [inactiveSteps, setInactiveSteps] = useState<Set<string>>(new Set())

  if (!activeJourney || !selectedProfile) return null

  const { nodes, edges } = useMemo(() =>
    buildGraph(selectedProfile, activeJourney, inactiveSteps, completedSteps),
    [selectedProfile, activeJourney, inactiveSteps, completedSteps]
  )

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node.id === selectedNode?.id ? null : node)
    if (node.type === 'step') {
      setInactiveSteps(prev => {
        const next = new Set(prev)
        next.has(node.id) ? next.delete(node.id) : next.add(node.id)
        return next
      })
    }
  }

  const visibleNodes = filter === 'all'
    ? nodes
    : nodes.filter(n => n.type !== 'provider' || n.providerType === filter)

  const visibleIds = new Set(visibleNodes.map(n => n.id))
  const visibleEdges = edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to))

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-ptp-cream">
      {/* Graph canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-ptp-text">Knowledge Graph</h2>
            <p className="text-xs text-ptp-muted">
              {nodes.filter(n => n.type === 'provider').length} ecosystem providers mapped across{' '}
              {activeJourney.steps.length} journey steps
            </p>
          </div>
          <button
            onClick={() => setScreen('journey')}
            className="flex items-center gap-1.5 text-xs text-ptp-muted hover:text-ptp-text
                       bg-white border border-ptp-border px-3 py-1.5 rounded-full transition-colors"
          >
            <Map size={12} /> Back to Journey
          </button>
        </div>

        {/* Filter bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20
                        flex items-center gap-2 bg-white border border-ptp-border
                        rounded-full px-4 py-2 shadow-ptp-card">
          {['all', 'medical', 'financial', 'emotional', 'legal'].map(f => {
            const cfg = f === 'all' ? null : PROVIDER_TYPE_CONFIG[f as any]
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  text-xs font-medium px-3 py-1 rounded-full transition-all duration-200
                  ${filter === f
                    ? f === 'all' ? 'bg-ptp-orange text-white' : 'text-white'
                    : 'text-ptp-muted hover:text-ptp-text bg-ptp-sand'
                  }
                `}
                style={filter === f && cfg ? { backgroundColor: cfg.color } : undefined}
              >
                {cfg?.icon} {f === 'all' ? 'All providers' : cfg?.label}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="absolute top-20 left-4 z-20 bg-white/90 border border-ptp-border
                        rounded-xl p-3 text-xs space-y-1.5">
          <p className="font-semibold text-ptp-muted uppercase tracking-widest mb-2" style={{ fontSize: 10 }}>Legend</p>
          <LegendItem color="#E07B39" label="Patient" />
          <LegendItem color="#5C3D2E" label="Journey" />
          <LegendItem color="#8C7B6E" label="Step" />
          <LegendItem color="#4A7C59" label="Completed step" />
          {Object.entries(PROVIDER_TYPE_CONFIG).map(([type, cfg]) => (
            <LegendItem key={type} color={cfg.color} label={cfg.label + ' provider'} />
          ))}
          <p className="text-ptp-muted mt-2 pt-2 border-t border-ptp-border" style={{ fontSize: 10 }}>
            All providers shown by default. Click a step to collapse it.
          </p>
        </div>

        {/* SVG Graph */}
        <svg
          viewBox="0 0 1200 800"
          className="w-full h-full"
          style={{ cursor: 'grab' }}
        >
          <defs>
            {/* Glow filter for active nodes */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Background grid dots */}
          <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#E8DDD4" opacity="0.6" />
          </pattern>
          <rect width="1200" height="800" fill="url(#dots)" />

          {/* Edges */}
          {visibleEdges.map((edge, i) => {
            const from = nodes.find(n => n.id === edge.from)
            const to = nodes.find(n => n.id === edge.to)
            if (!from || !to) return null
            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={edge.color} strokeWidth="1.5" strokeOpacity="0.4"
                strokeDasharray={edge.color === '#E8DDD4' ? '4 4' : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ delay: i * 0.02, duration: 0.5 }}
              />
            )
          })}

          {/* Nodes */}
          {visibleNodes.map((node, i) => {
            const isHovered = hoveredNode?.id === node.id
            const isSelected = selectedNode?.id === node.id
            const isActive = node.type === 'step' && !inactiveSteps.has(node.id)

            return (
              <motion.g
                key={node.id}
                className="graph-node"
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              >
                {/* Glow ring for active/hovered */}
                {(isActive || isHovered || isSelected) && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.r + 8}
                    fill={node.color} opacity="0.15"
                    filter="url(#glow)"
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={node.x} cy={node.y} r={node.r}
                  fill={node.color}
                  fillOpacity={isHovered ? 1 : 0.85}
                  stroke="white" strokeWidth="2.5"
                  style={{ filter: isActive ? 'url(#glow)' : undefined }}
                />

                {/* Icon/emoji label */}
                <text
                  x={node.x} y={node.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={node.type === 'patient' ? 20 : node.type === 'journey' ? 11 : node.type === 'step' ? 14 : 10}
                  fontWeight={node.type === 'journey' ? '600' : '400'}
                  fill="white"
                >
                  {node.label}
                </text>

                {/* Sublabel */}
                {(isHovered || isSelected || node.type === 'patient' || node.type === 'step') && node.sublabel && (
                  <text
                    x={node.x} y={node.y + node.r + 14}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="10" fontWeight="500"
                    fill={node.color}
                  >
                    {node.sublabel.length > 22 ? node.sublabel.slice(0, 22) + '…' : node.sublabel}
                  </text>
                )}
              </motion.g>
            )
          })}
        </svg>
      </div>

      {/* Right detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-72 bg-white border-l border-ptp-border overflow-y-auto shrink-0"
          >
            <NodeDetailPanel node={selectedNode} journey={activeJourney} profile={selectedProfile} onClose={() => setSelectedNode(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NodeDetailPanel({ node, journey, profile, onClose }: {
  node: GraphNode
  journey: NonNullable<ReturnType<typeof useApp>['activeJourney']>
  profile: NonNullable<ReturnType<typeof useApp>['selectedProfile']>
  onClose: () => void
}) {
  const isStep = node.type === 'step'
  const isProvider = node.type === 'provider'
  const step = isStep ? journey.steps.find(s => s.id === node.id) : null
  const cfg = isProvider && node.providerType ? PROVIDER_TYPE_CONFIG[node.providerType as any] : null

  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b border-ptp-border flex items-start justify-between">
        <div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-2"
            style={{ backgroundColor: `${node.color}20` }}
          >
            <span>{node.label}</span>
          </div>
          <h3 className="font-semibold text-ptp-text text-sm leading-snug">{node.sublabel}</h3>
          <p className="text-xs text-ptp-muted capitalize mt-0.5">{node.type} node</p>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-ptp-sand flex items-center justify-center">
          <X size={12} className="text-ptp-muted" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Step detail */}
        {step && (
          <>
            <div>
              <p className="text-xs font-semibold text-ptp-muted uppercase tracking-wide mb-2">Cost</p>
              <div className="space-y-1">
                <CostRow label="Total" value={`$${step.totalCost.toLocaleString()}`} />
                <CostRow label="Insurance" value={`-$${step.insuranceCoverage.toLocaleString()}`} color="text-ptp-green" />
                <CostRow label="Your cost" value={`$${step.yourCost.toLocaleString()}`} color="text-ptp-orange" bold />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-ptp-muted uppercase tracking-wide mb-2">Requirements</p>
              <div className="space-y-1">
                {step.requirements.slice(0, 4).map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-ptp-text">
                    <span className="text-ptp-orange mt-0.5">•</span>{r}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-ptp-muted uppercase tracking-wide mb-2">
                Providers ({step.providers.length})
              </p>
              <div className="space-y-1.5">
                {step.providers.map(p => {
                  const pcfg = PROVIDER_TYPE_CONFIG[p.type]
                  return (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <span>{pcfg.icon}</span>
                      <span className="text-ptp-text">{p.name}</span>
                      <span className="ml-auto tag-pill" style={{ backgroundColor: pcfg.bg, color: pcfg.color }}>
                        {pcfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Provider detail */}
        {isProvider && node.data && cfg && (
          <>
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: cfg.bg, borderColor: cfg.border, border: '1px solid' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="tag-pill text-white" style={{ backgroundColor: cfg.color }}>
                  {cfg.label}
                </span>
                {(node.data as Provider).sartAttested && (
                  <span className="tag-pill bg-blue-50 text-blue-700 border border-blue-200">
                    <Star size={8} className="inline mr-0.5" />SART
                  </span>
                )}
              </div>
              <p className="text-xs text-ptp-muted mb-2">{(node.data as Provider).description}</p>
              <div className="flex items-start gap-1.5">
                <ArrowRight size={10} className="mt-0.5 shrink-0" style={{ color: cfg.color }} />
                <p className="text-xs" style={{ color: cfg.color }}>
                  {(node.data as Provider).relevance}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Patient / Journey node */}
        {(node.type === 'patient' || node.type === 'journey') && (
          <div className="bg-ptp-sand rounded-xl p-3">
            <p className="text-xs text-ptp-muted leading-relaxed">
              This is the central node of the knowledge graph. All journey steps and ecosystem providers connect through here.
            </p>
          </div>
        )}
      </div>

      {/* Provider Matching Agent — shown when a step node is selected */}
      {node.type === 'step' && step && (
        <ProviderMatcher step={step} profile={profile} />
      )}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-ptp-muted">{label}</span>
    </div>
  )
}

function CostRow({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-ptp-muted">{label}</span>
      <span className={`${color || 'text-ptp-text'} ${bold ? 'font-semibold' : ''}`}>{value}</span>
    </div>
  )
}