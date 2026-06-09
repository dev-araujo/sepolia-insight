export type Web3Address = `0x${string}`;

export type NetworkType = "eth-mainnet" | "eth-sepolia";

export type AIProviderType = "groq-llama";

export interface AIProviderConfig {
  id: AIProviderType;
  name: string;
  description: string;
}

export const SUPPORTED_PROVIDERS: AIProviderConfig[] = [
  {
    id: "groq-llama",
    name: "Groq (Llama 3)",
    description: "Ultra-fast inference",
  },
];

export interface NetworkConfig {
  id: NetworkType;
  name: string;
  chainId: number;
  explorerApiUrl: string;
  explorerUrl: string;
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: "eth-sepolia",
    name: "Sepolia Testnet",
    chainId: 11155111,
    explorerApiUrl: "https://api.etherscan.io/v2/api",
    explorerUrl: "https://sepolia.etherscan.io",
  },
  {
    id: "eth-mainnet",
    name: "Ethereum Mainnet",
    chainId: 1,
    explorerApiUrl: "https://api.etherscan.io/v2/api",
    explorerUrl: "https://etherscan.io",
  },
];

export interface AnalysisResult {
  summary: string;
  keyFunctions: string[];
  riskLevel: "Low" | "Medium" | "High";
  redFlags: string[];
  suggestions: string[];
  contractHash: string;
  address?: string;
  network?: string;
  auditDate?: string;
  isFromRegistry?: boolean;
  owner?: string;
}
