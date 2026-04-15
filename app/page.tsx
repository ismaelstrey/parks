'use client'

import { useState, useCallback } from 'react'
import {
  ScriptFormData,
  HistoryEntry,
  ProvisioningType,
  FecMode,
  EthernetProfile,
  generateONUScript,
  validateForm,
} from '@/lib/scriptGen'
import { clsx } from 'clsx'

// ─── Sub-components ────────────────────────────────────────────────────────

function HexLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" stroke="#00e5ff" strokeWidth="1.5" fill="rgba(0,229,255,0.05)" />
      <polygon points="22,8 35,15.5 35,28.5 22,36 9,28.5 9,15.5" stroke="#00ff88" strokeWidth="0.8" fill="none" opacity="0.5" />
      <text x="22" y="27" textAnchor="middle" fill="#00e5ff" fontFamily="'Share Tech Mono',monospace" fontSize="13" fontWeight="700">OLT</text>
    </svg>
  )
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,229,255,0.18)] font-mono text-[11px] text-[#00b8cc] tracking-widest uppercase">
      <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] text-[#5a88a8] tracking-widest uppercase mb-1.5">
      {children}
    </label>
  )
}

function TextInput({ id, value, onChange, placeholder, className = '' }: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        'w-full bg-[#071f30] border border-[rgba(0,229,255,0.18)] rounded-sm px-3 py-2',
        'text-[#00e5ff] font-mono text-[13px] outline-none transition-all',
        'focus:border-[#00e5ff] focus:shadow-[0_0_0_1px_rgba(0,229,255,0.15)]',
        'placeholder:text-[#5a88a8]',
        className
      )}
    />
  )
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={clsx(
        'w-full bg-[#071f30] border border-[rgba(0,229,255,0.18)] rounded-sm px-3 py-2',
        'text-[#00e5ff] font-mono text-[13px] outline-none transition-all appearance-none',
        'focus:border-[#00e5ff]',
        'cursor-pointer'
      )}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-[#04192e]">{o.label}</option>
      ))}
    </select>
  )
}

function ToggleGroup({ options, value, onChange }: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex border border-[rgba(0,229,255,0.18)] rounded-sm overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 py-2 px-2 font-mono text-[11px] tracking-wide transition-all border-0 cursor-pointer',
            i > 0 && 'border-l border-[rgba(0,229,255,0.18)]',
            value === opt.value
              ? 'bg-[rgba(0,229,255,0.12)] text-[#00e5ff]'
              : 'bg-transparent text-[#5a88a8] hover:text-[#00e5ff]'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── History Entry Card ────────────────────────────────────────────────────

function HistoryCard({ entry, onLoad }: { entry: HistoryEntry; onLoad: () => void }) {
  const tagColor: Record<ProvisioningType, string> = {
    bridge: 'bg-[rgba(0,229,255,0.1)] text-[#00e5ff]',
    pppoe: 'bg-[rgba(255,107,0,0.15)] text-[#ff6b00]',
    iphost: 'bg-[rgba(0,255,136,0.1)] text-[#00ff88]',
  }

  return (
    <div
      onClick={onLoad}
      className="bg-[#061e35] border border-[rgba(0,229,255,0.18)] rounded-sm p-3 cursor-pointer hover:border-[rgba(0,229,255,0.5)] transition-all"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[13px] text-[#00e5ff] font-bold tracking-wide">{entry.serial}</span>
        <span className="font-mono text-[10px] text-[#5a88a8]">{entry.time} — gpon{entry.slot}/{entry.porta}</span>
      </div>
      <div className="text-[12px] text-[#5a88a8] mb-1.5">{entry.alias}</div>
      <span className={clsx('inline-block px-2 py-0.5 rounded-sm font-mono text-[10px]', tagColor[entry.tipo])}>
        {entry.tipo.toUpperCase()}
      </span>
    </div>
  )
}

// ─── Script Output ─────────────────────────────────────────────────────────

function ScriptOutput({ script }: { script: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [script])

  return (
    <div className="bg-[#010c18] border border-[rgba(0,229,255,0.18)] rounded-sm overflow-hidden mt-3 animate-[fadeIn_0.3s_ease]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(0,229,255,0.18)] bg-[#04192e]">
        <span className="font-mono text-[10px] text-[#5a88a8] tracking-widest uppercase">
          // SCRIPT GERADO — PRONTO PARA COLAR NA OLT
        </span>
        <button
          onClick={handleCopy}
          className={clsx(
            'px-3 py-1 border rounded-sm font-mono text-[11px] cursor-pointer transition-all',
            copied
              ? 'border-[#00ff88] text-[#00ff88] bg-[rgba(0,255,136,0.1)]'
              : 'border-[#00cc6a] text-[#00ff88] bg-transparent hover:bg-[rgba(0,255,136,0.1)]'
          )}
        >
          {copied ? '[ COPIADO! ]' : '[ COPIAR ]'}
        </button>
      </div>
      <pre className="p-4 font-mono text-[12.5px] leading-[1.7] text-[#7ee8b8] overflow-x-auto whitespace-pre">
        {script.split('\n').map((line, i) => {
          if (line.startsWith('!')) return <span key={i} className="text-[#4a6a88]">{line}{'\n'}</span>
          if (line.trim().startsWith('gpon profile') || line.trim().startsWith('onu add') || line.trim().startsWith('show'))
            return <span key={i} className="text-[#00e5ff]">{line}{'\n'}</span>
          return <span key={i}>{line}{'\n'}</span>
        })}
      </pre>
    </div>
  )
}

// ─── PROFILES TAB ─────────────────────────────────────────────────────────

const PROFILES = [
  { name: 'BRIDGE_100MB', speed: '100MB', type: 'PBMP', vlan: 'dinâmica', mngt: '3', fec: 'disabled', color: 'text-[#00ff88]' },
  { name: 'BRIDGE_300MB', speed: '300MB', type: 'PBMP', vlan: 'dinâmica', mngt: '3', fec: 'disabled', color: 'text-[#00ff88]' },
  { name: 'BRIDGE_CONSULTORIA', speed: '400MB', type: 'PBMP', vlan: 'dinâmica', mngt: '3', fec: 'disabled', color: 'text-[#00ff88]' },
  { name: 'BRIDGE_600MB', speed: '600MB', type: 'PBMP', vlan: 'dinâmica', mngt: '3', fec: 'disabled', color: 'text-[#00ff88]' },
  { name: 'BRIDGE_1G', speed: '1G', type: 'PBMP', vlan: 'dinâmica', mngt: '3', fec: 'enabled', color: 'text-[#00ff88]' },
  { name: 'PPPOE_RESIDENCIAL', speed: 'PPPoE', type: 'PBMP', vlan: 'dinâmica', mngt: '3', fec: 'disabled', color: 'text-[#ff6b00]' },
]

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────

export default function Home() {
  const [tab, setTab] = useState<'gen' | 'hist' | 'prof'>('gen')
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [success, setSuccess] = useState(false)

  // Form state
  const [serial, setSerial] = useState('')
  const [alias, setAlias] = useState('')
  const [slot, setSlot] = useState('1')
  const [porta, setPorta] = useState('2')
  const [uni, setUni] = useState('1-2')
  const [fec, setFec] = useState<FecMode>('disabled')
  const [ethProfile, setEthProfile] = useState<EthernetProfile>('auto-on')
  const [tipo, setTipo] = useState<ProvisioningType>('bridge')
  const [includeShow, setIncludeShow] = useState(false)
  const [includeProfileDef, setIncludeProfileDef] = useState(true)
  const [extraVlans, setExtraVlans] = useState('')

  // Bridge fields
  const [bVlanData, setBVlanData] = useState('')
  const [bService, setBService] = useState('')
  const [bVlanMngt, setBVlanMngt] = useState('3')
  const [bFlowProfile, setBFlowProfile] = useState('')
  const [bVtUni, setBVtUni] = useState('1')

  // PPPoE fields
  const [pVlanData, setPVlanData] = useState('')
  const [pService, setPService] = useState('')
  const [pVlanMngt, setPVlanMngt] = useState('3')
  const [pFlowProfile, setPFlowProfile] = useState('')

  // IPHost fields
  const [ipAddress, setIpAddress] = useState('')
  const [gateway, setGateway] = useState('')
  const [ipVlanMngt, setIpVlanMngt] = useState('3')

  const handleGenerate = () => {
    const data: ScriptFormData = {
      serial: serial.trim().toLowerCase(),
      alias: alias.trim().toUpperCase().replace(/\s+/g, '_'),
      slot: slot || '1',
      porta: porta || '2',
      uni: uni || '1-2',
      fec,
      ethProfile,
      tipo,
      extraVlans,
      includeShow,
      includeProfileDef,
      ...(tipo === 'bridge' && {
        bridge: { vlanData: bVlanData, serviceData: bService, vlanMngt: bVlanMngt, flowProfile: bFlowProfile, vtUniPort: bVtUni }
      }),
      ...(tipo === 'pppoe' && {
        pppoe: { vlanData: pVlanData, serviceData: pService, vlanMngt: pVlanMngt, flowProfile: pFlowProfile }
      }),
      ...(tipo === 'iphost' && {
        iphost: { ipAddress, gateway, vlanMngt: ipVlanMngt }
      }),
    }

    const errs = validateForm(data)
    if (errs.length) {
      setErrors(errs)
      setGeneratedScript(null)
      setSuccess(false)
      return
    }

    const script = generateONUScript(data)
    setGeneratedScript(script)
    setErrors([])
    setSuccess(true)

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      serial: data.serial,
      alias: data.alias,
      tipo: data.tipo,
      slot: data.slot,
      porta: data.porta,
      time: new Date().toLocaleTimeString('pt-BR'),
      script,
    }
    setHistory(prev => [entry, ...prev].slice(0, 30))

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen">
      <div className="grid-bg" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4">

        {/* HEADER */}
        <div className="relative flex items-center gap-4 px-5 py-3.5 border border-[rgba(0,229,255,0.18)] rounded-sm bg-[#04192e] mb-4 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-60 animate-[scan_3s_linear_infinite]" />
          <HexLogo />
          <div>
            <h1 className="font-display text-[22px] font-bold text-[#00e5ff] tracking-[3px] uppercase leading-none">
              Parks ONU Provisioner
            </h1>
            <p className="font-mono text-[11px] text-[#5a88a8] tracking-wide mt-1">
              // SISTEMA DE PROVISIONAMENTO GPON — v2.4.1 — MODO TÉCNICO
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 font-mono text-[11px] text-[#00ff88]">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-[pulse-neon_2s_ease-in-out_infinite]" />
            ONLINE
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-4">
          {(['gen', 'hist', 'prof'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-5 py-2 border rounded-sm font-display text-[13px] font-semibold tracking-widest uppercase cursor-pointer transition-all',
                tab === t
                  ? 'border-[#00e5ff] text-[#00e5ff] bg-[rgba(0,229,255,0.07)] shadow-[0_0_12px_rgba(0,229,255,0.1)_inset]'
                  : 'border-[rgba(0,229,255,0.18)] text-[#5a88a8] bg-[#04192e] hover:border-[rgba(0,229,255,0.5)] hover:text-[#00e5ff]'
              )}
            >
              {t === 'gen' ? 'Gerar Script' : t === 'hist' ? 'Histórico' : 'Perfis'}
            </button>
          ))}
        </div>

        {/* TAB: GERAR */}
        {tab === 'gen' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

            {/* DADOS ONU */}
            <div className="bg-[#04192e] border border-[rgba(0,229,255,0.18)] rounded-sm overflow-hidden">
              <PanelHeader>DADOS DA ONU</PanelHeader>
              <div className="p-4 space-y-3">
                <div>
                  <FieldLabel>Serial Number (ONU)</FieldLabel>
                  <TextInput value={serial} onChange={v => setSerial(v.toLowerCase())} placeholder="ex: prks00b63c18" />
                </div>
                <div>
                  <FieldLabel>Alias / Identificação do Cliente</FieldLabel>
                  <TextInput value={alias} onChange={setAlias} placeholder="ex: BRIDGE_CONSULTORIA" />
                </div>
                <div>
                  <FieldLabel>Interface GPON</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FieldLabel>Slot</FieldLabel>
                      <TextInput value={slot} onChange={setSlot} placeholder="1" />
                    </div>
                    <div>
                      <FieldLabel>Porta</FieldLabel>
                      <TextInput value={porta} onChange={setPorta} placeholder="2" />
                    </div>
                  </div>
                </div>
                <div>
                  <FieldLabel>UNI Ports</FieldLabel>
                  <TextInput value={uni} onChange={setUni} placeholder="ex: 1-2" />
                </div>
                <div>
                  <FieldLabel>Upstream FEC</FieldLabel>
                  <ToggleGroup
                    value={fec}
                    onChange={v => setFec(v as FecMode)}
                    options={[{ label: 'DISABLED', value: 'disabled' }, { label: 'ENABLED', value: 'enabled' }]}
                  />
                </div>
                <div>
                  <FieldLabel>Ethernet Profile</FieldLabel>
                  <ToggleGroup
                    value={ethProfile}
                    onChange={v => setEthProfile(v as EthernetProfile)}
                    options={[
                      { label: 'AUTO-ON', value: 'auto-on' },
                      { label: 'AUTO-OFF', value: 'auto-off' },
                      { label: 'FORCE-ON', value: 'force-on' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* CONFIG VLAN / FLOW */}
            <div className="bg-[#04192e] border border-[rgba(0,229,255,0.18)] rounded-sm overflow-hidden">
              <PanelHeader>CONFIGURAÇÃO VLAN / FLOW</PanelHeader>
              <div className="p-4 space-y-3">
                <div>
                  <FieldLabel>Tipo de Provisionamento</FieldLabel>
                  <SelectInput
                    value={tipo}
                    onChange={v => setTipo(v as ProvisioningType)}
                    options={[
                      { value: 'bridge', label: 'Bridge (PBMP)' },
                      { value: 'pppoe', label: 'PPPoE Bridge' },
                      { value: 'iphost', label: 'IP Host' },
                    ]}
                  />
                </div>

                {tipo === 'bridge' && (
                  <>
                    <div>
                      <FieldLabel>VLAN de Dados</FieldLabel>
                      <TextInput value={bVlanData} onChange={setBVlanData} placeholder="ex: 147" />
                    </div>
                    <div>
                      <FieldLabel>Serviço / Plano</FieldLabel>
                      <TextInput value={bService} onChange={setBService} placeholder="ex: 400MB" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>VLAN Gerência</FieldLabel>
                        <TextInput value={bVlanMngt} onChange={setBVlanMngt} placeholder="3" />
                      </div>
                      <div>
                        <FieldLabel>VT UNI Port</FieldLabel>
                        <TextInput value={bVtUni} onChange={setBVtUni} placeholder="1" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Flow Profile</FieldLabel>
                      <TextInput value={bFlowProfile} onChange={setBFlowProfile} placeholder="ex: BRIDGE_CONSULTORIA" />
                    </div>
                  </>
                )}

                {tipo === 'pppoe' && (
                  <>
                    <div>
                      <FieldLabel>VLAN de Dados</FieldLabel>
                      <TextInput value={pVlanData} onChange={setPVlanData} placeholder="ex: 200" />
                    </div>
                    <div>
                      <FieldLabel>Serviço / Plano</FieldLabel>
                      <TextInput value={pService} onChange={setPService} placeholder="ex: 100MB" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel>VLAN Gerência</FieldLabel>
                        <TextInput value={pVlanMngt} onChange={setPVlanMngt} placeholder="3" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Flow Profile</FieldLabel>
                      <TextInput value={pFlowProfile} onChange={setPFlowProfile} placeholder="ex: PPPOE_RESIDENCIAL" />
                    </div>
                  </>
                )}

                {tipo === 'iphost' && (
                  <>
                    <div>
                      <FieldLabel>IP / Máscara</FieldLabel>
                      <TextInput value={ipAddress} onChange={setIpAddress} placeholder="ex: 172.16.100.50/24" />
                    </div>
                    <div>
                      <FieldLabel>Gateway</FieldLabel>
                      <TextInput value={gateway} onChange={setGateway} placeholder="ex: 172.16.100.1" />
                    </div>
                    <div>
                      <FieldLabel>VLAN Gerência</FieldLabel>
                      <TextInput value={ipVlanMngt} onChange={setIpVlanMngt} placeholder="3" />
                    </div>
                  </>
                )}

                <div>
                  <FieldLabel>VLANs Adicionais (opcional)</FieldLabel>
                  <TextInput value={extraVlans} onChange={setExtraVlans} placeholder="ex: 3050 uni-port 1, 179 uni-port 2" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeShow}
                    onChange={e => setIncludeShow(e.target.checked)}
                    className="accent-[#00e5ff]"
                  />
                  <span className="font-mono text-[12px] text-[#c8e8f8]">Incluir show interface ao final</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeProfileDef}
                    onChange={e => setIncludeProfileDef(e.target.checked)}
                    className="accent-[#00e5ff]"
                  />
                  <span className="font-mono text-[12px] text-[#c8e8f8]">Incluir definição do flow profile</span>
                </label>
              </div>
            </div>

            {/* FULL-WIDTH: GENERATE + OUTPUT */}
            <div className="lg:col-span-2">
              <button
                onClick={handleGenerate}
                className="w-full py-3.5 bg-gradient-to-r from-[rgba(0,229,255,0.15)] to-[rgba(0,255,136,0.08)] border border-[#00e5ff] rounded-sm text-[#00e5ff] font-display text-[15px] font-bold tracking-[3px] uppercase cursor-pointer transition-all hover:bg-[rgba(0,229,255,0.22)] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] active:scale-[0.98]"
              >
                ⬡ GERAR SCRIPT DE PROVISIONAMENTO
              </button>

              {errors.length > 0 && (
                <div className="mt-3 p-3 bg-[rgba(255,51,85,0.1)] border border-[rgba(255,51,85,0.4)] rounded-sm font-mono text-[12px] text-[#ff3355]">
                  // ERRO: {errors.join(' | ')}
                </div>
              )}

              {success && (
                <div className="mt-3 p-3 bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.3)] rounded-sm font-mono text-[12px] text-[#00ff88]">
                  // SCRIPT GERADO COM SUCESSO — COPIE E COLE NA OLT
                </div>
              )}

              {generatedScript && <ScriptOutput script={generatedScript} />}
            </div>
          </div>
        )}

        {/* TAB: HISTÓRICO */}
        {tab === 'hist' && (
          <div className="bg-[#04192e] border border-[rgba(0,229,255,0.18)] rounded-sm overflow-hidden">
            <PanelHeader>HISTÓRICO DE SCRIPTS GERADOS</PanelHeader>
            <div className="p-4">
              {history.length === 0 ? (
                <div className="text-center py-10 font-mono text-[12px] text-[#5a88a8] tracking-widest">
                  // NENHUM SCRIPT GERADO NESTA SESSÃO
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(entry => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      onLoad={() => {
                        setGeneratedScript(entry.script)
                        setTab('gen')
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PERFIS */}
        {tab === 'prof' && (
          <div className="space-y-3">
            <div className="bg-[#04192e] border border-[rgba(0,229,255,0.18)] rounded-sm overflow-hidden">
              <PanelHeader>PERFIS DE REFERÊNCIA PARKS</PanelHeader>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {PROFILES.map(p => (
                    <div key={p.name} className="bg-[#061e35] border border-[rgba(0,229,255,0.18)] rounded-sm p-3 hover:border-[rgba(0,229,255,0.5)] transition-all">
                      <div className={`font-display text-[22px] font-bold mb-1 ${p.color}`}>{p.speed}</div>
                      <div className="font-display text-[14px] font-bold text-[#00e5ff] tracking-wide mb-2">{p.name}</div>
                      <div className="font-mono text-[11px] text-[#5a88a8] leading-loose">
                        TYPE: {p.type}<br />
                        VLAN: {p.vlan}<br />
                        MNGT: {p.mngt}<br />
                        FEC: {p.fec}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[rgba(0,229,255,0.18)] pt-4">
                  <div className="font-mono text-[10px] text-[#5a88a8] tracking-widest uppercase mb-3">// REFERÊNCIA DE COMANDOS</div>
                  <pre className="font-mono text-[12px] text-[#7ee8b8] leading-[1.8]">
{`! Verificar ONU na porta
show running-config interface gpon1/2 | include <serial>

! Ver MACs aprendidos
show interface gpon1/1 onu mac | i <serial>

! Verificar status da ONU
show interface gpon1/2 onu operational-state | i <serial>

! Remover ONU
no onu <serial>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
