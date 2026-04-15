export type ProvisioningType = 'bridge' | 'pppoe' | 'iphost'
export type FecMode = 'disabled' | 'enabled'
export type EthernetProfile = 'auto-on' | 'auto-off' | 'force-on'

export interface BridgeConfig {
  vlanData: string
  serviceData: string
  vlanMngt: string
  flowProfile: string
  vtUniPort: string
}

export interface PPPoEConfig {
  vlanData: string
  serviceData: string
  vlanMngt: string
  flowProfile: string
}

export interface IpHostConfig {
  ipAddress: string
  gateway: string
  vlanMngt: string
}

export interface ScriptFormData {
  serial: string
  alias: string
  slot: string
  porta: string
  uni: string
  fec: FecMode
  ethProfile: EthernetProfile
  tipo: ProvisioningType
  bridge?: BridgeConfig
  pppoe?: PPPoEConfig
  iphost?: IpHostConfig
  extraVlans: string
  includeShow: boolean
  includeProfileDef: boolean
}

export interface HistoryEntry {
  id: string
  serial: string
  alias: string
  tipo: ProvisioningType
  slot: string
  porta: string
  time: string
  script: string
}

export function generateONUScript(data: ScriptFormData): string {
  const lines: string[] = []

  lines.push(`! ============================================================`)
  lines.push(`! SCRIPT GERADO - Parks ONU Provisioner`)
  lines.push(`! Serial: ${data.serial}  |  Alias: ${data.alias}`)
  lines.push(`! Interface: gpon${data.slot}/${data.porta}  |  Tipo: ${data.tipo.toUpperCase()}`)
  lines.push(`! ============================================================`)
  lines.push(``)

  if (data.tipo === 'bridge' && data.bridge) {
    const { vlanData, serviceData, vlanMngt, flowProfile, vtUniPort } = data.bridge
    const fp = flowProfile.toUpperCase().replace(/\s+/g, '_')

    if (data.includeProfileDef) {
      lines.push(` gpon profile vlan-translation ${vlanData}`)
      lines.push(` add translation access ${vlanData}`)
      lines.push(``)
      lines.push(``)
      lines.push(` gpon profile flow ${fp}`)
      lines.push(` add flow # ${fp}-1`)
      lines.push(` add flow # ${fp}-2`)
      lines.push(` ${fp}-1 encryption disable`)
      lines.push(` ${fp}-1 flow-type pbmp 1`)
      lines.push(` ${fp}-1 vlan ${vlanData} service ${serviceData}`)
      lines.push(` ${fp}-2 encryption disable`)
      lines.push(` ${fp}-2 flow-type iphost 1`)
      lines.push(` ${fp}-2 vlan ${vlanMngt} service MNGT`)
      lines.push(``)
      lines.push(``)
    }

    lines.push(` onu add serial-number ${data.serial}`)
    lines.push(` onu ${data.serial} ethernet-profile ${data.ethProfile} uni-port ${data.uni}`)
    lines.push(` onu ${data.serial} vlan-translation-profile ${vlanData} uni-port ${vtUniPort}`)

    if (data.extraVlans) {
      data.extraVlans.split(',').map(s => s.trim()).filter(Boolean).forEach(ev => {
        lines.push(` onu ${data.serial} vlan-translation-profile ${ev}`)
      })
    }

    lines.push(` onu ${data.serial} upstream-fec ${data.fec}`)
    lines.push(` onu ${data.serial} flow-profile ${fp}`)
    lines.push(` onu ${data.serial} alias ${data.alias}`)

  } else if (data.tipo === 'pppoe' && data.pppoe) {
    const { vlanData, serviceData, vlanMngt, flowProfile } = data.pppoe
    const fp = flowProfile.toUpperCase().replace(/\s+/g, '_')

    if (data.includeProfileDef) {
      lines.push(` gpon profile vlan-translation ${vlanData}`)
      lines.push(` add translation access ${vlanData}`)
      lines.push(``)
      lines.push(` gpon profile flow ${fp}`)
      lines.push(` add flow # ${fp}-1`)
      lines.push(` add flow # ${fp}-2`)
      lines.push(` ${fp}-1 encryption disable`)
      lines.push(` ${fp}-1 flow-type pbmp 1`)
      lines.push(` ${fp}-1 vlan ${vlanData} service ${serviceData || 'DEFAULT'}`)
      lines.push(` ${fp}-2 encryption disable`)
      lines.push(` ${fp}-2 flow-type iphost 1`)
      lines.push(` ${fp}-2 vlan ${vlanMngt} service MNGT`)
      lines.push(``)
    }

    lines.push(` onu add serial-number ${data.serial}`)
    lines.push(` onu ${data.serial} ethernet-profile ${data.ethProfile} uni-port ${data.uni}`)
    lines.push(` onu ${data.serial} vlan-translation-profile ${vlanData} uni-port 1`)
    lines.push(` onu ${data.serial} upstream-fec ${data.fec}`)
    lines.push(` onu ${data.serial} flow-profile ${fp}`)
    lines.push(` onu ${data.serial} alias ${data.alias}`)

  } else if (data.tipo === 'iphost' && data.iphost) {
    const { ipAddress, gateway, vlanMngt } = data.iphost

    lines.push(` onu add serial-number ${data.serial}`)
    lines.push(` onu ${data.serial} ethernet-profile ${data.ethProfile} uni-port ${data.uni}`)
    lines.push(` onu ${data.serial} vlan-translation-profile ${vlanMngt} uni-port 1`)
    lines.push(` onu ${data.serial} iphost 1 ip address ${ipAddress} gw ${gateway}`)
    lines.push(` onu ${data.serial} upstream-fec ${data.fec}`)
    lines.push(` onu ${data.serial} flow-profile bridge`)
    lines.push(` onu ${data.serial} alias ${data.alias}`)
  }

  if (data.includeShow) {
    lines.push(``)
    lines.push(`show interface gpon${data.slot}/${data.porta} onu mac | i ${data.serial}`)
  }

  return lines.join('\n')
}

export function validateForm(data: ScriptFormData): string[] {
  const errors: string[] = []

  if (!data.serial) errors.push('Serial Number é obrigatório.')
  if (data.serial && data.serial.length < 8) errors.push('Serial Number parece inválido (mínimo 8 caracteres).')
  if (!data.alias) errors.push('Alias / Identificação é obrigatório.')

  if (data.tipo === 'bridge') {
    if (!data.bridge?.vlanData) errors.push('VLAN de dados é obrigatória.')
    if (!data.bridge?.serviceData) errors.push('Serviço / Plano é obrigatório.')
    if (!data.bridge?.flowProfile) errors.push('Flow Profile é obrigatório.')
  }

  if (data.tipo === 'pppoe') {
    if (!data.pppoe?.vlanData) errors.push('VLAN de dados é obrigatória.')
    if (!data.pppoe?.flowProfile) errors.push('Flow Profile é obrigatório.')
  }

  if (data.tipo === 'iphost') {
    if (!data.iphost?.ipAddress) errors.push('Endereço IP é obrigatório.')
    if (!data.iphost?.gateway) errors.push('Gateway é obrigatório.')
  }

  return errors
}
