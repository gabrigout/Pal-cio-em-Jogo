import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Landmark } from 'lucide-react'
import CampaignSetup from './components/CampaignSetup'
import Dashboard from './components/Dashboard'
import TopNavigation from './components/TopNavigation'
import { createCampaign, getReadableTextColor } from './engine/campaign'
import type { CampaignState, PartySelection, PoliticalOrientation, SectionId } from './state/types'

const sectionTitles: Record<Exclude<SectionId, 'brasil'>, string> = {
  estado: 'Estado',
  economia: 'Economia',
  politicas: 'Políticas Públicas',
  sociedade: 'Sociedade',
  relacoes: 'Relações',
  historico: 'Notícias/Histórico',
}

export default function App() {
  const [campaign, setCampaign] = useState<CampaignState | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('brasil')

  function startCampaign(orientation: PoliticalOrientation, party: PartySelection) {
    setCampaign(createCampaign(orientation, party))
  }

  if (!campaign) {
    return (
      <div className="app-shell setup-shell">
        <CampaignSetup onStart={startCampaign} />
        <div aria-hidden="true" className="site-bottom-line" />
      </div>
    )
  }

  const { month, year, week, weeksPerMonth } = campaign.calendar
  const themeStyle = {
    '--party-primary': campaign.party.colors[0],
    '--party-secondary': campaign.party.colors[1],
    '--party-on-primary': getReadableTextColor(campaign.party.colors[0]),
  } as CSSProperties

  return (
    <div className="app-shell" style={themeStyle}>
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
          <div aria-label={`Partido ${campaign.party.fullName}`} className="party-identity">
            <span className="party-colors" aria-hidden="true">
              {campaign.party.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
            </span>
            <span className="party-acronym">{campaign.party.acronym}</span>
            <span className="party-name">{campaign.party.fullName}</span>
          </div>
        </div>
        <TopNavigation activeSection={activeSection} onNavigate={setActiveSection} />
      </header>

      {activeSection === 'brasil' ? (
        <Dashboard campaign={campaign} onAdvanceWeek={() => undefined} />
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