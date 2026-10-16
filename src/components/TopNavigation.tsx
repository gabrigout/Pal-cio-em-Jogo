import {
  Building2,
  BookOpen,
  ShieldCheck,
  Globe2,
  Gavel,
  Landmark,
  Newspaper,
  Scale,
  UsersRound,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SectionId } from '../state/types'

interface NavigationItem {
  id: SectionId
  label: string
  icon: LucideIcon
}

const navigationItems: NavigationItem[] = [
  { id: 'brasil', label: 'Brasil', icon: Globe2 },
  { id: 'estado', label: 'Estado', icon: Landmark },
  { id: 'economia', label: 'Economia', icon: Wallet },
  { id: 'politicas', label: 'Políticas Públicas', icon: Building2 },
  { id: 'sociedade', label: 'Sociedade', icon: UsersRound },
  { id: 'congresso', label: 'Congresso', icon: Gavel },
  { id: 'judiciario', label: 'Judiciário', icon: BookOpen },
  { id: 'controle', label: 'Controle', icon: ShieldCheck },
  { id: 'relacoes', label: 'Relações', icon: Scale },
  { id: 'historico', label: 'Notícias/Histórico', icon: Newspaper },
]

interface TopNavigationProps {
  activeSection: SectionId
  onNavigate: (section: SectionId) => void
}

export default function TopNavigation({ activeSection, onNavigate }: TopNavigationProps) {
  return (
    <nav className="top-navigation" aria-label="Navegação principal">
      <div className="navigation-scroll">
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button
            aria-label={label}
            aria-current={activeSection === id ? 'page' : undefined}
            className={`navigation-item${activeSection === id ? ' is-active' : ''}`}
            key={id}
            onClick={() => onNavigate(id)}
            title={label}
            type="button"
          >
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            <span className="navigation-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}