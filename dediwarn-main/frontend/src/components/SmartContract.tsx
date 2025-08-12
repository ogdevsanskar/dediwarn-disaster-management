import React, { useState } from 'react';
import { Code, Send, Check, Loader, ExternalLink } from 'lucide-react';

export const SmartContract: React.FC = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  const [warningText, setWarningText] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate contract deployment
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
      setContractAddress('0x742d35Cc6665C0532846b18b4A7b283c42c8A52f');
    }, 3000);
  };

  const handleSubmitWarning = async () => {
    setIsSubmitting(true);
    // Simulate warning submission to blockchain
    setTimeout(() => {
      setIsSubmitting(false);
      setWarningText('');
      alert('Warning successfully submitted to blockchain!');
    }, 2000);
  };

  return (
    <section id="contracts" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Smart Contract Interface</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Deploy and interact with warning smart contracts directly from the interface
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contract Deployment */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <Code className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Contract Deployment</h3>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
              <code className="text-green-400 text-sm font-mono whitespace-pre">{`pragma solidity ^0.8.0;

contract WarningSystem {
    struct Warning {
        uint256 id;
        string message;
        uint8 severity;
        address issuer;
        uint256 timestamp;
        bool active;
    }
    
    mapping(uint256 => Warning) public warnings;
    uint256 public warningCount;
    
    event WarningIssued(
        uint256 indexed id,
        string message,
        uint8 severity,
        address issuer
    );
    
    function issueWarning(
        string memory _message,
        uint8 _severity
    ) public {
        warningCount++;
        warnings[warningCount] = Warning(
            warningCount,
            _message,
            _severity,
            msg.sender,
            block.timestamp,
            true
        );
        
        emit WarningIssued(
            warningCount,
            _message,
            _severity,
            msg.sender
        );
    }
}`}</code>
            </div>

            {!isDeployed ? (
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
              >
                {isDeploying ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Deploying Contract...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Deploy Contract</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Contract Deployed Successfully!</span>
                </div>
                <p className="text-sm text-green-700 mb-2">Contract Address:</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-green-100 px-2 py-1 rounded font-mono text-sm flex-1">
                    {contractAddress}
                  </code>
                  <button className="text-green-600 hover:text-green-800">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Warning Submission */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <Send className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900">Submit Warning</h3>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitWarning(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Message
                </label>
                <textarea
                  value={warningText}
                  onChange={(e) => setWarningText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Enter warning message..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas Estimate:</span>
                    <span className="font-mono">~45,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network Fee:</span>
                    <span className="font-mono">~0.002 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmation Time:</span>
                    <span>~15 seconds</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isDeployed || !warningText || isSubmitting}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
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
            </form>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Blockchain Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tx Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Function</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gas Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">0xa1b2c3...def456</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">issueWarning</td>
                  <td className="px-6 py-4 text-sm text-gray-900">43,521</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                      Confirmed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">2 min ago</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">0x789abc...123def</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">resolveWarning</td>
                  <td className="px-6 py-4 text-sm text-gray-900">28,431</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                      Confirmed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">5 min ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};