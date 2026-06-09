import { AnalysisResult } from "../types";
import { AuditHistoryEntry } from "../hooks/useAuditHistory";

export const MOCK_AUDIT_RESULT: AnalysisResult = {
  address: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  network: "eth-sepolia",
  riskLevel: "Low",
  summary:
    "Este é o contrato oficial do USD Coin (USDC) na Sepolia Testnet, emitido pela Circle. Implementa o padrão ERC-20 com controles administrativos adicionais: cunhagem, queima, pausa global e blacklist de endereços. O contrato usa um padrão de proxy atualizável e segue práticas de segurança consolidadas pelo mercado.",
  keyFunctions: [
    "transfer(address, uint256) — transfere tokens entre contas",
    "approve(address, uint256) — autoriza um spender a gastar tokens",
    "mint(address, uint256) — restrito ao minter, cria novos tokens",
    "burn(uint256) — destrói tokens do saldo do chamador",
    "pause() / unpause() — suspende todas as transferências (apenas pauser)",
    "blacklist(address) — bloqueia um endereço de transacionar (apenas blacklister)",
  ],
  redFlags: [
    "Cunhagem centralizada — um único endereço minter pode criar supply ilimitado",
    "Mecanismo de blacklist — endereços podem ser bloqueados sem aviso prévio",
    "Proxy atualizável — a lógica do contrato pode ser substituída pelo owner",
  ],
  suggestions: [
    "Verifique os endereços atuais de minter e owner para avaliar suposições de confiança",
    "Monitore atividade incomum de cunhagem on-chain",
    "Considere usar multisig para papéis administrativos antes de implantar em mainnet",
  ],
  contractHash:
    "0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1",
  auditDate: "2024-03-10T14:32:00.000Z",
  isFromRegistry: false,
};

export const MOCK_AUDIT_ENTRY: AuditHistoryEntry = {
  address: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  name: "Exemplo",
  network: "eth-sepolia",
  date: "2024-03-10T14:32:00.000Z",
  riskLevel: "Low",
  summary: MOCK_AUDIT_RESULT.summary,
  isFromRegistry: false,
  fullResult: MOCK_AUDIT_RESULT,
};
