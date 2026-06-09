<img src="https://img.shields.io/static/v1?label=license&message=MIT&color=5965E0&labelColor=121214" alt="License" /> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /> <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" /> <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum" />

# Sepolia-Insight

O **Sepolia-Insight** é uma plataforma de auditoria de contratos inteligentes impulsionada por IA. Basta informar o endereço de um contrato verificado na Etherscan, e a aplicação busca o código-fonte, gera um relatório de segurança completo com Llama 3 via Groq, e permite salvar o resultado permanentemente na Sepolia Testnet através do contrato `AuditRegistry`.

---

## Stack 🚀

**Frontend**

- **Next.js 15**
- **TypeScript**
- **Tailwind CSS + Shadcn UI**
- **Ethers.js**

**Blockchain**

- **Sepolia Testnet**
- **AuditRegistry Smart Contract** (ver `../audit-registry`)

**IA**

- **Groq API** — Llama 3.3 70B

**APIs Externas**

- **Etherscan API** — busca do código-fonte dos contratos

---

## Rodando Localmente ⚡️

### Pré-requisitos

- Node.js 20+
- MetaMask com Sepolia ETH (para salvar auditorias on-chain)
- Contrato `AuditRegistry` já implantado (ver `../audit-registry`)

### Setup ⚒️

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   ```

   Preencha o `.env.local`:

   | Variável | Descrição |
   |---|---|
   | `PRIVATE_KEY` | Chave privada da carteira server-side para salvar auditorias |
   | `NEXT_PUBLIC_SEPOLIA_RPC` | Endpoint RPC da Sepolia |
   | `NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS` | Endereço do contrato `AuditRegistry` implantado |
   | `ETHERSCAN_API_KEY` | Chave da API Etherscan |
   | `GROQ_API_KEY` | Chave da API Groq — obtenha em https://console.groq.com/keys |

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

⭐ A aplicação estará disponível em `http://localhost:3000`.

---

## Arquitetura

```
src/
├── app/
│   ├── api/analyze/     # POST — busca código-fonte + análise IA
│   ├── api/save/        # POST — salva auditoria na Sepolia via carteira server-side
│   └── api/audits/      # GET  — recupera auditorias do owner na blockchain
├── core/
│   ├── blockchain.ts    # ABI do contrato, provider RPC, cliente IA
│   └── hooks/useWeb3.ts # Hook de conexão com MetaMask
└── features/
    ├── contract-analyzer/   # UI, hooks, serviços e tipos de análise
    └── storage-cache/       # Helpers de leitura e escrita on-chain
```

---

#### Autor 👷

<img src="https://avatars.githubusercontent.com/u/97068163?v=4" width=120 />

[Adriano P Araujo](https://www.linkedin.com/in/araujocode/)
