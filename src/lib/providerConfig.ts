import { ProviderType } from '@/data/knowledgeGraph'

export const PROVIDER_TYPE_CONFIG: Record<ProviderType, {
  label: string; color: string; bg: string; border: string; icon: string
}> = {
  medical: {
    label: 'Medical', color: '#185FA5', bg: '#EBF3FC', border: '#B5D4F4', icon: '🏥',
  },
  financial: {
    label: 'Financial', color: '#BA7517', bg: '#FEF3DF', border: '#FAC775', icon: '💰',
  },
  emotional: {
    label: 'Emotional', color: '#993556', bg: '#FBEAF0', border: '#F4C0D1', icon: '💙',
  },
  legal: {
    label: 'Legal / Admin', color: '#3B6D11', bg: '#EAF3DE', border: '#C0DD97', icon: '⚖️',
  },
}
