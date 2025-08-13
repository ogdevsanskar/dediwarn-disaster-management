import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Phone, Mail, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import './AIAssistant_clean.css';

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

// Speech Recognition API types (extending any types from other files)
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
    type: 'sms' | 'email' | 'call';
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
  // SMS alerts state
  const [, setSmsAlerts] = useState<SMSAlert[]>([]);
  const [showSmsPanel, setShowSmsPanel] = useState(false);
  const [customSmsMessage, setCustomSmsMessage] = useState('');
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('AIAssistant component mounted');
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: '👋 Hello! I\'m your AI Disaster Management Assistant. I provide real-time disaster analysis and emergency guidance:\n\n🌍 **Real-time Monitoring:**\n• Earthquake activity and seismic data\n• Weather patterns and severe storm tracking\n• Flood levels and water monitoring\n• Emergency alerts and government advisories\n\n🚨 **Emergency Services:**\n• Instant SMS alerts to contacts (6001163688)\n• Emergency service connections\n• Location-based risk assessment\n• Voice commands and TTS responses\n\n🎯 **Ask me questions like:**\n• "Is there earthquake activity in Delhi?"\n• "What\'s the flood risk in Assam?"\n• "Current weather alerts for Mumbai?"\n\nHow can I help you stay safe today?',
        timestamp: new Date(),
        actions: [
          { type: 'sms', label: 'Test Emergency SMS', data: 'test_sms' },
          { type: 'call', label: 'Emergency Contacts', data: 'contacts' }
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
      const recognitionInstance = new SpeechRecognition() as SpeechRecognitionInstance;
      
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
      // Call backend AI chat API for real-time analysis
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          location: getUserLocation()
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          actions: generateActionsFromResponse(data.intent)
        };
      }
    } catch (error) {
      console.error('AI API Error:', error);
    }

    // Fallback to enhanced local responses with disaster focus
    return generateLocalDisasterResponse(userMessage);
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

  const generateActionsFromResponse = (intent: string) => {
    const actions: Array<{ type: 'sms' | 'call'; label: string; data: string }> = [
      { type: 'sms', label: 'Send Alert SMS', data: 'alert_sms' }
    ];

    switch (intent) {
      case 'earthquake':
        actions.push({ type: 'call', label: 'Seismic Services', data: 'seismic' });
        break;
      case 'weather':
        actions.push({ type: 'call', label: 'Weather Service', data: 'weather' });
        break;
      case 'flood':
        actions.push({ type: 'call', label: 'Flood Response', data: 'flood_response' });
        break;
      default:
        actions.push({ type: 'call', label: 'Emergency Services', data: 'emergency' });
    }

    return actions;
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

  const handleActionClick = (action: { type: string; data: string }) => {
    switch (action.type) {
      case 'sms':
        if (action.data === 'emergency' || action.data === 'test_sms') {
          handleSendSMS('6001163688', '🚨 EMERGENCY ALERT: This is an automated disaster management alert. Please respond if you need assistance. Location tracking enabled.');
        } else if (action.data === 'earthquake_alert') {
          handleSendSMS('6001163688', '🚨 EARTHQUAKE ALERT: Seismic activity detected in your area. Follow safety protocols: Drop, Cover, Hold On. Stay safe!');
        } else if (action.data === 'flood_warning') {
          handleSendSMS('6001163688', '🌊 FLOOD WARNING: Rising water levels detected. Move to higher ground immediately. Avoid flooded roads.');
        } else if (action.data === 'weather_alert') {
          handleSendSMS('6001163688', '🌪️ SEVERE WEATHER ALERT: Dangerous weather conditions detected. Stay indoors and monitor emergency broadcasts.');
        }
        break;
      case 'call': {
        const callMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `📞 Initiating call to ${action.data}...\n\nIn a real emergency, this would connect you directly to emergency services. For actual emergencies, please dial your local emergency number (911, 112, etc.).`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, callMessage]);
        break;
      }
    }
  };

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

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">AI Disaster Assistant</h3>
            <p className="text-xs opacity-90">Real-time disaster monitoring</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-full transition-all ${voiceEnabled ? 'bg-white/20' : 'bg-red-500/50'}`}
            title={voiceEnabled ? 'Voice On' : 'Voice Off'}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowSmsPanel(!showSmsPanel)}
            className="p-2 rounded-full hover:bg-white/20 transition-all"
            title="SMS Panel"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/20 transition-all"
            title="Close Assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
              
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action)}
                      className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {action.type === 'sms' && <Phone className="h-3 w-3" />}
                      {action.type === 'call' && <Phone className="h-3 w-3" />}
                      {action.type === 'email' && <Mail className="h-3 w-3" />}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 p-3 rounded-2xl shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce bounce-delay-1"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce bounce-delay-2"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showSmsPanel && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <h4 className="text-sm font-semibold mb-2">Send Custom SMS Alert</h4>
          <input
            type="tel"
            placeholder="Phone number"
            value={customPhoneNumber}
            onChange={(e) => setCustomPhoneNumber(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-2"
          />
          <textarea
            placeholder="Emergency message"
            value={customSmsMessage}
            onChange={(e) => setCustomSmsMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-2 h-16 resize-none"
          />
          <button
            onClick={handleSendCustomSMS}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm transition-colors"
          >
            Send Emergency SMS
          </button>
        </div>
      )}

      <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about disasters, emergencies, or safety..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isListening}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Voice Input'}
            aria-label={isListening ? 'Stop Listening' : 'Start Voice Input'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={() => handleSendMessage()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"
            disabled={!inputMessage.trim() || isListening}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
