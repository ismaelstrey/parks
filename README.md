# Parks ONU Provisioner 🔧

Sistema futurista para geração de scripts de provisionamento de ONU em OLTs Parks (GPON).

## Funcionalidades

- **Geração de Scripts** para 3 modos: Bridge (PBMP), PPPoE Bridge, IP Host
- **Histórico de sessão** com reload de scripts anteriores
- **Perfis de referência** com os planos mais comuns
- **Referência de comandos** Parks OLT
- Visual futurista dark com animações
- Copiar script com 1 clique

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse em: http://localhost:3000

## Estrutura

```
parks-onu-provisioner/
├── app/
│   ├── globals.css       # Estilos globais + tema futurista
│   ├── layout.tsx        # Layout raiz Next.js
│   └── page.tsx          # Página principal (toda a UI)
├── lib/
│   └── scriptGen.ts      # Lógica de geração e validação de scripts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Tipos de provisionamento suportados

### Bridge (PBMP)
Gera perfil VLAN, perfil de flow com dois flows (dados + gerência MNGT), e os comandos de ONU completos.

### PPPoE Bridge
Similar ao Bridge, porém para clientes PPPoE.

### IP Host
Para ONUs com IP fixo de gerência.

## Exemplo de script gerado (Bridge)

```
! ============================================================
! SCRIPT GERADO - Parks ONU Provisioner
! Serial: prks00b63c18  |  Alias: BRIDGE_CONSULTORIA
! Interface: gpon1/2  |  Tipo: BRIDGE
! ============================================================

 gpon profile vlan-translation 147
 add translation access 147

 gpon profile flow BRIDGE_CONSULTORIA
 add flow # BRIDGE_CONSULTORIA-1
 add flow # BRIDGE_CONSULTORIA-2
 BRIDGE_CONSULTORIA-1 encryption disable
 BRIDGE_CONSULTORIA-1 flow-type pbmp 1
 BRIDGE_CONSULTORIA-1 vlan 147 service 400MB
 BRIDGE_CONSULTORIA-2 encryption disable
 BRIDGE_CONSULTORIA-2 flow-type iphost 1
 BRIDGE_CONSULTORIA-2 vlan 3 service MNGT

 onu add serial-number prks00b63c18
 onu prks00b63c18 ethernet-profile auto-on uni-port 1-2
 onu prks00b63c18 vlan-translation-profile 147 uni-port 1
 onu prks00b63c18 upstream-fec disabled
 onu prks00b63c18 flow-profile BRIDGE_CONSULTORIA
 onu prks00b63c18 alias BRIDGE_CONSULTORIA
```
