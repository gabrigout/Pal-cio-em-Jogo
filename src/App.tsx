import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowLeft, Landmark } from 'lucide-react'
import CampaignLibrary from './components/CampaignLibrary'
import CampaignSetup from './components/CampaignSetup'
import Dashboard from './components/Dashboard'
import ExecutivePanel from './components/ExecutivePanel'
import TopNavigation from './components/TopNavigation'
import { createCampaign } from './engine/campaign'
import {
  appointMinister,
  dismissMinister,
  negotiateMinisterNomination,
  proposeMinistryReorganization,
} from './engine/executive'
import { advanceWeek, chooseNarrativeOption, dismissDecisionResult, dismissWeeklySummary, executeAction } from './engine/turn'
import { downloadCampaignBackup } from './persistence/backup'
import {
  deleteCampaign,
  importCampaignJson,
  listSavedCampaigns,
  loadCampaign,
  saveCampaign,
  type SavedCampaign,
} from './persistence/campaignRepository'
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
  const [screen, setScreen] = useState<'library' | 'setup' | 'game'>('library')
  const [campaign, setCampaign] = useState<CampaignState | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('brasil')
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([])
  const [storageIssues, setStorageIssues] = useState<string[]>([])
  const [storageError, setStorageError] = useState<string | null>(null)
  const [libraryNotice, setLibraryNotice] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  function refreshLibrary() {
    const result = listSavedCampaigns()
    setSavedCampaigns(result.campaigns)
    setStorageIssues(result.issues)
    setStorageError(result.error)
  }

  useEffect(() => {
    refreshLibrary()
  }, [])

  function persistCampaign(nextCampaign: CampaignState): boolean {
    setCampaign(nextCampaign)
    const result = saveCampaign(nextCampaign)
    if (!result.ok) {
      setSaveStatus(null)
      setStorageError(result.error)
      return false
    }
    setSaveStatus('saved')
    setLastSavedAt(result.value.savedAt)
    setStorageError(null)
    return true
  }

  function startCampaign(orientation: PoliticalOrientation, party: PartySelection) {
    const newCampaign = createCampaign(orientation, party)
    persistCampaign(newCampaign)
    setActiveSection('brasil')
    setScreen('game')
  }

  function runAction(actionId: string) {
    if (!campaign) return
    const nextCampaign = executeAction(campaign, actionId)
    if (nextCampaign) persistCampaign(nextCampaign)
  }

  function runExecutiveAction(nextCampaign: CampaignState | null, failureMessage: string) {
    if (!nextCampaign) {
      setStorageError(failureMessage)
      return
    }
    persistCampaign(nextCampaign)
  }

  function chooseDecision(optionId: string, category: 'decisão' | 'reação' | 'mensal') {
    if (!campaign) return
    const nextCampaign = chooseNarrativeOption(campaign, category, optionId)
    if (nextCampaign) persistCampaign(nextCampaign)
  }

  function closeDecisionResult() {
    if (campaign) persistCampaign(dismissDecisionResult(campaign))
  }

  function moveToNextWeek() {
    if (campaign) persistCampaign(advanceWeek(campaign))
  }

  function closeWeeklySummary() {
    if (campaign) persistCampaign(dismissWeeklySummary(campaign))
  }

  function returnToLibrary() {
    if (campaign && !persistCampaign(campaign)) return
    refreshLibrary()
    setScreen('library')
    setSaveStatus(null)
  }

  function continueCampaign(campaignId: string) {
    const result = loadCampaign(campaignId)
    if (!result.ok) {
      setStorageError(result.error)
      refreshLibrary()
      return
    }
    setCampaign(result.value.campaign)
    setLastSavedAt(result.value.savedAt)
    setSaveStatus(result.warning ? null : 'saved')
    setStorageError(result.warning ?? null)
    setActiveSection('brasil')
    setScreen('game')
  }

  function removeCampaign(campaignId: string) {
    if (!window.confirm('Essa ação não pode ser desfeita')) return
    const result = deleteCampaign(campaignId)
    if (!result.ok) {
      setStorageError(result.error)
      return
    }
    setStorageError(null)
    setLibraryNotice('Campanha excluída.')
    refreshLibrary()
  }

  function exportCampaign(savedCampaign: SavedCampaign) {
    try {
      downloadCampaignBackup(savedCampaign.campaign, savedCampaign.savedAt)
      setLibraryNotice('Backup exportado como arquivo JSON.')
    } catch {
      setStorageError('Não foi possível exportar o backup neste navegador.')
    }
  }

  async function importCampaign(file: File) {
    try {
      const result = importCampaignJson(await file.text())
      if (!result.ok) {
        setStorageError(result.error)
        return
      }
      setStorageError(null)
      setLibraryNotice(`Backup de ${result.value.campaign.party.acronym} importado.`)
      refreshLibrary()
    } catch {
      setStorageError('Não foi possível ler esse arquivo. Selecione um backup JSON válido.')
    }
  }

  if (screen === 'library') {
    return (
      <div className="app-shell setup-shell">
        <CampaignLibrary
          campaigns={savedCampaigns}
          error={storageError}
          issues={storageIssues}
          notice={libraryNotice}
          onContinue={continueCampaign}
          onDelete={removeCampaign}
          onExport={exportCampaign}
          onImport={importCampaign}
          onNewCampaign={() => {
            setStorageError(null)
            setLibraryNotice(null)
            setScreen('setup')
          }}
        />
        <div aria-hidden="true" className="site-bottom-line" />
      </div>
    )
  }

  if (screen === 'setup') {
    return (
      <div className="app-shell setup-shell">
        <CampaignSetup onBackToLibrary={() => setScreen('library')} onStart={startCampaign} />
        <div aria-hidden="true" className="site-bottom-line" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="app-shell setup-shell">
        <main className="library-empty-state">
          <p role="alert">A campanha ativa não está disponível.</p>
          <button className="library-new-button" onClick={() => setScreen('library')} type="button">Voltar às campanhas</button>
        </main>
      </div>
    )
  }

  const { month, year, week, weeksPerMonth } = campaign.calendar
  const themeStyle = {
    '--cor-primaria': campaign.theme.primary,
    '--cor-secundaria': campaign.theme.secondary,
    '--cor-botao-texto': campaign.theme.buttonText,
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
          <div className="header-utility">
            <button className="game-menu-button" onClick={returnToLibrary} type="button"><ArrowLeft aria-hidden="true" size={14} /> Menu</button>
            {saveStatus === 'saved' && <span aria-label={`Salvo${lastSavedAt ? ` em ${lastSavedAt}` : ''}`} className="save-indicator" role="status">Salvo</span>}
          </div>
        </div>
        <TopNavigation activeSection={activeSection} onNavigate={setActiveSection} />
      </header>

      {storageError && <p className="storage-error-banner" role="alert">{storageError}</p>}

      {activeSection === 'brasil' ? (
        <Dashboard
          campaign={campaign}
          onAdvanceWeek={moveToNextWeek}
          onChooseDecision={chooseDecision}
          onDismissDecisionResult={closeDecisionResult}
          onDismissSummary={closeWeeklySummary}
          onRunAction={runAction}
        />
      ) : activeSection === 'estado' ? (
        <ExecutivePanel
          campaign={campaign}
          onAppoint={(ministryId, candidateId) => runExecutiveAction(
            appointMinister(campaign, ministryId, candidateId),
            'A nomeação não foi concluída. Verifique os requisitos e recursos disponíveis.',
          )}
          onDismiss={(ministryId) => runExecutiveAction(
            dismissMinister(campaign, ministryId),
            'A exoneração não foi concluída. Verifique se há ministro e recursos disponíveis.',
          )}
          onNegotiate={(ministryId, candidateId) => runExecutiveAction(
            negotiateMinisterNomination(campaign, ministryId, candidateId),
            'A negociação não foi concluída. Verifique a indicação e os recursos disponíveis.',
          )}
          onProposeReorganization={() => runExecutiveAction(
            proposeMinistryReorganization(campaign),
            'A proposta não foi registrada. Verifique se há recursos disponíveis ou se ela já foi enviada.',
          )}
        />
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