import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, Check, Landmark, Palette, Sparkles } from 'lucide-react'
import {
  createCustomPartySelection,
  getCompatibleParties,
  isCustomPartyValid,
  selectPartyColor,
  selectionFromDefinition,
} from '../engine/campaign'
import { createCampaignTheme, getButtonTextColor } from '../engine/theme'
import { partyPalette, politicalOrientationLabels, satiricalIntroductions } from '../data/campaignConfig'
import type { PartySelection, PoliticalOrientation } from '../state/types'

interface CampaignSetupProps {
  onStart: (orientation: PoliticalOrientation, party: PartySelection) => void
  onBackToLibrary: () => void
}

const steps = ['Orientação', 'Partido', 'Posse']

export default function CampaignSetup({ onStart, onBackToLibrary }: CampaignSetupProps) {
  const [step, setStep] = useState(1)
  const [orientation, setOrientation] = useState<PoliticalOrientation | null>(null)
  const [selectedParty, setSelectedParty] = useState<PartySelection | null>(null)
  const [selectedPartyId, setSelectedPartyId] = useState('')
  const [customSelected, setCustomSelected] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customAcronym, setCustomAcronym] = useState('')
  const [customColors, setCustomColors] = useState<string[]>([])

  const compatibleParties = orientation ? getCompatibleParties(orientation) : []
  const customPartyValid = isCustomPartyValid(customName, customAcronym, customColors)
  const selectedDefinition = compatibleParties.find((party) => party.id === selectedPartyId)
  const previewColors = customSelected
    ? customColors.length === 2 ? customColors : null
    : selectedDefinition?.colors ?? null
  const previewTheme = previewColors ? createCampaignTheme(previewColors[0], previewColors[1]) : null
  const setupThemeStyle = previewTheme ? {
    '--cor-primaria': previewTheme.primary,
    '--cor-secundaria': previewTheme.secondary,
    '--cor-botao-texto': previewTheme.buttonText,
  } as CSSProperties : undefined

  function chooseOrientation(value: PoliticalOrientation) {
    setOrientation(value)
    setSelectedParty(null)
    setSelectedPartyId('')
    setCustomSelected(false)
    setStep(2)
  }

  function continueFromParty() {
    if (customSelected && customPartyValid) {
      setSelectedParty(createCustomPartySelection(customName, customAcronym, customColors))
      setStep(3)
      return
    }

    const definition = compatibleParties.find((party) => party.id === selectedPartyId)
    if (definition) {
      setSelectedParty(selectionFromDefinition(definition))
      setStep(3)
    }
  }

  function toggleCustomColor(color: string) {
    setCustomColors((current) => selectPartyColor(current, color))
  }

  const currentIntroduction = orientation ? satiricalIntroductions[orientation] : null

  return (
    <main className="setup-page page-enter" style={setupThemeStyle}>
      <header className="setup-header">
        <a aria-label="Palácio em Jogo" className="setup-brand" href="#inicio">
          <span className="setup-brand-mark"><Landmark aria-hidden="true" size={22} /></span>
          <span><strong>PALÁCIO <b>EM JOGO</b></strong><small>Palácio do Planalto · Brasília</small></span>
        </a>
        <button className="setup-library-link" onClick={onBackToLibrary} type="button"><ArrowLeft aria-hidden="true" size={14} /> Campanhas salvas</button>
        <span className="setup-date">JANEIRO 2027 <i>·</i> INÍCIO DE MANDATO</span>
      </header>

      <div aria-label="Etapas da nova campanha" className="setup-progress">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          return (
            <div aria-current={step === stepNumber ? 'step' : undefined} className={`setup-step${step === stepNumber ? ' is-current' : ''}${step > stepNumber ? ' is-complete' : ''}`} key={label}>
              <span className="setup-step-number">{step > stepNumber ? <Check aria-hidden="true" size={13} /> : `0${stepNumber}`}</span>
              <span>{label}</span>
            </div>
          )
        })}
      </div>

      <section aria-live="polite" className="setup-content">
        {step === 1 && (
          <>
            <div className="setup-intro">
              <p className="eyebrow">NOVA CAMPANHA <span>·</span> 01 / 03</p>
              <h1>Por onde começa<br />o seu governo?</h1>
              <p>Defina a orientação política inicial. Ela ajuda a compor o contexto da campanha.</p>
            </div>
            <div className="orientation-options">
              <button className="orientation-card orientation-left" onClick={() => chooseOrientation('left')} type="button">
                <span className="orientation-number">01 <span>·</span> PROJETO DE PAÍS</span>
                <span className="orientation-title">Esquerda</span>
                <span className="orientation-description">Políticas sociais, direitos e mobilização popular entram no centro da agenda.</span>
                <span className="orientation-continue">Escolher orientação <ArrowRight aria-hidden="true" size={16} /></span>
              </button>
              <button className="orientation-card orientation-right" onClick={() => chooseOrientation('right')} type="button">
                <span className="orientation-number">02 <span>·</span> PROJETO DE PAÍS</span>
                <span className="orientation-title">Direita</span>
                <span className="orientation-description">Gestão, conservadorismo e eficiência econômica disputam espaço na agenda.</span>
                <span className="orientation-continue">Escolher orientação <ArrowRight aria-hidden="true" size={16} /></span>
              </button>
            </div>
          </>
        )}

        {step === 2 && orientation && (
          <>
            <div className="setup-intro">
              <p className="eyebrow">NOVA CAMPANHA <span>·</span> 02 / 03</p>
              <h1>Escolha sua legenda.</h1>
              <p>Orientação inicial: <strong className="orientation-inline">{politicalOrientationLabels[orientation]}</strong>. O PSSDB de centro aparece nas duas opções.</p>
            </div>
            <div className="party-grid">
              {compatibleParties.map((party) => (
                <button
                  aria-pressed={!customSelected && selectedPartyId === party.id}
                  className={`party-option${!customSelected && selectedPartyId === party.id ? ' is-selected' : ''}`}
                  key={party.id}
                  onClick={() => {
                    setSelectedPartyId(party.id)
                    setCustomSelected(false)
                  }}
                  type="button"
                >
                  <span className="party-option-top">
                    <span className="party-option-acronym">{party.acronym}</span>
                    <span aria-label={`Cores ${party.colors.join(' e ')}`} className="party-swatches">
                      {party.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
                    </span>
                  </span>
                  <strong>{party.fullName}</strong>
                  <span className="party-option-description">{party.description}</span>
                  <span className="party-option-select">{!customSelected && selectedPartyId === party.id ? 'Selecionado' : 'Selecionar'} <Check aria-hidden="true" size={14} /></span>
                </button>
              ))}
              <button
                aria-pressed={customSelected}
                className={`party-option custom-party-option${customSelected ? ' is-selected' : ''}`}
                onClick={() => {
                  setCustomSelected(true)
                  setSelectedPartyId('')
                }}
                type="button"
              >
                <span className="party-option-top">
                  <span className="party-option-acronym"><Palette aria-hidden="true" size={16} /> NOVA SIGLA</span>
                  <Sparkles aria-hidden="true" className="custom-sparkle" size={16} />
                </span>
                <strong>Criar partido personalizado</strong>
                <span className="party-option-description">Escolha nome, sigla e duas cores oficiais. Popularidade inicial: 3%.</span>
                <span className="party-option-select">{customSelected ? 'Selecionado' : 'Personalizar'} <ArrowRight aria-hidden="true" size={14} /></span>
              </button>
            </div>

            {customSelected && (
              <div className="custom-party-form">
                <div className="custom-form-heading">
                  <div><p className="eyebrow">IDENTIDADE DO PARTIDO</p><h2>Monte sua legenda.</h2></div>
                  <span className="custom-popularity">POPULARIDADE INICIAL <b>3%</b></span>
                </div>
                <div className="custom-fields">
                  <label>Nome completo
                    <input maxLength={60} onChange={(event) => setCustomName(event.target.value)} placeholder="Ex.: Partido do Café Forte" value={customName} />
                  </label>
                  <label>Sigla
                    <input maxLength={8} onChange={(event) => setCustomAcronym(event.target.value)} placeholder="Ex.: PCF" value={customAcronym} />
                  </label>
                  <label>Orientação
                    <input readOnly value={politicalOrientationLabels[orientation]} />
                  </label>
                </div>
                <div className="palette-heading">
                  <div><strong>Duas cores oficiais</strong><small>Primeira cor: texto de destaque e botões. Segunda: ícones, bordas e grafismos.</small></div>
                  <span>{customColors.length}/2 selecionadas</span>
                </div>
                <div aria-label="Paleta de cores do partido" className="color-palette">
                  {partyPalette.map(({ color, name }) => (
                    <button
                      aria-label={`${name}${customColors.includes(color) ? ', selecionada' : ''}`}
                      aria-pressed={customColors.includes(color)}
                      className={`palette-swatch${customColors.includes(color) ? ' is-selected' : ''}`}
                      key={color}
                      onClick={() => toggleCustomColor(color)}
                      title={name}
                      type="button"
                    >
                      <span style={{ backgroundColor: color, color: getButtonTextColor(color) }}>{customColors.includes(color) && <Check aria-hidden="true" size={16} />}</span>
                      <small>{name}</small>
                    </button>
                  ))}
                </div>
                <p className="custom-party-note">Influência, apoio parlamentar, recursos e cadeiras serão sorteados em faixas equilibradas.</p>
              </div>
            )}
          </>
        )}

        {step === 3 && orientation && selectedParty && currentIntroduction && (
          <>
            <div className="setup-intro">
              <p className="eyebrow">NOVA CAMPANHA <span>·</span> 03 / 03</p>
              <h1>O mandato começa<br />com uma história.</h1>
              <p>Brasília já está trabalhando. Quer dizer, está organizando uma reunião para começar.</p>
            </div>
            <article className="satire-opening">
              <div className="satire-topline"><span><Sparkles aria-hidden="true" size={15} /> ABERTURA DE GOVERNO</span><span>FICÇÃO SATÍRICA</span></div>
              <h2>{currentIntroduction.title}</h2>
              <p>{currentIntroduction.text}</p>
              <div className="opening-party">
                <span className="party-swatches">
                  {selectedParty.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
                </span>
                <strong>{selectedParty.acronym}</strong>
                <span>{selectedParty.fullName}</span>
                <span className="opening-orientation">{politicalOrientationLabels[orientation]}</span>
              </div>
            </article>
            <p className="campaign-balance-note">Indicadores iniciais do país e do partido são sorteados em faixas equilibradas. Sua campanha começa em janeiro de 2027.</p>
          </>
        )}

        <footer className="setup-actions">
          {step > 1 ? (
            <button className="setup-back" onClick={() => setStep(step - 1)} type="button"><ArrowLeft aria-hidden="true" size={16} /> Voltar</button>
          ) : <span />}
          {step === 2 && (
            <button className="setup-primary-button" disabled={customSelected ? !customPartyValid : !selectedPartyId} onClick={continueFromParty} type="button">
              Continuar <ArrowRight aria-hidden="true" size={16} />
            </button>
          )}
          {step === 3 && selectedParty && orientation && (
            <button className="setup-primary-button" onClick={() => onStart(orientation, selectedParty)} type="button">
              Assumir a Presidência <ArrowRight aria-hidden="true" size={16} />
            </button>
          )}
        </footer>
      </section>
      <footer className="setup-footer"><span>PALÁCIO EM JOGO</span><span>UMA REPÚBLICA DE POSSIBILIDADES E REUNIÕES</span></footer>
    </main>
  )
}