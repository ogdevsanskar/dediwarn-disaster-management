import React from 'react';
import { SmartContractInterface } from '../components/SmartContractInterface';

export const SmartContracts: React.FC = () => {
  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Smart Contract Interface</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Deploy and interact with warning smart contracts directly from the interface
          </p>
        </div>

        <SmartContractInterface />
      </div>
    </div>
  );
};