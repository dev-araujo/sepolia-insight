<img src="https://img.shields.io/static/v1?label=license&message=MIT&color=5965E0&labelColor=121214" alt="License" /> <img src="https://img.shields.io/badge/Hardhat-F7DC6F?style=for-the-badge&logo=ethereum&logoColor=black" alt="Hardhat" /> <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /> <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum" />

# AuditRegistry

O **AuditRegistry** é o contrato inteligente que sustenta o Sepolia-Insight. Ele armazena relatórios completos de auditoria de contratos como strings JSON diretamente na Sepolia Testnet — sem dependência de armazenamento externo.

---

## Stack 🚀

**Smart Contract**

- **Solidity 0.8.28**
- **Hardhat**
- **TypeChain**

**Rede**

- **Sepolia Testnet** (chainId 11155111)
- **Etherscan** — verificação do contrato

---

## Rodando Localmente ⚡️

### Pré-requisitos

- Node.js 20+
- Carteira com Sepolia ETH ([faucet](https://faucets.chain.link/sepolia))
- Chave de API da Etherscan

### Setup ⚒️

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

   Preencha o `.env`:

   | Variável | Descrição |
   |---|---|
   | `PRIVATE_KEY` | Chave privada da carteira implantadora (sem o prefixo `0x`) |
   | `SEPOLIA_RPC` | Endpoint RPC da Sepolia |
   | `ETHERSCAN_API_KEY` | Chave da API Etherscan para verificação |

3. Compile o contrato:

   ```bash
   npx hardhat compile
   ```

4. Implante na Sepolia:

   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

⭐ Após o deploy, copie o endereço do contrato para `../sepolia-insight/.env.local`:

```env
NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS=0x...
```

---

## Verificação no Etherscan

```bash
npx hardhat verify --network sepolia <ENDEREÇO_DO_CONTRATO>
```

---

## Funções do Contrato

| Função | Descrição |
|---|---|
| `storeAudit(hash, json)` | Armazena um relatório completo de auditoria on-chain |
| `getAuditHashesByOwner(owner)` | Retorna todos os hashes de auditoria de um owner |
| `getAuditData(hash)` | Recupera o JSON completo de uma auditoria |
| `getAuditTimestamp(hash)` | Retorna o timestamp de quando uma auditoria foi armazenada |
| `getAuditCountByOwner(owner)` | Conta o total de auditorias de um owner |
| `getAuditHashesByOwnerPaginated(owner, offset, limit)` | Hashes paginados por owner |

---

#### Autor 👷

<img src="https://avatars.githubusercontent.com/u/97068163?v=4" width=120 />

[Adriano P Araujo](https://www.linkedin.com/in/araujocode/)
