"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const getProvider = async () => {
        try {
          const browserProvider = new ethers.BrowserProvider(
            (window as any).ethereum
          );
          setProvider(browserProvider);

          const chainId = await (window as any).ethereum.request({
            method: "eth_chainId",
          });
          setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);

          const accounts = await browserProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            setSigner(await browserProvider.getSigner());
          }
        } catch (e) {
          console.error("Failed to list accounts", e);
        }
      };
      getProvider();

      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (provider) provider.getSigner().then(setSigner);
        } else {
          setAccount(null);
          setSigner(null);
        }
      });

      (window as any).ethereum.on("chainChanged", (chainId: string) => {
        setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
        window.location.reload();
      });
    }
  }, []);

  const switchToSepolia = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        setIsCorrectNetwork(true);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Testnet",
                rpcUrls: ["https://rpc.sepolia.org"],
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          setIsCorrectNetwork(true);
        }
      }
    }
  };

  const connect = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(
          (window as any).ethereum
        );
        await browserProvider.send("eth_requestAccounts", []);
        const accounts = await browserProvider.listAccounts();
        setProvider(browserProvider);
        setAccount(accounts[0].address);
        setSigner(await browserProvider.getSigner());
        await switchToSepolia();
      } catch (e) {
        console.error(e);
        throw new Error("User denied account access or error occurred");
      }
    } else {
      throw new Error(
        "No Web3 wallet found (e.g. MetaMask). Please install one."
      );
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
  };

  return {
    account,
    provider,
    signer,
    connect,
    disconnect,
    isCorrectNetwork,
    switchToSepolia,
  };
}
