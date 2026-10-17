import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowLeft, ChevronRight, Landmark } from 'lucide-react'
import CampaignLibrary from './components/CampaignLibrary'
import CampaignSetup from './components/CampaignSetup'
import Dashboard from './components/Dashboard'
import ExecutivePanel from './components/ExecutivePanel'
import EconomyPanel from './components/EconomyPanel'
import PolicyProjectsPanel from './components/PolicyProjectsPanel'
import SocietyPanel from './components/SocietyPanel'
import LegislaturePanel from './components/LegislaturePanel'
import TopNavigation from './components/TopNavigation'
import { createCampaign } from './engine/campaign'
import {
  appointMinister,
  dismissMinister,
  negotiateMinisterNomination,
  proposeMinistryReorganization,
} from './engine/executive'
import {
  adjustEconomicTax,
  deferEconomicPayments,
  proposeTaxReform,
  reviseBudgetDistribution,
  takeEmergencyLoan,
} from './engine/economy'
import { advanceWeek, chooseNarrativeOption, dismissDecisionResult, dismissWeeklySummary } from './engine/turn'
import { adjustPublicProjectPriority, startPublicProject, togglePublicProjectPause } from './engine/projects'
import { applySocietyAction } from './engine/society'
import { decidePresidentialSanction, negotiateLegislativeProposal, submitLegislativeProposal } from './engine/legislature'
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
  congresso: 'Congresso',
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
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!actionNotice) return
    const timeout = window.setTimeout(() => setActionNotice(null), 4200)
    return () => window.clearTimeout(timeout)
  }, [actionNotice])

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

  function runExecutiveAction(nextCampaign: CampaignState | null, failureMessage: string) {
    if (!nextCampaign) {
      setStorageError(failureMessage)
      return
    }
    if (persistCampaign(nextCampaign)) setActionNotice('Ação do Executivo registrada com sucesso.')
  }

  function runEconomicAction(nextCampaign: CampaignState | null, failureMessage: string) {
    if (!nextCampaign) {
      setStorageError(failureMessage)
      return
    }
    if (persistCampaign(nextCampaign)) setActionNotice('Mudança econômica registrada com sucesso.')
  }

  function runPolicyAction(nextCampaign: CampaignState | null, message: string) {
    if (!nextCampaign) { setStorageError(message); return }
    if (persistCampaign(nextCampaign)) setActionNotice('Ação registrada. O estado do jogo foi atualizado.')
    setStorageError(null)
  }

  function chooseDecision(optionId: string, category: 'decisão' | 'reação' | 'mensal') {
    if (!campaign) return
    const nextCampaign = chooseNarrativeOption(campaign, category, optionId)
    if (nextCampaign && persistCampaign(nextCampaign)) setActionNotice('Decisão registrada. As consequências foram aplicadas.')
  }

  function closeDecisionResult() {
    if (campaign) persistCampaign(dismissDecisionResult(campaign))
  }

  function moveToNextWeek() {
    if (!campaign) return
    if (persistCampaign(advanceWeek(campaign))) {
      setActionNotice('Semana encerrada. O resumo e os acontecimentos foram atualizados.')
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    }
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
            <button aria-label="Avançar para a próxima semana" className="header-advance-button" onClick={moveToNextWeek} type="button"><span>Avançar semana</span><ChevronRight aria-hidden="true" size={16} /></button>
            <button className="game-menu-button" onClick={returnToLibrary} type="button"><ArrowLeft aria-hidden="true" size={14} /> Menu</button>
            {saveStatus === 'saved' && <span aria-label={`Salvo${lastSavedAt ? ` em ${lastSavedAt}` : ''}`} className="save-indicator" role="status">Salvo</span>}
          </div>
        </div>
        <TopNavigation activeSection={activeSection} onNavigate={setActiveSection} />
      </header>

      {storageError && <p className="storage-error-banner" role="alert">{storageError}</p>}
      {actionNotice && <p className="action-notice" role="status">{actionNotice}</p>}

      {activeSection === 'brasil' ? (
        <Dashboard
          campaign={campaign}
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
      ) : activeSection === 'economia' ? (
        <EconomyPanel
          campaign={campaign}
          onAdjustTax={(taxId, direction) => runEconomicAction(
            adjustEconomicTax(campaign, taxId, direction),
            'O ajuste tributário não foi realizado. Verifique os limites do tributo e os recursos disponíveis.',
          )}
          onDeferPayments={() => runEconomicAction(
            deferEconomicPayments(campaign),
            'O adiamento emergencial não está disponível nas condições atuais.',
          )}
          onEmergencyLoan={() => runEconomicAction(
            takeEmergencyLoan(campaign),
            'O crédito emergencial não está disponível. Verifique o caixa, a dívida e os recursos disponíveis.',
          )}
          onProposeReform={() => runEconomicAction(
            proposeTaxReform(campaign),
            'A proposta tributária não foi registrada. Verifique os recursos disponíveis ou se já foi enviada.',
          )}
          onReviseBudget={(shares) => runEconomicAction(
            reviseBudgetDistribution(campaign, shares),
            'A revisão orçamentária não foi aplicada. Verifique os limites, a janela e os recursos disponíveis.',
          )}
        />
      ) : activeSection === 'politicas' ? (
        <PolicyProjectsPanel campaign={campaign}
          onStartProject={(id, investment, priority) => runPolicyAction(startPublicProject(campaign,id,investment,priority),'Não foi possível iniciar o projeto. Confira recursos e dotação disponível.')}
          onAdjustPriority={(id, priority) => runPolicyAction(adjustPublicProjectPriority(campaign,id,priority),'Não foi possível ajustar a prioridade. Confira os recursos disponíveis.')}
          onTogglePause={(id) => runPolicyAction(togglePublicProjectPause(campaign,id),'Não foi possível pausar ou retomar o projeto. Confira os pontos de ação.')}
        />
      ) : activeSection === 'sociedade' ? (
        <SocietyPanel campaign={campaign}
          onDialogue={(id) => runPolicyAction(applySocietyAction(campaign,id,'dialogue'),'Não foi possível abrir o diálogo. Confira os pontos e recursos disponíveis.')}
          onAgreement={(id) => runPolicyAction(applySocietyAction(campaign,id,'agreement'),'Não foi possível registrar o compromisso. Confira caixa, dotação e recursos disponíveis.')}
        />
      ) : activeSection === 'congresso' ? (
        <LegislaturePanel campaign={campaign}
          onSubmitProposal={(input) => runPolicyAction(submitLegislativeProposal(campaign, input), 'A proposição não foi protocolada. Confira os requisitos, o impacto fiscal e os recursos disponíveis.')}
          onNegotiate={(billId) => runPolicyAction(negotiateLegislativeProposal(campaign, billId), 'A negociação não foi realizada. Confira se a proposta ainda está em tramitação e se há recursos disponíveis.')}
          onPresidentialDecision={(billId, decision) => runPolicyAction(decidePresidentialSanction(campaign, billId, decision), 'A decisão presidencial não foi registrada. Confira a etapa da proposição e os recursos disponíveis.')}
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