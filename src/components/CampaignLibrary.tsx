import { useRef } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import { ArrowDownToLine, ArrowRight, FileUp, FolderOpen, Plus, Trash2 } from 'lucide-react'
import type { SavedCampaign } from '../persistence/campaignRepository'

interface CampaignLibraryProps {
  campaigns: SavedCampaign[]
  issues: string[]
  error: string | null
  notice: string | null
  onContinue: (campaignId: string) => void
  onNewCampaign: () => void
  onDelete: (campaignId: string) => void
  onExport: (savedCampaign: SavedCampaign) => void
  onImport: (file: File) => void
}

function formatSavedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data de salvamento indisponível'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export default function CampaignLibrary({
  campaigns,
  issues,
  error,
  notice,
  onContinue,
  onNewCampaign,
  onDelete,
  onExport,
  onImport,
}: CampaignLibraryProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  function chooseImportFile() {
    fileInput.current?.click()
  }

  function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onImport(file)
    event.target.value = ''
  }

  return (
    <main className="campaign-library page-enter">
      <header className="library-header">
        <a aria-label="Palácio em Jogo" className="library-brand" href="#campanhas">
          <span className="library-brand-mark"><FolderOpen aria-hidden="true" size={21} /></span>
          <span><strong>PALÁCIO <b>EM JOGO</b></strong><small>Campanhas locais</small></span>
        </a>
        <span className="library-local-label">SALVAMENTO NO NAVEGADOR</span>
      </header>

      <section aria-labelledby="library-title" className="library-content">
        <div className="library-title-row">
          <div>
            <p className="eyebrow">ARQUIVO DE GOVERNO <span>·</span> {campaigns.length.toString().padStart(2, '0')} CAMPANHAS</p>
            <h1 id="library-title">Suas campanhas.</h1>
            <p>Continue de onde parou ou abra uma nova trajetória.</p>
          </div>
          <div className="library-toolbar">
            <button className="library-import-button" onClick={chooseImportFile} type="button"><FileUp aria-hidden="true" size={15} /> Importar backup</button>
            <button className="library-new-button" onClick={onNewCampaign} type="button"><Plus aria-hidden="true" size={16} /> Nova campanha</button>
          </div>
        </div>
        <input accept=".json,application/json" aria-label="Selecionar arquivo de backup JSON" className="library-file-input" onChange={handleImportChange} ref={fileInput} type="file" />

        {error && <p className="library-message is-error" role="alert">{error}</p>}
        {notice && <p className="library-message" role="status">{notice}</p>}
        {issues.map((issue, index) => <p className="library-message is-warning" key={`${issue}-${index}`} role="status">{issue}</p>)}

        {campaigns.length === 0 ? (
          <div className="library-empty-state">
            <span><FolderOpen aria-hidden="true" size={23} /></span>
            <h2>Nenhuma campanha salva.</h2>
            <p>Comece uma campanha ou importe um arquivo de backup JSON.</p>
            <button className="library-new-button" onClick={onNewCampaign} type="button"><Plus aria-hidden="true" size={16} /> Nova campanha</button>
          </div>
        ) : (
          <div className="campaign-save-list">
            {campaigns.map((savedCampaign) => {
              const { campaign, savedAt } = savedCampaign
              const cardTheme = {
                '--cor-primaria': campaign.theme.primary,
                '--cor-secundaria': campaign.theme.secondary,
                '--cor-botao-texto': campaign.theme.buttonText,
              } as CSSProperties
              return (
                <article className="campaign-save-card" key={campaign.id} style={cardTheme}>
                  <div className="save-card-main">
                    <div aria-label={`Cores oficiais de ${campaign.party.acronym}`} className="save-card-colors">
                      {campaign.party.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
                    </div>
                    <div className="save-card-party">
                      <div><span className="save-party-acronym">{campaign.party.acronym}</span><strong>{campaign.party.fullName}</strong></div>
                      <span className="save-game-date">{campaign.calendar.month} de {campaign.calendar.year} <i>·</i> Semana {campaign.calendar.week}/{campaign.calendar.weeksPerMonth}</span>
                    </div>
                    <div className="save-last-saved"><small>ÚLTIMO SALVAMENTO</small><strong>{formatSavedAt(savedAt)}</strong></div>
                    <button aria-label={`Continuar campanha ${campaign.party.acronym}`} className="save-continue-button" onClick={() => onContinue(campaign.id)} type="button">
                      Continuar <ArrowRight aria-hidden="true" size={15} />
                    </button>
                  </div>
                  <div className="save-card-actions">
                    <button onClick={() => onExport(savedCampaign)} type="button"><ArrowDownToLine aria-hidden="true" size={14} /> Exportar</button>
                    <button onClick={chooseImportFile} type="button"><FileUp aria-hidden="true" size={14} /> Importar</button>
                    <button className="save-delete-button" onClick={() => onDelete(campaign.id)} type="button"><Trash2 aria-hidden="true" size={14} /> Excluir</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <footer className="library-footer"><span>PALÁCIO EM JOGO</span><span>OS ARQUIVOS FICAM NESTE NAVEGADOR</span></footer>
    </main>
  )
}