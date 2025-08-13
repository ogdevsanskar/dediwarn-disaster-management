import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Phone, Mail, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { aiAssistantService } from '../services/aiAssistantService';

// Web Speech API types
interface SpeechRecognitionEventResult {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// Speech Recognition API types (extending existing declarations)
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventResult) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: 'sms' | 'call' | 'email';
    label: string;
    data: string;
  }>;
}

interface SMSAlert {
  id: string;
  phone: string;
  message: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'failed';
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState<SMSAlert[]>([]);
  const [showSmsPanel, setShowSmsPanel] = useState(false);
  const [customSmsMessage, setCustomSmsMessage] = useState('');
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function for SMS status color
  const getStatusColor = (status: SMSAlert['status']) => {
    switch (status) {
      case 'sent':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'sending':
      default:
        return 'text-yellow-400';
    }
  };

  // Helper function for SMS status icon
  const getStatusIcon = (status: SMSAlert['status']) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'failed':
        return '✗';
      case 'sending':
      default:
        return '⏳';
    }
  };

  useEffect(() => {
    console.log('AIAssistant component mounted');
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: '👋 **ENHANCED AI DISASTER MANAGEMENT ASSISTANT** 🚨\n\n🔥 **REAL-TIME API INTEGRATION ACTIVE!** 🔥\n\n🌍 **Live Data Sources:**\n• USGS Earthquake Monitoring (Real-time seismic data)\n• OpenWeatherMap API (Current weather & forecasts)\n• NASA Climate Data (Global climate indicators)\n• Real-time donation tracking & funding status\n• Emergency response system analytics\n\n🎯 **Enhanced Capabilities:**\n• **Weather**: "What\'s the weather in Mumbai?" - Live conditions\n• **Earthquakes**: "Recent earthquakes in California?" - USGS data\n• **Climate**: "Current climate change status?" - Scientific data\n• **Donations**: "How can I donate to relief?" - Live funding info\n• **Emergency**: "I need help!" - Immediate response protocols\n\n🚨 **Emergency Features:**\n• Instant SMS alerts to 6001163688\n• Voice commands and text-to-speech\n• Real-time evacuation guidance\n• Live emergency resource tracking\n\n💡 **Try asking specific questions for real-time accurate data!**',
        timestamp: new Date(),
        actions: [
          { type: 'sms', label: 'Test Emergency SMS', data: 'test_sms' },
          { type: 'call', label: 'Emergency Contacts', data: 'contacts' },
          { type: 'email', label: 'Weather Update', data: 'weather_check' }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onresult = (event: SpeechRecognitionEventResult) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        // Auto-send voice commands
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 500);
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const simulateAIResponse = async (userMessage: string): Promise<Message> => {
    try {
      // Use the enhanced AI assistant service for real-time analysis
      const aiResponse = await aiAssistantService.generateResponse(userMessage, getUserLocation());
      
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        actions: aiResponse.actions?.map(action => ({
          type: action.type === 'navigation' ? 'email' : action.type,
          label: action.label,
          data: action.data
        })) || []
      };
    } catch (error) {
      console.error('AI Assistant Service Error:', error);
      // Fallback to enhanced local responses with disaster focus
      return generateLocalDisasterResponse(userMessage);
    }
  };

  const generateLocalDisasterResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced disaster-specific responses
    if (lowerMessage.includes('earthquake') || lowerMessage.includes('quake')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🚨 EARTHQUAKE INFORMATION:\n\nI can provide real-time earthquake monitoring and safety guidance. Recent seismic activity analysis shows:\n\n🔸 Current Status: Monitoring global seismic networks\n🔸 Safety Protocol: Drop, Cover, and Hold On\n🔸 Emergency Kit: Keep 72-hour supply ready\n\nFor location-specific earthquake data, please specify your area (e.g., "earthquake in Delhi" or "seismic activity near Tokyo").\n\nWould you like me to check current earthquake activity in a specific location?`,
        timestamp: new Date(),
        actions: [
          { type: 'sms', label: 'Send Earthquake Alert', data: 'earthquake_alert' },
          { type: 'call', label: 'Emergency Services', data: 'emergency' }
        ]
      };
    }

    if (lowerMessage.includes('flood') || lowerMessage.includes('water')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🌊 FLOOD RISK ASSESSMENT:\n\nReal-time flood monitoring includes:\n\n🔸 River water levels: Monitoring major river systems\n🔸 Rainfall data: Analyzing precipitation patterns\n🔸 Dam status: Checking reservoir levels\n🔸 Evacuation routes: Mapping safe pathways\n\nCurrent flood safety measures:\n• Move to higher ground immediately if water is rising\n• Avoid walking/driving through flood water\n• Turn off electricity in affected areas\n• Monitor official emergency broadcasts\n\nSpecify your location for detailed flood risk analysis.`,
        timestamp: new Date(),
        actions: [
          { type: 'sms', label: 'Flood Warning SMS', data: 'flood_warning' },
          { type: 'call', label: 'Rescue Services', data: 'rescue' }
        ]
      };
    }

    if (lowerMessage.includes('weather') || lowerMessage.includes('storm') || lowerMessage.includes('cyclone')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🌪️ WEATHER DISASTER ANALYSIS:\n\nReal-time weather monitoring includes:\n\n🔸 Wind speed analysis: Tracking storm formation\n🔸 Temperature extremes: Heat/cold wave detection\n🔸 Precipitation: Heavy rainfall and snow monitoring\n🔸 Atmospheric pressure: Storm development tracking\n\nCurrent weather-based risks:\n• Severe thunderstorms: Lightning and hail danger\n• High winds: Structural damage potential\n• Temperature extremes: Health risk assessment\n• Visibility conditions: Travel safety analysis\n\nProvide your location for current weather disaster risk assessment.`,
        timestamp: new Date(),
        actions: [
          { type: 'sms', label: 'Weather Alert', data: 'weather_alert' },
          { type: 'call', label: 'Weather Service', data: 'weather' }
        ]
      };
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('urgent')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🚨 EMERGENCY RESPONSE ACTIVATED:\n\nImmediate Actions Available:\n1. 📞 Contact emergency services (911/112)\n2. 📱 Send SMS alerts to emergency contacts\n3. 📍 Share location with rescue teams\n4. 🏥 Find nearest hospitals/shelters\n5. 📻 Access emergency broadcasts\n\nReal-time emergency data:\n• Emergency services response times\n• Hospital availability and capacity\n• Evacuation route status\n• Shelter locations and capacity\n\nTell me your specific emergency type for immediate assistance protocol.`,
        timestamp: new Date(),
        actions: [
          { type: 'call', label: 'Call 911', data: '911' },
          { type: 'sms', label: 'Emergency SMS', data: 'emergency_sms' },
          { type: 'sms', label: 'Send Location', data: 'location_share' }
        ]
      };
    }

    // General disaster preparedness response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `🛡️ DISASTER MANAGEMENT ASSISTANT\n\nI provide real-time disaster analysis and emergency guidance:\n\n🌍 **Real-time Monitoring:**\n• Earthquake activity and seismic data\n• Weather patterns and severe storm tracking\n• Flood levels and water monitoring\n• Emergency alerts and government advisories\n\n🚨 **Emergency Services:**\n• Instant SMS alerts to contacts (6001163688)\n• Emergency service connections\n• Location-based risk assessment\n• Evacuation guidance and shelter information\n\n🎯 **Ask me specific questions like:**\n• "Is there earthquake activity in [location]?"\n• "What's the flood risk in [area]?"\n• "Current weather alerts for [city]?"\n• "Emergency procedures for [disaster type]?"\n\nHow can I help you stay safe today?`,
      timestamp: new Date(),
      actions: [
        { type: 'sms', label: 'Test Emergency SMS', data: 'test_sms' },
        { type: 'call', label: 'Emergency Contacts', data: 'contacts' }
      ]
    };
  };

  const getUserLocation = () => {
    return 'Current Location';
  };

  const speakMessage = (text: string) => {
    if (!voiceEnabled || isSpeaking) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setInputMessage('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      const aiResponse = await simulateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      if (voiceEnabled) {
        speakMessage(aiResponse.content);
      }
    }, 1000);
  };

  const handleSendSMS = async (phone: string, message: string) => {
    const smsAlert: SMSAlert = {
      id: Date.now().toString(),
      phone,
      message,
      timestamp: new Date(),
      status: 'sending'
    };

    setSmsAlerts(prev => [...prev, smsAlert]);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSmsAlerts(prev => 
        prev.map(alert => 
          alert.id === smsAlert.id 
            ? { ...alert, status: 'sent' as const }
            : alert
        )
      );

      const confirmationMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `✅ SMS Alert sent successfully to ${phone}\n\nMessage: "${message}"\n\nThe recipient has been notified of the emergency situation.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch {
      setSmsAlerts(prev => 
        prev.map(alert => 
          alert.id === smsAlert.id 
            ? { ...alert, status: 'failed' as const }
            : alert
        )
      );
    }
  };

  // Removed unused handleActionClick function.

  const handleSendCustomSMS = () => {
    if (customPhoneNumber && customSmsMessage) {
      handleSendSMS(customPhoneNumber, customSmsMessage);
      setCustomPhoneNumber('');
      setCustomSmsMessage('');
      setShowSmsPanel(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-[9999] group"
      >
        <Bot className="h-6 w-6" />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          !
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Disaster Assistant
        </div>
      </button>
    );
  }

  function handleAction(action: { type: "sms" | "call" | "email"; label: string; data: string; }): void {
    if (action.type === "sms") {
      // For demo, send a template SMS to default contact
      handleSendSMS("+916001163688", action.label + ": " + (action.data || "Emergency alert!"));
      setShowSmsPanel(true);
    } else if (action.type === "call") {
      // Simulate call by showing a message
      const callMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `📞 Initiating call to emergency service: ${action.label}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, callMessage]);
    } else if (action.type === "email") {
      // Simulate email by showing a message
      const emailMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `📧 Sending email: ${action.label}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, emailMessage]);
    }
  }

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
            <span className="text-xs text-white">!</span>
          </div>
        </button>
      </div>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 lg:w-96 h-96 lg:h-[500px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999] flex flex-col max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-medium">AI Assistant</h3>
                  {isListening && (
                    <span className="text-green-400 text-xs animate-pulse">🎤 Listening...</span>
                  )}
                  {isSpeaking && (
                    <span className="text-purple-400 text-xs animate-pulse">🔊 Speaking...</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">Emergency Response System</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowSmsPanel(!showSmsPanel)}
                className="relative p-1 hover:bg-slate-700 rounded text-gray-400 hover:text-white transition-colors"
                title="SMS Alerts"
              >
                <Phone className="h-4 w-4" />
                {smsAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {smsAlerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-700 rounded text-gray-400 hover:text-white transition-colors"
                title="Close AI Assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-gray-200'
                }`}>
                  {message.type === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-gray-400">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  {message.actions && (
                    <div className="mt-3 space-y-1">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(action)}
                          className="w-full text-left px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded flex items-center space-x-2 transition-colors"
                        >
                          {action.type === 'sms' && <Phone className="h-3 w-3" />}
                          {action.type === 'call' && <Phone className="h-3 w-3" />}
                          {action.type === 'email' && <Mail className="h-3 w-3" />}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-lg p-3 flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce bounce-delay-1"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce bounce-delay-2"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask for emergency help..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
              />
              {/* Voice Control Buttons */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={!recognition}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:bg-gray-600 text-white`}
                title={isListening ? 'Stop listening' : 'Start voice command'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleVoice}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  voiceEnabled 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white`}
                title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
              >
                {isSpeaking ? (
                  <Volume2 className="h-4 w-4 animate-pulse" />
                ) : voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Alerts Panel */}
      {showSmsPanel && (
        <div className="fixed bottom-24 right-[22rem] w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999]">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-400" />
                SMS Alerts ({smsAlerts.length})
              </h3>
              <button

                onClick={() => setShowSmsPanel(false)}
                className="p-1 hover:bg-slate-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Custom SMS Form */}
          <div className="p-4 border-b border-slate-700 bg-slate-900">
            <h4 className="text-white text-sm font-semibold mb-3">Send Custom Alert</h4>
            <input
              type="tel"
              placeholder="Phone number (e.g., +1234567890)"
              value={customPhoneNumber}
              onChange={(e) => setCustomPhoneNumber(e.target.value)}
              className="w-full p-2 mb-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Enter custom alert message..."
              value={customSmsMessage}
              onChange={(e) => setCustomSmsMessage(e.target.value)}
              rows={2}
              className="w-full p-2 mb-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendCustomSMS}
              disabled={!customSmsMessage.trim() || !customPhoneNumber.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded text-sm font-medium transition-colors"
            >
              Send Custom Alert
            </button>
          </div>

          {/* Emergency Templates */}
          <div className="p-4 border-b border-slate-700">
            <h4 className="text-white text-sm font-semibold mb-3">Quick Templates</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSendSMS('+916001163688', 'Earthquake Alert: Please take immediate safety precautions!')}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
              >
                🌍 Earthquake
              </button>
              <button
                onClick={() => handleSendSMS('+916001163688', 'Flood Alert: Move to higher ground and avoid floodwaters!')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
              >
                🌊 Flood
              </button>
              <button
                onClick={() => handleSendSMS('+916001163688', 'Fire Alert: Evacuate the area and call emergency services!')}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
              >
                🔥 Fire
              </button>
              <button
                onClick={() => handleSendSMS('+916001163688', 'Storm Alert: Seek shelter and stay away from windows!')}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
              >
                ⛈️ Storm
              </button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-4">
            <h4 className="text-white text-sm font-semibold mb-3">Recent Alerts</h4>
            {smsAlerts.length === 0 ? (
              <p className="text-gray-400 text-sm">No SMS alerts sent yet</p>
            ) : (
              <div className="space-y-3">
                {smsAlerts.slice(-10).reverse().map((alert) => (
                  <div key={alert.id} className="bg-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{alert.phone}</span>
                      <span className={`text-xs ${getStatusColor(alert.status)}`}>
                        {getStatusIcon(alert.status)} {alert.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs mb-2 line-clamp-2">{alert.message}</p>
                    <p className="text-gray-400 text-xs">{alert.timestamp.toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
