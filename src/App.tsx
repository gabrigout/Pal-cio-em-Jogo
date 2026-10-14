import { useState } from 'react'
import { Landmark } from 'lucide-react'
import Dashboard from './components/Dashboard'
import TopNavigation from './components/TopNavigation'
import { initialCampaignState } from './state/initialState'
import type { SectionId } from './state/types'

const sectionTitles: Record<Exclude<SectionId, 'brasil'>, string> = {
  estado: 'Estado',
  economia: 'Economia',
  politicas: 'Políticas Públicas',
  sociedade: 'Sociedade',
  relacoes: 'Relações',
  historico: 'Notícias/Histórico',
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('brasil')
  const { month, year, week, weeksPerMonth } = initialCampaignState

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-main">
          <a aria-label="Palácio em Jogo, início" className="brand" href="#brasil" onClick={() => setActiveSection('brasil')}>
            <span aria-hidden="true" className="brand-mark"><Landmark size={22} strokeWidth={1.7} /></span>
            <span className="brand-copy">
              <span className="brand-title">PALÁCIO <b>EM JOGO</b></span>
              <span className="brand-subtitle">Palácio do Planalto <i>·</i> Brasília</span>
            </span>
          </a>
          <div className="campaign-date">
            <span className="date-label">CALENDÁRIO PRESIDENCIAL</span>
            <strong>{month} de {year} <span>—</span> Semana {week}/{weeksPerMonth}</strong>
          </div>
        </div>
        <TopNavigation activeSection={activeSection} onNavigate={setActiveSection} />
      </header>

      {activeSection === 'brasil' ? (
        <Dashboard onAdvanceWeek={() => undefined} />
      ) : (
        <main className="section-placeholder page-enter">
          <span className="section-placeholder-mark"><Landmark aria-hidden="true" size={23} /></span>
          <p className="eyebrow">PALÁCIO EM JOGO <span>·</span> PAINEL</p>
          <h1>{sectionTitles[activeSection]}</h1>
        </main>
      )}
      <div aria-hidden="true" className="site-bottom-line" />
    </div>
  )
}