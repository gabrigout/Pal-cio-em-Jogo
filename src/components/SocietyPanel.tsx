import { useState } from 'react'
import { Handshake, MessageCircle, UsersRound, CircleAlert } from 'lucide-react'
import { getSocietyActionAvailability } from '../engine/society'
import { formatBRLMoney } from '../utils/money'
import type { CampaignState, PressureGroupId } from '../state/types'

export default function SocietyPanel({ campaign, onDialogue, onAgreement }: {
  campaign: CampaignState
  onDialogue: (id: PressureGroupId) => void
  onAgreement: (id: PressureGroupId) => void
}) {
  const [filter, setFilter] = useState('all')
  const categories = Array.from(new Set(campaign.society.groups.map((group) => group.category)))
  const groups = campaign.society.groups.filter((group) => filter === 'all' || group.category === filter).slice().sort((a, b) => b.pressure - a.pressure)
  const highPressure = campaign.society.groups.filter((group) => group.pressure >= 65).length
  return (
    <main className="society-panel page-enter">
      <header className="society-heading">
        <div><p className="eyebrow">OPINIÃO PÚBLICA · ORGANIZAÇÃO SOCIAL</p><h1>Sociedade</h1><p>Classes econômicas, interesses organizados e pressão pública reagem à economia, às entregas e à forma como o governo negocia.</p></div>
        <div className="society-overview-balance"><UsersRound size={18}/><span>Grupos sob pressão<strong>{highPressure}</strong></span></div>
      </header>
      <section className="society-class-section">
        <div className="society-section-heading"><div><p className="eyebrow">CLASSES ECONÔMICAS</p><h2>O país não reage como um bloco único</h2></div></div>
        <div className="society-class-grid">
          {campaign.society.classes.map((item) => (
            <article className="society-class-card" key={item.id}>
              <div className="society-card-title"><h3>{item.name}</h3><strong>{Math.round(item.approval)}%</strong></div>
              <div className="society-meter" role="progressbar" aria-label={'Aprovação: '+item.name} aria-valuenow={Math.round(item.approval)} aria-valuemin={0} aria-valuemax={100}><span style={{width:item.approval+'%'}}/></div>
              <div className="society-class-security"><span>Segurança econômica</span><strong>{Math.round(item.economicSecurity)}/100</strong></div>
              <p>{item.latestReason}</p>
              <div className="society-interest-list">{item.priorities.slice(0,3).map((priority)=><span key={priority}>{priority}</span>)}</div>
            </article>
          ))}
        </div>
      </section>
      <section className="society-groups-section">
        <div className="society-section-heading"><div><p className="eyebrow">GRUPOS ORGANIZADOS</p><h2>Negociação, apoio e cobrança</h2></div><label className="society-filter">Área<select value={filter} onChange={(event)=>setFilter(event.target.value)}><option value="all">Todas</option>{categories.map((category)=><option key={category} value={category}>{category}</option>)}</select></label></div>
        <div className="society-group-grid">
          {groups.map((group)=>{
            const dialogue=getSocietyActionAvailability(campaign,group.id,'dialogue')
            const agreement=getSocietyActionAvailability(campaign,group.id,'agreement')
            return <article className="society-group-card" key={group.id}>
              <div className="society-group-heading"><span className="society-group-icon"><UsersRound size={17}/></span><span className="society-category">{group.category}</span></div>
              <h3>{group.name}</h3>
              <div className="society-group-metrics"><span>Aprovação<strong>{Math.round(group.approval)}/100</strong></span><span>Pressão<strong>{Math.round(group.pressure)}/100</strong></span><span>Influência<strong>{Math.round(group.influence)}/100</strong></span></div>
              <div className="society-meter" role="progressbar" aria-label={'Pressão: '+group.name} aria-valuenow={Math.round(group.pressure)} aria-valuemin={0} aria-valuemax={100}><span className={group.pressure>=65?'society-meter-warning':''} style={{width:group.pressure+'%'}}/></div>
              <p className="society-demand">{group.demand}</p>
              <div className="society-interest-list">{group.interests.map((interest)=><span key={interest}>{interest}</span>)}</div>
              <p className="society-latest-reason">{group.latestReason}</p>
              {group.pressure>=70&&<p className="society-pressure-alert"><CircleAlert size={14}/> Risco elevado de manifestação ou paralisação no fechamento mensal.</p>}
              <div className="society-actions">
                <button className="society-button society-button-secondary" type="button" disabled={!dialogue.allowed} title={dialogue.reason??'Custa 1 PA, 2 de capital político e 1 de capacidade administrativa'} onClick={()=>onDialogue(group.id)}><MessageCircle size={13}/> Dialogar · 1 PA</button>
                <button className="society-button" type="button" disabled={!agreement.allowed} title={agreement.reason??'Compromisso setorial de '+formatBRLMoney(15)} onClick={()=>onAgreement(group.id)}><Handshake size={13}/> Negociar compromisso</button>
              </div>
              {!dialogue.allowed&&<p className="society-action-hint">{dialogue.reason}</p>}
              {!agreement.allowed&&<p className="society-action-hint">{agreement.reason}</p>}
            </article>
          })}
        </div>
      </section>
      <section className="society-history-section">
        <div className="society-section-heading"><div><p className="eyebrow">HISTÓRICO SOCIAL</p><h2>O que mudou na relação com a sociedade</h2></div></div>
        {campaign.society.history.length===0?<p className="society-empty">Ainda não há acontecimentos sociais registrados. As classes e os grupos serão reavaliados no fechamento mensal.</p>:<ol className="society-history-list">{campaign.society.history.slice().reverse().slice(0,16).map((entry)=><li key={entry.id}><span className="society-history-date">{entry.dateLabel}</span><div><strong>{entry.title}</strong><p>{entry.summary}</p></div><span className={'society-history-kind tone-'+entry.tone}>{entry.kind==='protest'?'Manifestação':entry.kind==='strike'?'Paralisação':entry.kind==='endorsement'?'Apoio':entry.kind==='agreement'?'Acordo':entry.kind==='dialogue'?'Diálogo':'Revisão'}</span></li>)}</ol>}
      </section>
    </main>
  )
}
