import React, { useState, useEffect } from 'react';
import { Code, Send, Loader, ExternalLink, AlertTriangle, Activity } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { WarningContract } from '../contracts/WarningContract';

export const SmartContractInterface: React.FC = () => {
  const { provider, signer, isConnected, account } = useWallet();
  const [contract, setContract] = useState<WarningContract | null>(null);
  const [warningText, setWarningText] = useState('');
  const [severity, setSeverity] = useState(2);
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  type Transaction = {
    id: number;
    type: string;
    hash: string;
    timestamp: Date;
    status?: string;
    details?: {
      id?: number;
      message?: string;
      severity?: number;
      issuer?: string;
      location?: string;
    };
  };

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const loadContractData = React.useCallback(async (contract: WarningContract) => {
    try {
      await loadWarningCount(contract);
      if (account) {
        const authorized = await contract.isAuthorizedIssuer(account);
        setIsAuthorized(authorized);
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  }, [account]);

  useEffect(() => {
    if (provider && signer && isConnected) {
      const warningContract = new WarningContract(provider, signer);
      setContract(warningContract);

      // Load initial data
      loadContractData(warningContract);

      // Listen for events
      warningContract.onWarningIssued((id, message, severity, issuer, location) => {
        setRecentTransactions(prev => [{
          id: Date.now(),
          type: 'Warning Issued',
          hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
          timestamp: new Date(),
          details: { id, message, severity, issuer, location }
        }, ...prev.slice(0, 4)]);
        loadWarningCount(warningContract);
      });

      warningContract.onWarningResolved((id) => {
        setRecentTransactions(prev => [{
          id: Date.now(),
          type: 'Warning Resolved',
          hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
          timestamp: new Date(),
          details: { id }
        }, ...prev.slice(0, 4)]);
      });

      return () => {
        warningContract.removeAllListeners();
      };
    }
  }, [provider, signer, isConnected, loadContractData]);

  const loadWarningCount = async (contract: WarningContract) => {
    try {
      const count = await contract.getWarningCount();
      setWarningCount(Number(count));
    } catch (error) {
      console.error('Error loading warning count:', error);
    }
  };

  const handleSubmitWarning = async () => {
    if (!contract || !warningText || !location) return;

    setIsSubmitting(true);
    try {
      const tx = await contract.issueWarning(warningText, severity, location);
      
      setRecentTransactions(prev => [{
        id: Date.now(),
        type: 'Warning Submitted',
        hash: tx.hash,
        timestamp: new Date(),
        status: 'pending'
      }, ...prev.slice(0, 4)]);

      setWarningText('');
      setLocation('');
      setSeverity(2);
      
      // Show success message
      alert('Warning successfully submitted to blockchain!');
    } catch (error: unknown) {
      console.error('Error submitting warning:', error);
      let message = 'Failed to submit warning';
      if (error instanceof Error) {
        message = error.message;
      }
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityLabel = (level: number) => {
    switch (level) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  };

  const getSeverityColor = (level: number) => {
    switch (level) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-orange-400';
      case 4: return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
        <p className="text-slate-400">Please connect your wallet to interact with smart contracts</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Warnings</p>
              <p className="text-2xl font-bold text-white">{warningCount}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Authorization Status</p>
              <p className={`text-lg font-semibold ${isAuthorized ? 'text-green-400' : 'text-red-400'}`}>
                {isAuthorized ? 'Authorized' : 'Not Authorized'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isAuthorized ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Network Status</p>
              <p className="text-lg font-semibold text-green-400">Connected</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Warning Submission Form */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Send className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Submit Warning to Blockchain</h3>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmitWarning(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Warning Message *
            </label>
            <textarea
              value={warningText}
              onChange={(e) => setWarningText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
              rows={4}
              placeholder="Enter detailed warning message..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="severity-select" className="block text-sm font-medium text-slate-300 mb-2">
                Severity Level *
              </label>
              <select
                id="severity-select"
                aria-label="Severity Level"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value={1}>Low (1)</option>
                <option value={2}>Medium (2)</option>
                <option value={3}>High (3)</option>
                <option value={4}>Critical (4)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h4 className="font-medium text-white mb-3">Transaction Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Function:</span>
                <span className="font-mono text-blue-400">issueWarning()</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Severity:</span>
                <span className={`font-medium ${getSeverityColor(severity)}`}>
                  {getSeverityLabel(severity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gas Estimate:</span>
                <span className="font-mono text-white">~85,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network Fee:</span>
                <span className="font-mono text-white">~0.004 ETH</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!warningText || !location || isSubmitting || !isAuthorized}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Submitting to Blockchain...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Submit Warning</span>
              </>
            )}
          </button>

          {!isAuthorized && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Authorization Required</span>
              </div>
              <p className="text-yellow-300 text-sm mt-1">
                Your address is not authorized to issue warnings. Contact an administrator to get authorized.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
          <Code className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Recent Blockchain Activity</h3>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tx.status === 'pending' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{tx.type}</p>
                    <p className="text-slate-400 text-sm">{tx.timestamp.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-slate-800 px-2 py-1 rounded text-blue-400">
                    {tx.hash}
                  </code>
                  <button className="text-slate-400 hover:text-blue-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};