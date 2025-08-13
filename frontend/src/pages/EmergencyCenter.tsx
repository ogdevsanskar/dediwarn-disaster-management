import React, { useState } from 'react';
import { Phone, MessageSquare, AlertTriangle, MapPin, Camera, Mic, FileText, Send, Shield } from 'lucide-react';

export const EmergencyCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('communication');
  const [reportForm, setReportForm] = useState({
    type: '',
    severity: 'medium',
    description: '',
    location: ''
  });
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');

  const tabs = [
    { id: 'communication', label: 'Emergency Communication', icon: Phone },
    { id: 'reporting', label: 'Incident Reporting', icon: FileText }
  ];

  const emergencyContacts = [
    { type: 'medical', number: '108', name: 'Medical Emergency', color: 'red' },
    { type: 'fire', number: '101', name: 'Fire Department', color: 'orange' },
    { type: 'police', number: '100', name: 'Police', color: 'blue' },
    { type: 'rescue', number: '112', name: 'Rescue Services', color: 'green' },
    { type: 'disaster', number: '1077', name: 'Disaster Management', color: 'purple' }
  ];

  const incidentTypes = [
    'Natural Disaster',
    'Medical Emergency',
    'Fire Incident',
    'Traffic Accident',
    'Crime/Security',
    'Infrastructure Failure',
    'Environmental Hazard',
    'Other'
  ];

  const handleCall = (number: string) => {
    if (navigator.userAgent.includes('Mobile')) {
      window.location.href = `tel:${number}`;
    } else {
      alert(`Emergency Number: ${number}`);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'You',
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleSubmitReport = () => {
    if (reportForm.type && reportForm.description) {
      alert('Emergency report submitted successfully!');
      setReportForm({ type: '', severity: 'medium', description: '', location: '' });
    }
  };

  const renderCommunication = () => (
    <>
      {/* Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {emergencyContacts.map((contact) => (
          <div key={contact.type} className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-${contact.color}-400 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${contact.color}-600/20`}>
                <Shield className={`h-6 w-6 text-${contact.color}-400`} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs bg-${contact.color}-600/20 text-${contact.color}-400`}>
                Emergency
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{contact.name}</h3>
            <p className="text-slate-400 mb-4">24/7 Emergency Response</p>
            <button
              onClick={() => handleCall(contact.number)}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 bg-${contact.color}-600 hover:bg-${contact.color}-700 text-white rounded-lg transition-colors font-medium`}
            >
              <Phone className="h-4 w-4" />
              <span>Call {contact.number}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Communication Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video/Voice Call Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Emergency Communication</h3>
          
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4 h-40 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Video call interface</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Phone className="h-4 w-4" />
                <span>Voice Call</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Camera className="h-4 w-4" />
                <span>Video Call</span>
              </button>
            </div>

            <div className="flex justify-center space-x-4">
              <button className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors">
                <Mic className="h-5 w-5 text-white" />
              </button>
              <button className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors">
                <Phone className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Emergency Chat</h3>
          
          <div className="h-64 bg-slate-900/50 rounded-lg p-4 mb-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-20">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>Emergency chat ready</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="bg-slate-800 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-blue-400 font-medium">{message.sender}</span>
                      <span className="text-slate-500 text-xs">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white">{message.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type emergency message..."
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderReporting = () => (
    <>
      {/* Quick Report Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { type: 'Medical', icon: '🚑', color: 'red' },
          { type: 'Fire', icon: '🔥', color: 'orange' },
          { type: 'Accident', icon: '🚗', color: 'yellow' },
          { type: 'Crime', icon: '🚔', color: 'blue' }
        ].map((quick) => (
          <button
            key={quick.type}
            onClick={() => setReportForm({...reportForm, type: quick.type})}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              reportForm.type === quick.type 
                ? `border-${quick.color}-400 bg-${quick.color}-600/20` 
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl mb-2">{quick.icon}</div>
            <div className="text-white font-medium">{quick.type}</div>
          </button>
        ))}
      </div>

      {/* Report Form */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Submit Incident Report</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Incident Type</label>
            <select
              value={reportForm.type}
              onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
              aria-label="Select incident type"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select incident type...</option>
              {incidentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Severity Level</label>
            <div className="flex space-x-4">
              {['low', 'medium', 'high', 'critical'].map((level) => (
                <button
                  key={level}
                  onClick={() => setReportForm({...reportForm, severity: level})}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    reportForm.severity === level
                      ? level === 'critical' ? 'bg-red-600 text-white' :
                        level === 'high' ? 'bg-orange-600 text-white' :
                        level === 'medium' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={reportForm.location}
                onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
                placeholder="Enter location or use GPS"
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={reportForm.description}
              onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
              placeholder="Describe the incident in detail..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Add Photo</span>
            </button>
            <button
              onClick={handleSubmitReport}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Submit Emergency Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { id: '1', type: 'Traffic Accident', location: 'MG Road', time: '10 min ago', status: 'responded' },
            { id: '2', type: 'Medical Emergency', location: 'Sector 15', time: '25 min ago', status: 'pending' },
            { id: '3', type: 'Fire Incident', location: 'Industrial Area', time: '1 hour ago', status: 'resolved' }
          ].map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <div>
                  <div className="text-white font-medium">{report.type}</div>
                  <div className="text-slate-400 text-sm">{report.location}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'resolved' ? 'bg-green-600/20 text-green-400' :
                  report.status === 'responded' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-orange-600/20 text-orange-400'
                }`}>
                  {report.status}
                </div>
                <div className="text-slate-500 text-xs mt-1">{report.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-2">Emergency Center</h1>
          <p className="text-slate-400">Emergency communication and incident reporting system</p>
        </div>

        {/* Emergency Status Banner */}
        <div className="mb-8 p-4 bg-red-600/20 border border-red-400 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <div className="text-red-400 font-semibold">Emergency Services Active</div>
              <div className="text-red-300 text-sm">All emergency services are operational and responding</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'communication' && renderCommunication()}
        {activeTab === 'reporting' && renderReporting()}
      </div>
    </div>
  );
};
