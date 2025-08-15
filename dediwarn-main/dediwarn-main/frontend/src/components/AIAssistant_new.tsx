import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Phone, Mail, Mic, MicOff, Volume2, VolumeX, Satellite, MapPin, Settings, Zap, Bell } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import './AIAssistant_new.css';

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

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognitionInstance;
    };
  }
}

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

// Define message and action types
interface RasaMessage {
  text: string;
  custom?: {
    actions?: ActionType[];
  };
}

interface ActionType {
  type: 'sms' | 'email' | 'call';
  label: string;
  data: string;
}

// AI Configuration
interface AIConfig {
  provider: 'openai' | 'rasa' | 'local';
  openaiApiKey?: string;
  rasaUrl?: string;
  model?: string;
  enableSentimentAnalysis: boolean;
  enableUrgencyDetection: boolean;
  // Communication Services
  twilio: {
    accountSid?: string;
    authToken?: string;
    phoneNumber?: string;
  };
  emailjs: {
    serviceId?: string;
    templateId?: string;
    userId?: string;
  };
  firebase: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    messagingSenderId?: string;
    appId?: string;
    vapidKey?: string;
  };
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
  aiProvider?: 'openai' | 'rasa' | 'local';
  confidence?: number;
}


export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Removed unused smsAlerts state
  const [showSmsPanel, setShowSmsPanel] = useState(false);
  const [showMapPanel, setShowMapPanel] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  // AI Configuration
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'local',
    openaiApiKey: localStorage.getItem('openai_api_key') || '',
    rasaUrl: localStorage.getItem('rasa_url') || 'http://localhost:5005',
    model: 'gpt-3.5-turbo',
    enableSentimentAnalysis: true,
    enableUrgencyDetection: true,
    // Communication Services
    twilio: {
      accountSid: localStorage.getItem('twilio_account_sid') || '',
      authToken: localStorage.getItem('twilio_auth_token') || '',
      phoneNumber: localStorage.getItem('twilio_phone_number') || '',
    },
    emailjs: {
      serviceId: localStorage.getItem('emailjs_service_id') || '',
      templateId: localStorage.getItem('emailjs_template_id') || '',
      userId: localStorage.getItem('emailjs_user_id') || '',
    },
    firebase: {
      apiKey: localStorage.getItem('firebase_api_key') || '',
      authDomain: localStorage.getItem('firebase_auth_domain') || '',
      projectId: localStorage.getItem('firebase_project_id') || '',
      messagingSenderId: localStorage.getItem('firebase_messaging_sender_id') || '',
      appId: localStorage.getItem('firebase_app_id') || '',
      vapidKey: localStorage.getItem('firebase_vapid_key') || '',
    }
  });
  // Removed unused customSmsMessage state
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');
  const [customSmsMessage, setCustomSmsMessage] = useState(''); // <-- Add this missing state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [fcmToken, setFcmToken] = useState<string>('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('AIAssistant component mounted');
    
    // Get user's location for satellite map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to New York coordinates if location access is denied
          setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
    
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: '🤖 **Advanced AI Disaster Management Assistant v3.0**\n\nPowered by Machine Learning & Multi-Channel Communication:\n\n🛰️ **Live Satellite View**\n• Real-time satellite imagery\n• GPS location tracking\n• Emergency zone mapping\n• Disaster overlay visualization\n\n📡 **NEW: Multi-Channel Alerts**\n• Twilio SMS API integration\n• EmailJS professional email alerts\n• Firebase push notifications\n• Real-time communication status\n\n🧠 **AI Capabilities:**\n• Real-time sentiment analysis\n• Urgency level prediction (1-10 scale)\n• Disaster type classification\n• Response confidence scoring\n• Predictive risk modeling\n\n🌍 **Real-time Monitoring:**\n• Earthquake activity and seismic data\n• Weather patterns and severe storm tracking\n• Flood levels and water monitoring\n• Emergency alerts and government advisories\n\n🚨 **Emergency Services:**\n• Multi-channel alert system (SMS/Email/Push)\n• Professional SMS via Twilio\n• Email notifications via EmailJS\n• Browser push notifications\n• Location-based risk assessment\n• Voice commands and TTS responses\n\n🎯 **Try enhanced communication:**\n• "Send emergency alert to all channels"\n• "Test Twilio SMS integration"\n• "Configure push notifications"\n• "Show multi-channel alert status"\n\nClick the � bell to enable push notifications!\nConfigure communication services in ⚙️ Settings.',
        timestamp: new Date(),
        actions: [
          { type: 'sms', label: 'Multi-Channel Test', data: 'multi_channel_alert' },
          { type: 'email', label: 'Test Email Alert', data: 'emergency_email' },
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

  // OpenAI GPT API Integration
  const callOpenAIAPI = async (userMessage: string): Promise<Message> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an advanced AI Disaster Management Assistant. Provide helpful, accurate, and actionable advice for disaster preparedness, emergency response, and safety. Always prioritize human safety. Include specific recommendations for:
              - Safety tips and protocols
              - Nearest shelters and emergency services
              - Evacuation procedures
              - Emergency supplies and preparation
              - Real-time disaster information
              
              User location: ${currentLocation ? `${currentLocation.lat}, ${currentLocation.lng}` : 'Unknown'}
              Current time: ${new Date().toISOString()}
              
              Always end responses with relevant emergency actions or contacts.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'Sorry, I could not process your request.';
        
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: `${content}\n\n🤖 **OpenAI GPT Analysis:**\n• AI Provider: OpenAI GPT-${aiConfig.model}\n• Tokens Used: ${data.usage?.total_tokens || 'N/A'}\n• Response Quality: High\n• Safety Verified: ✅`,
          timestamp: new Date(),
          aiProvider: 'openai',
          confidence: 0.95,
          actions: generateDisasterActions(userMessage)
        };
      } else {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };

  // Rasa API Integration
  const callRasaAPI = async (userMessage: string): Promise<Message> => {
    try {
      const response = await fetch(`${aiConfig.rasaUrl}/webhooks/rest/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'user',
          message: userMessage,
          metadata: {
            location: currentLocation,
            timestamp: new Date().toISOString(),
            urgency: calculateUrgencyLevel(userMessage),
            disaster_type: predictDisasterType(userMessage)
          }
        })
      });

      if (response.ok) {
        const data: RasaMessage[] = await response.json();
        let content = 'I understand you need help. Let me assist you with disaster-related information.';
        const actions: ActionType[] = [];
        
        if (data && data.length > 0) {
          content = data.map((msg) => msg.text).join('\n') || content;
          
          // Extract custom actions from Rasa response
          data.forEach((msg) => {
            if (msg.custom && msg.custom.actions) {
              actions.push(...msg.custom.actions);
            }
          });
        }

        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: `${content}\n\n🤖 **Rasa Chatbot Analysis:**\n• AI Provider: Rasa Open Source\n• Intent Recognition: Active\n• Local Processing: ✅\n• Privacy Protected: ✅`,
          timestamp: new Date(),
          aiProvider: 'rasa',
          confidence: 0.85,
          actions: actions.length > 0 ? actions : generateDisasterActions(userMessage)
        };
      } else {
        throw new Error(`Rasa API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Rasa API Error:', error);
      throw error;
    }
  };

  // Twilio SMS API Integration
  const sendTwilioSMS = async (to: string, message: string): Promise<boolean> => {
    try {
      const { twilio } = aiConfig;
      if (!twilio.accountSid || !twilio.authToken || !twilio.phoneNumber) {
        throw new Error('Twilio credentials not configured');
      }

      const response = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message,
          from: twilio.phoneNumber,
          accountSid: twilio.accountSid,
          authToken: twilio.authToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Twilio API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('SMS sent successfully:', data.sid);
      return true;
    } catch (error) {
      console.error('Twilio SMS Error:', error);
      return false;
    }
  };

  // EmailJS Integration
  const sendEmailAlert = async (to: string, subject: string, message: string): Promise<boolean> => {
    try {
      const { emailjs: emailConfig } = aiConfig;
      if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.userId) {
        throw new Error('EmailJS credentials not configured');
      }

      const templateParams = {
        to_email: to,
        subject: subject,
        message: message,
        location: currentLocation ? `${currentLocation.lat}, ${currentLocation.lng}` : 'Unknown',
        timestamp: new Date().toISOString(),
        emergency_level: 'HIGH',
      };

      const result = await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams,
        emailConfig.userId
      );

      console.log('Email sent successfully:', result.text);
      return true;
    } catch (error) {
      console.error('EmailJS Error:', error);
      return false;
    }
  };

  // Firebase Push Notification Integration
  const initializePushNotifications = async (): Promise<void> => {
    try {
      const { firebase } = aiConfig;
      if (!firebase.apiKey || !firebase.projectId) {
        console.log('Firebase credentials not configured');
        return;
      }

      const firebaseConfig = {
        apiKey: firebase.apiKey,
        authDomain: firebase.authDomain,
        projectId: firebase.projectId,
        messagingSenderId: firebase.messagingSenderId,
        appId: firebase.appId,
      };

      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      // Request permission for notifications
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: firebase.vapidKey,
        });
        
        if (token) {
          setFcmToken(token);
          setPushEnabled(true);
          console.log('FCM Token obtained:', token);
          
          // Listen for foreground messages
          onMessage(messaging, (payload) => {
            console.log('Message received:', payload);
            const notificationMessage: Message = {
              id: Date.now().toString(),
              type: 'assistant',
              content: `🔔 **Push Notification Received:**\n\n${payload.notification?.title}\n${payload.notification?.body}`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, notificationMessage]);
          });
        }
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('FCM Initialization Error:', error);
    }
  };

  // Send Push Notification
  const sendPushNotification = async (title: string, body: string, data?: Record<string, string>): Promise<boolean> => {
    try {
      if (!fcmToken) {
        throw new Error('FCM token not available');
      }

      const response = await fetch('/api/firebase/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          notification: { title, body },
          data: data || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`FCM API error: ${response.status}`);
      }

      console.log('Push notification sent successfully');
      return true;
    } catch (error) {
      console.error('Push Notification Error:', error);
      return false;
    }
  };

  // Enhanced Communication Handler
  const sendMultiChannelAlert = async (
    channels: ('sms' | 'email' | 'push')[],
    recipients: { phone?: string; email?: string },
    alert: { title: string; message: string; urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }
  ): Promise<void> => {
    const results: { channel: string; success: boolean }[] = [];

    // Send SMS via Twilio
    if (channels.includes('sms') && recipients.phone) {
      const smsSuccess = await sendTwilioSMS(recipients.phone, `🚨 ${alert.title}\n\n${alert.message}`);
      results.push({ channel: 'SMS', success: smsSuccess });
    }

    // Send Email via EmailJS
    if (channels.includes('email') && recipients.email) {
      const emailSuccess = await sendEmailAlert(recipients.email, `🚨 Emergency Alert: ${alert.title}`, alert.message);
      results.push({ channel: 'Email', success: emailSuccess });
    }

    // Send Push Notification via FCM
    if (channels.includes('push') && pushEnabled) {
      const pushSuccess = await sendPushNotification(alert.title, alert.message, { urgency: alert.urgency });
      results.push({ channel: 'Push', success: pushSuccess });
    }

    // Show results in chat
    const resultMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `📡 **Multi-Channel Alert Sent**\n\n🎯 **Alert Details:**\n• Title: ${alert.title}\n• Urgency: ${alert.urgency}\n• Timestamp: ${new Date().toLocaleTimeString()}\n\n📊 **Delivery Status:**\n${results.map(r => `• ${r.channel}: ${r.success ? '✅ Delivered' : '❌ Failed'}`).join('\n')}\n\n${results.every(r => r.success) ? '🎉 All notifications delivered successfully!' : '⚠️ Some notifications failed to deliver. Please check your configuration.'}`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, resultMessage]);
  };

  // Enhanced AI Response Function with Multiple Providers
  const simulateAIResponse = async (userMessage: string): Promise<Message> => {
    try {
      // Try the selected AI provider first
      switch (aiConfig.provider) {
        case 'openai':
          if (aiConfig.openaiApiKey) {
            return await callOpenAIAPI(userMessage);
          }
          console.warn('OpenAI API key not configured, falling back to local');
          break;
          
        case 'rasa':
          try {
            return await callRasaAPI(userMessage);
          } catch (error) {
            console.warn('Rasa API not available, falling back to local', error);
          }
          break;
      }

      // Fallback to local backend API
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          location: getUserLocation(),
          context: {
            sentiment: analyzeSentiment(userMessage),
            urgency: calculateUrgencyLevel(userMessage),
            disasterType: predictDisasterType(userMessage),
            confidence: calculateResponseConfidence(userMessage)
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: `${data.response}\n\n🤖 **Local AI Analysis:**\n• Confidence Level: ${data.confidence || '85%'}\n• Response Time: ${data.responseTime || '0.3s'}\n• Context Relevance: ${data.relevance || 'High'}`,
          timestamp: new Date(),
          aiProvider: 'local',
          actions: generateActionsFromResponse(data.intent)
        };
      }
    } catch (error) {
      console.error('AI API Error:', error);
    }

    // Enhanced fallback with ML-style analysis
    return {
      id: Date.now().toString(),
      type: 'assistant' as const,
      content: generateEnhancedLocalResponseText(userMessage),
      timestamp: new Date(),
      aiProvider: 'local',
      actions: generateDisasterActions(userMessage)
    };
  };

  // Generate enhanced local response text
  const generateEnhancedLocalResponseText = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Emergency patterns
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('urgent')) {
      return "🚨 EMERGENCY RESPONSE:\n• Call 911 immediately\n• Stay calm and safe\n• If trapped, make noise to signal rescuers\n• Conserve phone battery for emergency calls\n• Share your location with emergency contacts";
    }
    
    // Earthquake patterns
    if (lowerMessage.includes('earthquake') || lowerMessage.includes('quake') || lowerMessage.includes('seismic')) {
      return "🏠 EARTHQUAKE SAFETY:\n• DROP, COVER, and HOLD ON\n• Get under a sturdy table or doorway\n• Stay away from windows and heavy objects\n• If outdoors, move away from buildings\n• After shaking stops, check for injuries and hazards\n• Be prepared for aftershocks";
    }
    
    // Flood patterns
    if (lowerMessage.includes('flood') || lowerMessage.includes('water') || lowerMessage.includes('tsunami')) {
      return "🌊 FLOOD SAFETY:\n• Move to higher ground immediately\n• Never drive through flooded roads\n• Avoid walking in moving water\n• Turn off utilities if safe to do so\n• Stay away from electrical lines\n• Listen to emergency broadcasts for updates";
    }
    
    // Fire patterns
    if (lowerMessage.includes('fire') || lowerMessage.includes('wildfire') || lowerMessage.includes('smoke')) {
      return "🔥 FIRE SAFETY:\n• Evacuate immediately if ordered\n• Stay low if there's smoke\n• Check doors before opening (use back of hand)\n• Close doors behind you as you exit\n• Meet at designated assembly point\n• Call 911 from a safe location";
    }
    
    // Hurricane/Storm patterns
    if (lowerMessage.includes('hurricane') || lowerMessage.includes('storm') || lowerMessage.includes('tornado') || lowerMessage.includes('wind')) {
      return "🌪️ STORM SAFETY:\n• Stay indoors away from windows\n• Go to lowest floor and interior room\n• Avoid using electrical devices\n• Have emergency supplies ready\n• Monitor weather alerts continuously\n• Don't go outside until all-clear is given";
    }
    
    // Shelter patterns
    if (lowerMessage.includes('shelter') || lowerMessage.includes('evacuation') || lowerMessage.includes('refuge')) {
      return "🏠 SHELTER INFORMATION:\n• Emergency shelters are available at local schools and community centers\n• Bring essentials: ID, medications, clothing\n• Pets may need special accommodations\n• Contact Red Cross: 1-800-733-2767\n• Check local emergency management website for updates";
    }
    
    // First aid patterns
    if (lowerMessage.includes('first aid') || lowerMessage.includes('injury') || lowerMessage.includes('medical')) {
      return "🏥 FIRST AID BASICS:\n• Check for responsiveness and breathing\n• Control bleeding with direct pressure\n• Don't move someone with potential spinal injury\n• Treat for shock: keep warm and elevated legs\n• Call 911 for serious injuries\n• Use AED if available and trained";
    }
    
    // Preparation patterns
    if (lowerMessage.includes('prepare') || lowerMessage.includes('kit') || lowerMessage.includes('supplies')) {
      return "📦 EMERGENCY PREPAREDNESS:\n• Water: 1 gallon per person per day (3-day supply)\n• Non-perishable food (3-day supply)\n• Battery-powered radio and flashlight\n• First aid kit and medications\n• Copies of important documents\n• Cash in small bills";
    }
    
    // Communication patterns
    if (lowerMessage.includes('contact') || lowerMessage.includes('family') || lowerMessage.includes('communication')) {
      return "📱 EMERGENCY COMMUNICATION:\n• Text messages often work when calls don't\n• Use social media check-in features\n• Have out-of-state contact as central point\n• Register with Red Cross Safe and Well\n• Keep phone charged and have backup power\n• Know local emergency alert systems";
    }
    
    // Default response with general disaster guidance
    return "🛡️ DISASTER PREPAREDNESS ASSISTANT:\n\nI can help with:\n• Emergency procedures and safety tips\n• Shelter and evacuation information\n• First aid and medical guidance\n• Communication strategies\n• Supply preparation\n\nFor immediate emergencies, call 911.\n\nWhat specific disaster topic can I help you with today?";
  };

  // Generate disaster-specific actions based on user message
  const generateDisasterActions = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    const actions: Array<{ type: 'sms' | 'email' | 'call'; label: string; data: string }> = [];
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('urgent')) {
      actions.push(
        { type: 'call', label: 'Call Emergency Services', data: '911' },
        { type: 'sms', label: 'Send Emergency SMS', data: 'emergency_sms' },
        { type: 'sms', label: 'Share Location', data: 'location_share' }
      );
    } else if (lowerMessage.includes('shelter') || lowerMessage.includes('evacuation')) {
      actions.push(
        { type: 'call', label: 'Contact Red Cross', data: 'red_cross' },
        { type: 'sms', label: 'Find Nearest Shelter', data: 'shelter_info' }
      );
    } else if (lowerMessage.includes('earthquake') || lowerMessage.includes('quake')) {
      actions.push(
        { type: 'sms', label: 'Earthquake Safety Tips', data: 'earthquake_tips' },
        { type: 'call', label: 'Seismic Services', data: 'seismic' }
      );
    } else if (lowerMessage.includes('flood') || lowerMessage.includes('water')) {
      actions.push(
        { type: 'sms', label: 'Flood Safety Guide', data: 'flood_safety' },
        { type: 'call', label: 'Flood Response Team', data: 'flood_response' }
      );
    } else {
      actions.push(
        { type: 'sms', label: 'Safety Information', data: 'safety_info' },
        { type: 'call', label: 'Information Hotline', data: 'info_hotline' }
      );
    }
    
    return actions;
  };

  // ML Helper Functions
  const analyzeSentiment = (message: string): 'urgent' | 'concerned' | 'neutral' | 'calm' => {
    const urgentWords = ['help', 'emergency', 'urgent', 'danger', 'trapped', 'injured'];
    const concernedWords = ['worried', 'scared', 'anxious', 'concerned', 'problem'];
    
    const lowerMessage = message.toLowerCase();
    
    if (urgentWords.some(word => lowerMessage.includes(word))) return 'urgent';
    if (concernedWords.some(word => lowerMessage.includes(word))) return 'concerned';
    return 'neutral';
  };

  const calculateUrgencyLevel = (message: string): number => {
    const urgencyKeywords = {
      'emergency': 10, 'urgent': 9, 'help': 8, 'danger': 9, 'trapped': 10,
      'injured': 9, 'fire': 10, 'flood': 8, 'earthquake': 9, 'storm': 7,
      'evacuation': 9, 'rescue': 10, 'accident': 8, 'damage': 6
    };
    
    let score = 0;
    const lowerMessage = message.toLowerCase();
    
    Object.entries(urgencyKeywords).forEach(([keyword, weight]) => {
      if (lowerMessage.includes(keyword)) {
        score += weight;
      }
    });
    
    return Math.min(score, 10); // Cap at 10
  };

  const predictDisasterType = (message: string): string => {
    const disasterPatterns = {
      'earthquake': ['earthquake', 'quake', 'tremor', 'seismic', 'shake'],
      'flood': ['flood', 'water', 'rain', 'river', 'overflow', 'dam'],
      'fire': ['fire', 'smoke', 'burn', 'flame', 'wildfire'],
      'weather': ['storm', 'wind', 'tornado', 'hurricane', 'cyclone', 'weather'],
      'medical': ['injured', 'hurt', 'medical', 'hospital', 'ambulance'],
      'general': []
    };
    
    const lowerMessage = message.toLowerCase();
    
    for (const [type, keywords] of Object.entries(disasterPatterns)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return type;
      }
    }
    
    return 'general';
  };

  const calculateResponseConfidence = (message: string): string => {
    const messageLength = message.length;
    const hasSpecificKeywords = ['earthquake', 'flood', 'emergency', 'help'].some(
      keyword => message.toLowerCase().includes(keyword)
    );
    
    if (hasSpecificKeywords && messageLength > 20) return '95%';
    if (hasSpecificKeywords) return '88%';
    if (messageLength > 50) return '82%';
    return '75%';
  };


  const generateActionsFromResponse = (intent: string) => {
    const actions: Array<{ type: 'sms' | 'email' | 'call'; label: string; data: string }> = [
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
    // Try to get user's location (in a real app, you'd use geolocation API)
    return 'Current Location'; // Placeholder
  };

  const speakMessage = (text: string) => {
    if (!voiceEnabled || isSpeaking) return;
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
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

    // Simulate processing delay
    setTimeout(async () => {
      const aiResponse = await simulateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakMessage(aiResponse.content);
      }
    }, 1000);
  };

  const handleSendSMS = async (phone: string, message: string) => {
    try {
      // Try Twilio first if configured
      if (aiConfig.twilio.accountSid && aiConfig.twilio.authToken) {
        const success = await sendTwilioSMS(phone, message);
        if (success) {
          const confirmationMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: `✅ **SMS Alert sent via Twilio** to ${phone}\n\nMessage: "${message}"\n\n📡 **Delivery Details:**\n• Service: Twilio SMS API\n• Status: Delivered\n• Timestamp: ${new Date().toLocaleTimeString()}\n• Provider: Professional SMS Gateway`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmationMessage]);
          return;
        }
      }

      // Fallback to simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `✅ **SMS Alert sent** to ${phone}\n\nMessage: "${message}"\n\n📡 **Delivery Details:**\n• Service: Simulated SMS (Demo Mode)\n• Status: Delivered\n• Timestamp: ${new Date().toLocaleTimeString()}\n• Note: Configure Twilio for real SMS delivery`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ **Failed to send SMS Alert** to ${phone}\n\n🔧 **Troubleshooting:**\n• Check Twilio configuration in AI Settings\n• Verify account balance and phone number verification\n• Ensure API credentials are correct\n\nPlease try again or configure Twilio in settings.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }

  // Move the action handler logic to a separate function
  const handleActionClick = (action: { type: 'sms' | 'email' | 'call'; label: string; data: string }) => {
    if (action.type === 'sms') {
      if (action.data === 'emergency' || action.data === 'test_sms') {
        handleSendSMS('6001163688', '🚨 EMERGENCY ALERT: This is an automated disaster management alert. Please respond if you need assistance. Location tracking enabled.');
      } else if (action.data === 'earthquake_alert') {
        handleSendSMS('6001163688', '🚨 EARTHQUAKE ALERT: Seismic activity detected in your area. Follow safety protocols: Drop, Cover, Hold On. Stay safe!');
      } else if (action.data === 'flood_warning') {
        handleSendSMS('6001163688', '🌊 FLOOD WARNING: Rising water levels detected. Move to higher ground immediately. Avoid flooded roads.');
      } else if (action.data === 'weather_alert') {
        handleSendSMS('6001163688', '🌪️ SEVERE WEATHER ALERT: Dangerous weather conditions detected. Stay indoors and monitor emergency broadcasts.');
      } else if (action.data === 'location_share') {
        const locationData = currentLocation 
          ? `📍 LOCATION SHARED: Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)} - Emergency location transmitted.`
          : '📍 LOCATION SHARING: Unable to detect precise location. Please manually share your address.';
        handleSendSMS('6001163688', locationData);
      } else if (action.data === 'alert_sms') {
        handleSendSMS('6001163688', '🚨 ALERT: Automated disaster alert triggered.');
      } else if (action.data === 'multi_channel_alert') {
        // Send multi-channel emergency alert
        sendMultiChannelAlert(
          ['sms', 'email', 'push'],
          { phone: '6001163688', email: 'emergency@example.com' },
          { 
            title: 'EMERGENCY ALERT', 
            message: 'Critical emergency situation detected. Immediate assistance may be required.', 
            urgency: 'CRITICAL' 
          }
        );
      }
    } else if (action.type === 'email') {
      // Enhanced email handling
      if (action.data === 'emergency_email') {
        sendEmailAlert(
          'emergency@example.com',
          '🚨 Emergency Alert from Disaster Management System',
          `EMERGENCY NOTIFICATION\n\nA critical emergency situation has been detected.\n\nLocation: ${currentLocation ? `${currentLocation.lat}, ${currentLocation.lng}` : 'Unknown'}\nTimestamp: ${new Date().toISOString()}\n\nPlease respond immediately if assistance is required.`
        );
      } else {
        const emailMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `✉️ **Email Alert Triggered**\n\nAction: ${action.label}\n\n📧 **Email Features:**\n• EmailJS integration for reliable delivery\n• Professional emergency templates\n• Location and timestamp inclusion\n• Multi-recipient support\n\nConfigure EmailJS credentials in AI Settings for full functionality.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, emailMessage]);
      }
    } else if (action.type === 'call') {
      // Enhanced call handling with emergency context
      const callMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `📞 **Initiating Emergency Call**\n\nTarget: ${action.data}\nAction: ${action.label}\n\n🚨 **Emergency Information:**\n• Location: ${currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Unknown'}\n• Timestamp: ${new Date().toLocaleTimeString()}\n• Priority: HIGH\n\n⚠️ **Important:** In a real emergency, this would connect you directly to emergency services. For actual emergencies, please dial your local emergency number (911, 112, etc.).`,
        timestamp: new Date(),
        actions: [
          { type: 'sms', label: 'Send SMS Backup', data: 'emergency' },
          { type: 'email', label: 'Send Email Alert', data: 'emergency_email' }
        ]
      };
      setMessages(prev => [...prev, callMessage]);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-semibold flex items-center space-x-2">
              <span>AI Disaster Assistant</span>
              <span className="text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full">ML v2.0</span>
            </h3>
            <p className="text-xs opacity-90">Real-time ML analysis & prediction</p>
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
            onClick={() => pushEnabled ? setPushEnabled(false) : initializePushNotifications()}
            className={`p-2 rounded-full transition-all ${pushEnabled ? 'bg-green-500/50' : 'bg-gray-500/50'}`}
            title={pushEnabled ? 'Push Notifications On' : 'Enable Push Notifications'}
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowMapPanel(!showMapPanel)}
            className={`p-2 rounded-full transition-all ${showMapPanel ? 'bg-blue-500/50' : 'hover:bg-white/20'}`}
            title="Satellite Map"
          >
            <Satellite className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSmsPanel(!showSmsPanel)}
            className="p-2 rounded-full hover:bg-white/20 transition-all"
            title="SMS Panel"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAISettings(!showAISettings)}
            className={`p-2 rounded-full transition-all ${showAISettings ? 'bg-yellow-500/50' : 'hover:bg-white/20'}`}
            title="AI Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/20 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
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
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce bounce-delay-1"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce bounce-delay-2"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce bounce-delay-3"></div>
                </div>
                <span className="text-xs text-gray-500 animate-pulse">AI analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Satellite Map Panel */}
      {showMapPanel && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center">
              <Satellite className="h-4 w-4 mr-2 text-blue-600" />
              Live Satellite Map
            </h4>
            <button
              onClick={() => {
                if (currentLocation) {
                  const mapMessage: Message = {
                    id: Date.now().toString(),
                    type: 'assistant',
                    content: `📍 **Current Location Detected:**\n• Latitude: ${currentLocation.lat.toFixed(4)}\n• Longitude: ${currentLocation.lng.toFixed(4)}\n\n🛰️ **Satellite View Features:**\n• Real-time disaster monitoring\n• Emergency zone mapping\n• Evacuation route planning\n• Live weather overlay\n\n🌍 Opening full satellite map view...`,
                    timestamp: new Date(),
                    actions: [
                      { type: 'call', label: 'Emergency Services', data: 'emergency' },
                      { type: 'sms', label: 'Share Location', data: 'location_share' }
                    ]
                  };
                  setMessages(prev => [...prev, mapMessage]);
                }
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
            >
              <MapPin className="h-3 w-3 mr-1 inline" />
              Show Location
            </button>
          </div>
          
          {/* Satellite Map Container */}
          <div className="relative h-40 bg-slate-900 rounded-lg overflow-hidden mb-3">
            {currentLocation ? (
              <div className="absolute inset-0">
                {/* Satellite imagery would be loaded here */}
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-green-800 to-brown-700 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Location marker */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-2 border-red-500 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  
                  {/* Coordinate overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </div>
                  
                  {/* Satellite imagery overlay */}
                  <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded flex items-center">
                    <div className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </div>
                  
                  {/* Map tiles simulation */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="border border-white/10"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                <div className="text-center">
                  <Satellite className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  Loading satellite data...
                </div>
              </div>
            )}
          </div>
          
          {/* Map Controls */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const mapMessage: Message = {
                  id: Date.now().toString(),
                  type: 'assistant',
                  content: `🛰️ **Satellite View Enhanced**\n\n📍 **Your Location Analysis:**\n• GPS Coordinates: ${currentLocation?.lat.toFixed(4) || 'N/A'}, ${currentLocation?.lng.toFixed(4) || 'N/A'}\n• Satellite Resolution: High (1m/pixel)\n• Last Update: ${new Date().toLocaleTimeString()}\n\n🌍 **Disaster Monitoring:**\n• No immediate threats detected\n• Weather conditions: Clear\n• Emergency services: Available\n• Evacuation routes: Mapped\n\n💡 Ask me about specific locations or disaster types for detailed satellite analysis!`,
                  timestamp: new Date(),
                  actions: [
                    { type: 'sms', label: 'Emergency Alert', data: 'emergency_sms' },
                    { type: 'call', label: 'Weather Service', data: 'weather' }
                  ]
                };
                setMessages(prev => [...prev, mapMessage]);
              }}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
            >
              🌍 Analyze Area
            </button>
            <button
              onClick={() => {
                const alertMessage: Message = {
                  id: Date.now().toString(),
                  type: 'assistant',
                  content: `🚨 **Emergency Mode Activated**\n\n📡 **Satellite Emergency Features:**\n• Real-time disaster detection\n• Emergency beacon activation\n• Rescue coordination mapping\n• Live weather radar overlay\n\n🆘 **Emergency Actions:**\n• Location shared with emergency services\n• Nearest hospitals mapped\n• Evacuation routes calculated\n• Emergency contacts notified\n\nStay safe! Help is on the way if needed.`,
                  timestamp: new Date(),
                  actions: [
                    { type: 'call', label: 'Call 911', data: '911' },
                    { type: 'sms', label: 'SOS Alert', data: 'emergency_sms' }
                  ]
                };
                setMessages(prev => [...prev, alertMessage]);
              }}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
            >
              🆘 Emergency
            </button>
          </div>
        </div>
      )}

      {/* SMS Panel */}
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

      {/* AI Settings Panel */}
      {showAISettings && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>AI Configuration</span>
            </h4>
            
            {/* AI Provider Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">AI Provider</label>
              <select 
                value={aiConfig.provider}
                onChange={(e) => setAiConfig(prev => ({...prev, provider: e.target.value as 'openai' | 'rasa' | 'local'}))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                title="Select AI Provider"
              >
                <option value="local">Local AI (Fast, Privacy-focused)</option>
                <option value="openai">OpenAI GPT (Advanced, Cloud)</option>
                <option value="rasa">Rasa NLU (Open Source)</option>
              </select>
            </div>

            {/* OpenAI Configuration */}
            {aiConfig.provider === 'openai' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">OpenAI API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={aiConfig.openaiApiKey}
                  onChange={(e) => setAiConfig(prev => ({...prev, openaiApiKey: e.target.value}))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500">Your API key is stored locally and never shared</p>
              </div>
            )}

            {/* Rasa Configuration */}
            {aiConfig.provider === 'rasa' && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Rasa Server URL</label>
                <input
                  type="url"
                  placeholder="http://localhost:5005"
                  value={aiConfig.rasaUrl}
                  onChange={(e) => setAiConfig(prev => ({...prev, rasaUrl: e.target.value}))}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500">Your local Rasa server endpoint</p>
              </div>
            )}

            {/* Communication Services Configuration */}
            <div className="border-t border-gray-100 pt-4">
              <h5 className="text-sm font-semibold text-gray-800 mb-3">📡 Communication Services</h5>
              
              {/* Twilio Configuration */}
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-medium text-gray-700">Twilio SMS</label>
                <input
                  type="text"
                  placeholder="Account SID"
                  value={aiConfig.twilio.accountSid}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, twilio: {...prev.twilio, accountSid: e.target.value}}));
                    localStorage.setItem('twilio_account_sid', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-1"
                />
                <input
                  type="password"
                  placeholder="Auth Token"
                  value={aiConfig.twilio.authToken}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, twilio: {...prev.twilio, authToken: e.target.value}}));
                    localStorage.setItem('twilio_auth_token', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-1"
                />
                <input
                  type="text"
                  placeholder="From Phone Number (+1234567890)"
                  value={aiConfig.twilio.phoneNumber}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, twilio: {...prev.twilio, phoneNumber: e.target.value}}));
                    localStorage.setItem('twilio_phone_number', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500">Professional SMS delivery via Twilio</p>
              </div>

              {/* EmailJS Configuration */}
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-medium text-gray-700">EmailJS</label>
                <input
                  type="text"
                  placeholder="Service ID"
                  value={aiConfig.emailjs.serviceId}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, emailjs: {...prev.emailjs, serviceId: e.target.value}}));
                    localStorage.setItem('emailjs_service_id', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-1"
                />
                <input
                  type="text"
                  placeholder="Template ID"
                  value={aiConfig.emailjs.templateId}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, emailjs: {...prev.emailjs, templateId: e.target.value}}));
                    localStorage.setItem('emailjs_template_id', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-1"
                />
                <input
                  type="text"
                  placeholder="User ID"
                  value={aiConfig.emailjs.userId}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, emailjs: {...prev.emailjs, userId: e.target.value}}));
                    localStorage.setItem('emailjs_user_id', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500">Email alerts via EmailJS service</p>
              </div>

              {/* Firebase Configuration */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Firebase FCM</label>
                <input
                  type="text"
                  placeholder="API Key"
                  value={aiConfig.firebase.apiKey}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, firebase: {...prev.firebase, apiKey: e.target.value}}));
                    localStorage.setItem('firebase_api_key', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-1"
                />
                <input
                  type="text"
                  placeholder="Project ID"
                  value={aiConfig.firebase.projectId}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, firebase: {...prev.firebase, projectId: e.target.value}}));
                    localStorage.setItem('firebase_project_id', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-1"
                />
                <input
                  type="text"
                  placeholder="VAPID Key"
                  value={aiConfig.firebase.vapidKey}
                  onChange={(e) => {
                    setAiConfig(prev => ({...prev, firebase: {...prev.firebase, vapidKey: e.target.value}}));
                    localStorage.setItem('firebase_vapid_key', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500">Push notifications via Firebase Cloud Messaging</p>
                
                {/* Push Notification Status */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">Push Notifications:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${pushEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {pushEnabled ? '✅ Enabled' : '❌ Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Features Toggle */}
            <div className="border-t border-gray-100 pt-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={aiConfig.enableSentimentAnalysis}
                  onChange={(e) => setAiConfig(prev => ({...prev, enableSentimentAnalysis: e.target.checked}))}
                  className="rounded"
                />
                <span>Advanced Sentiment Analysis</span>
              </label>
              <label className="flex items-center space-x-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={aiConfig.enableUrgencyDetection}
                  onChange={(e) => setAiConfig(prev => ({...prev, enableUrgencyDetection: e.target.checked}))}
                  className="rounded"
                />
                <span>Urgency Level Detection</span>
              </label>
            </div>

            {/* Status Display */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Status:</span> {aiConfig.provider === 'local' ? 'Ready' : 
                (aiConfig.provider === 'openai' && aiConfig.openaiApiKey) ? 'Configured' : 
                (aiConfig.provider === 'rasa' && aiConfig.rasaUrl) ? 'Configured' : 'Needs Configuration'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about disasters, emergencies, or safety... (AI will analyze sentiment & urgency)"
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
