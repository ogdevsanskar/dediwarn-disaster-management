import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletError {
  message?: string;
  code?: number;
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  selectedAddress?: string;
  chainId?: string;
  isMetaMask?: boolean;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners?: (event: string) => void;
}

interface WalletState {
  account: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    balance: '0',
    chainId: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const balance = await provider.getBalance(accounts[0]);
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setWalletState({
        account: accounts[0],
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        isConnecting: false,
        isConnected: true,
        error: null,
      });

      localStorage.setItem('walletConnected', 'true');
    } catch (error: unknown) {
      const walletError = error as WalletError;
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: walletError.message || 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      account: null,
      balance: '0',
      chainId: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    });
    setProvider(null);
    setSigner(null);
    localStorage.removeItem('walletConnected');
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: unknown) {
      const walletError = error as WalletError;
      if (walletError.code === 4902) {
        // Network not added to MetaMask
        setWalletState(prev => ({
          ...prev,
          error: 'Please add this network to MetaMask',
        }));
      }
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem('walletConnected')) {
        await connectWallet();
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum?.on?.('accountsChanged', (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum?.on?.('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum?.removeAllListeners?.('accountsChanged');
        window.ethereum?.removeAllListeners?.('chainChanged');
      }
    };
  }, [connectWallet, disconnectWallet]);

  return {
    ...walletState,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}