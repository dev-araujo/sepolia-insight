<img src="https://img.shields.io/static/v1?label=license&message=MIT&color=5965E0&labelColor=121214" alt="License" /> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /> <img src="https://img.shields.io/badge/Hardhat-F7DC6F?style=for-the-badge&logo=ethereum&logoColor=black" alt="Hardhat" /> <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /> <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum" />

# Sepolia-Insight — Monorepo

Plataforma de auditoria de contratos inteligentes com IA. Analise qualquer contrato verificado na Etherscan, receba um relatório de segurança gerado por Llama 3 via Groq e salve o resultado permanentemente na **Sepolia Testnet**.

---

## Estrutura do Repositório 🗂️

```
blockchain/
├── audit-registry/    # Contrato Solidity + scripts Hardhat de deploy
└── sepolia-insight/   # Aplicação Next.js (frontend + API)
```

### [`audit-registry/`](./audit-registry)

Projeto Hardhat responsável por compilar, implantar e verificar o contrato `AuditRegistry` na Sepolia. O contrato armazena relatórios de auditoria completos como JSON diretamente on-chain, sem dependência de armazenamento externo.

### [`sepolia-insight/`](./sepolia-insight)

Aplicação Next.js 15 que consome o contrato `AuditRegistry`. Permite buscar o código-fonte de qualquer contrato verificado na Etherscan, analisá-lo com IA (Groq Llama 3) e salvar o relatório permanentemente na blockchain via MetaMask.

---

## Stack 🚀

**Frontend**

- **Next.js 15**
- **TypeScript**
- **Tailwind CSS + Shadcn UI**
- **Ethers.js**

**Blockchain**

- **Solidity 0.8.28**
- **Hardhat**
- **Sepolia Testnet**

**IA**

- **Groq API** — Llama 3.3 70B

**APIs Externas**

- **Etherscan API**

---

## Rodando Localmente ⚡️

### 1. Deploy do contrato ⚒️

```bash
cd audit-registry
npm install
cp .env.example .env
# preencha .env com PRIVATE_KEY, SEPOLIA_RPC e ETHERSCAN_API_KEY
npx hardhat run scripts/deploy.ts --network sepolia
```

Copie o endereço retornado para o próximo passo.

### 2. Aplicação web ⚒️

```bash
cd sepolia-insight
npm install
cp .env.example .env.local
# preencha .env.local com as variáveis listadas abaixo
npm run dev
```

| Variável | Descrição |
|---|---|
| `PRIVATE_KEY` | Chave privada server-side para salvar auditorias |
| `NEXT_PUBLIC_SEPOLIA_RPC` | Endpoint RPC da Sepolia |
| `NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS` | Endereço do contrato implantado no passo 1 |
| `ETHERSCAN_API_KEY` | Chave da API Etherscan |
| `GROQ_API_KEY` | Chave da API Groq — obtenha em https://console.groq.com/keys |

⭐ A aplicação estará disponível em `http://localhost:3000`.

---

#### Autor 👷

<img src="https://avatars.githubusercontent.com/u/97068163?v=4" width=120 />

[Adriano P Araujo](https://www.linkedin.com/in/araujocode/)
