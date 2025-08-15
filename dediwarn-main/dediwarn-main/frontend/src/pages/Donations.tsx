import React, { useState } from 'react';
import { Heart, DollarSign, Users, Target, TrendingUp, Gift, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import './Donations.css';

interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  donors: number;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  image: string;
  location: string;
  endDate: string;
}

export const Donations: React.FC = () => {
  const { isConnected } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [donationMethod, setDonationMethod] = useState<'crypto' | 'card'>('crypto');
  const [isDonating, setIsDonating] = useState(false);

  const campaigns: Campaign[] = [
    {
      id: '1',
      title: 'Hurricane Relief Fund',
      description: 'Emergency aid for communities affected by Hurricane Maria. Providing shelter, food, and medical supplies.',
      target: 100000,
      raised: 67500,
      donors: 234,
      category: 'Natural Disaster',
      urgency: 'critical',
      image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg',
      location: 'Caribbean Islands',
      endDate: '2024-02-15'
    },
    {
      id: '2',
      title: 'Wildfire Recovery Support',
      description: 'Help families rebuild their homes and lives after devastating wildfires in California.',
      target: 75000,
      raised: 45200,
      donors: 189,
      category: 'Natural Disaster',
      urgency: 'high',
      image: 'https://images.pexels.com/photos/266487/pexels-photo-266487.jpeg',
      location: 'California, USA',
      endDate: '2024-03-01'
    },
    {
      id: '3',
      title: 'Earthquake Emergency Response',
      description: 'Immediate relief for earthquake victims including medical aid, temporary housing, and food supplies.',
      target: 150000,
      raised: 89300,
      donors: 456,
      category: 'Natural Disaster',
      urgency: 'critical',
      image: 'https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg',
      location: 'Turkey & Syria',
      endDate: '2024-01-30'
    },
    {
      id: '4',
      title: 'Flood Relief Operations',
      description: 'Supporting communities affected by severe flooding with clean water, food, and temporary shelter.',
      target: 50000,
      raised: 32100,
      donors: 145,
      category: 'Natural Disaster',
      urgency: 'medium',
      image: 'https://images.pexels.com/photos/552789/pexels-photo-552789.jpeg',
      location: 'Bangladesh',
      endDate: '2024-02-28'
    }
  ];

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const handleDonate = async () => {
    if (!selectedCampaign) return;
    
    setIsDonating(true);
    
    // Simulate donation process
    setTimeout(() => {
      setIsDonating(false);
      alert('Thank you for your donation! Your contribution will help save lives.');
      setSelectedCampaign(null);
      setSelectedAmount(50);
      setCustomAmount('');
    }, 3000);
  };

  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalDonors = campaigns.reduce((sum, campaign) => sum + campaign.donors, 0);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Emergency Relief Donations</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Support disaster relief efforts worldwide through secure blockchain donations. Every contribution helps save lives and rebuild communities.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { title: 'Total Raised', value: `$${totalRaised.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
            { title: 'Active Campaigns', value: campaigns.length.toString(), icon: Target, color: 'from-blue-500 to-cyan-500' },
            { title: 'Total Donors', value: totalDonors.toString(), icon: Users, color: 'from-purple-500 to-pink-500' },
            { title: 'Lives Impacted', value: '12,500+', icon: Heart, color: 'from-red-500 to-orange-500' }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 animate-fade-in-up animation-delay-${index}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {campaigns.map((campaign, index) => (
            <div
            className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105 animate-fade-in-up donation-card-delay-${index}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getUrgencyColor(campaign.urgency)}`}>
                    {campaign.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-medium">{campaign.location}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{campaign.title}</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">{campaign.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm">Progress</span>
                    <span className="text-white font-medium">
                      ${campaign.raised.toLocaleString()} / ${campaign.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 campaign-progress-bar"
                      data-width={`${(campaign.raised / campaign.target) * 100}%`}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
                    <span>{campaign.donors} donors</span>
                    <span>{Math.round((campaign.raised / campaign.target) * 100)}% funded</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedCampaign(campaign.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Heart className="h-5 w-5" />
                  <span>Donate Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Donation Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-scale-in">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Make a Donation</h2>
                  <button 
                    onClick={() => setSelectedCampaign(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Campaign Info */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">
                    {campaigns.find(c => c.id === selectedCampaign)?.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {campaigns.find(c => c.id === selectedCampaign)?.description}
                  </p>
                </div>

                {/* Donation Method */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDonationMethod('crypto')}
                      className={`flex items-center justify-center space-x-2 p-4 rounded-lg border transition-all duration-200 ${
                        donationMethod === 'crypto'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <Wallet className="h-5 w-5" />
                      <span>Cryptocurrency</span>
                    </button>
                    <button
                      onClick={() => setDonationMethod('card')}
                      className={`flex items-center justify-center space-x-2 p-4 rounded-lg border transition-all duration-200 ${
                        donationMethod === 'card'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Credit Card</span>
                    </button>
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Donation Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          selectedAmount === amount && !customAmount
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Wallet Connection Warning */}
                {donationMethod === 'crypto' && !isConnected && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Wallet Required</span>
                    </div>
                    <p className="text-yellow-300 text-sm mt-1">
                      Please connect your wallet to make cryptocurrency donations.
                    </p>
                  </div>
                )}

                {/* Donation Summary */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Donation Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-white font-medium">
                        ${customAmount || selectedAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processing Fee:</span>
                      <span className="text-white">
                        {donationMethod === 'crypto' ? '$0 (Gas fees apply)' : '2.9% + $0.30'}
                      </span>
                    </div>
                    <div className="border-t border-slate-600 pt-2 flex justify-between">
                      <span className="text-slate-400">Total:</span>
                      <span className="text-white font-bold">
                        ${donationMethod === 'crypto' 
                          ? (customAmount || selectedAmount)
                          : Math.round((parseFloat(customAmount || selectedAmount.toString()) * 1.029 + 0.30) * 100) / 100
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Donate Button */}
                <button
                  onClick={handleDonate}
                  disabled={isDonating || (!customAmount && !selectedAmount) || (donationMethod === 'crypto' && !isConnected)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isDonating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="h-5 w-5" />
                      <span>Complete Donation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Impact Section */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 animate-fade-in-up donations-impact-delay">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Your Impact</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how your donations are making a real difference in disaster-affected communities worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Emergency Shelters Built', value: '47', description: 'Providing safe housing for displaced families' },
              { title: 'Medical Supplies Delivered', value: '2,340', description: 'Life-saving medications and equipment' },
              { title: 'Meals Provided', value: '15,600', description: 'Nutritious food for survivors and rescue workers' }
            ].map((impact, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{impact.value}</div>
                <div className="text-white font-medium mb-1">{impact.title}</div>
                <div className="text-slate-400 text-sm">{impact.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};