import { Web3Address, NetworkType, SUPPORTED_NETWORKS } from "../types";

export async function fetchContractSourceCode(
  address: Web3Address,
  networkId: NetworkType
): Promise<string> {
  const network = SUPPORTED_NETWORKS.find(n => n.id === networkId);
  if (!network) {
    throw new Error(`Network ${networkId} is not supported.`);
  }

  const apiKey = process.env.ETHERSCAN_API_KEY;

  let url = `${network.explorerApiUrl}?module=contract&action=getsourcecode&address=${address}`;

  if (network.id.startsWith("eth-")) {
    if (!apiKey || apiKey === "your_etherscan_api_key_here") {
      throw new Error("Etherscan API Key is missing. Please add it to your .env.local file.");
    }
    url += `&chainid=${network.chainId}&apikey=${apiKey}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Explorer API returned status ${response.status}: ${text}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Explorer API returned non-JSON response. The contract might not be verified or the API is unavailable.");
    }

    const data = await response.json();

    if (data.status === "0") {
      const reason = data.result || data.message || "Unknown explorer error";
      throw new Error(`Explorer API Error: ${reason}`);
    }

    if (!data.result || !data.result[0] || data.result[0].SourceCode === "") {
      throw new Error("Contract source code not found or not verified on the explorer.");
    }

    return data.result[0].SourceCode;
  } catch (error: any) {
    throw error;
  }
}
