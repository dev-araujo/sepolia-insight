import { ethers } from "ethers";
import OpenAI from "openai";

export const AUDIT_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export const AUDIT_REGISTRY_ABI = [
  "event AuditStored(address indexed owner, bytes32 indexed auditHash, uint256 timestamp)",
  "function storeAudit(bytes32 auditHash, string calldata auditJson) external",
  "function getAuditHashesByOwner(address owner) external view returns (bytes32[] memory)",
  "function getAuditData(bytes32 auditHash) external view returns (string memory)",
  "function getAuditTimestamp(bytes32 auditHash) external view returns (uint256)",
  "function getAuditCountByOwner(address owner) external view returns (uint256)",
  "function getAuditHashesByOwnerPaginated(address owner, uint256 offset, uint256 limit) external view returns (bytes32[] memory, uint256)",
];

export const SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com";

export const getSepoliaReadOnlyProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(SEPOLIA_RPC);
};

export const getAuditRegistryReadOnly = (): ethers.Contract => {
  const provider = getSepoliaReadOnlyProvider();
  return new ethers.Contract(AUDIT_REGISTRY_ADDRESS, AUDIT_REGISTRY_ABI, provider);
};

export const getAuditRegistrySigned = (signer: ethers.Signer): ethers.Contract => {
  return new ethers.Contract(AUDIT_REGISTRY_ADDRESS, AUDIT_REGISTRY_ABI, signer);
};

export const getStableAIClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_key" || apiKey.startsWith("ygsk_")) {
    throw new Error(
      "GROQ_API_KEY is missing or invalid. Get a valid key at https://console.groq.com/keys (keys start with 'gsk_')."
    );
  }
  return new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  });
};
