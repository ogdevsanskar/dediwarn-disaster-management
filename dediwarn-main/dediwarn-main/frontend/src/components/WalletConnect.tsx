import React, { useState } from 'react';
import { Wallet, Copy, ExternalLink, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnect: React.FC = () => {
  const {
    account,
    balance,
    chainId,
    isConnecting,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork
  } = useWallet();

  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Mumbai Testnet';
      default: return `Chain ID: ${chainId}`;
    }
  };

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {isConnecting ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Wallet className="h-5 w-5" />
          )}
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>

        {error && (
          <div className="absolute top-full mt-2 right-0 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm max-w-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-3 px-4 py-2 bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-slate-600 transition-all duration-200 hover:scale-105"
      >
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        <div className="text-left">
          <div className="text-white text-sm font-medium">
            {formatAddress(account!)}
          </div>
          <div className="text-slate-400 text-xs">
            {parseFloat(balance).toFixed(4)} ETH
          </div>
        </div>
        <Wallet className="h-4 w-4 text-blue-400" />
      </button>

      {showDetails && (
        <div className="absolute top-full mt-2 right-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-4 min-w-[300px] z-50 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Wallet Details</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider">Address</label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-white text-sm bg-slate-700 px-2 py-1 rounded flex-1 font-mono">
                  {account}
                </code>
                <button
                  onClick={copyAddress}
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button className="text-slate-400 hover:text-blue-400 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider">Balance</label>
              <div className="text-white text-lg font-semibold mt-1">
                {parseFloat(balance).toFixed(6)} ETH
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider">Network</label>
              <div className="flex items-center justify-between mt-1">
                <span className="text-white text-sm">
                  {chainId ? getNetworkName(chainId) : 'Unknown'}
                </span>
                {chainId !== 1 && (
                  <button
                    onClick={() => switchNetwork(1)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Switch to Mainnet
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700">
              <button
                onClick={disconnectWallet}
                className="w-full bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};