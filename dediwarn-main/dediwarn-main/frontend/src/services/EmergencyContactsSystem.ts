// Emergency Contacts System - Comprehensive GPS-based Emergency Services
// Handles local emergency numbers, international support, family contacts, and medical info

import { InputSanitizer } from '../security/securityMiddleware';

// International Emergency Numbers Database
export const INTERNATIONAL_EMERGENCY_NUMBERS = {
  // North America
  US: { police: '911', fire: '911', medical: '911', general: '911' },
  CA: { police: '911', fire: '911', medical: '911', general: '911' },
  MX: { police: '911', fire: '911', medical: '911', general: '911' },
  
  // Europe
  GB: { police: '999', fire: '999', medical: '999', general: '112' },
  DE: { police: '110', fire: '112', medical: '112', general: '112' },
  FR: { police: '17', fire: '18', medical: '15', general: '112' },
  IT: { police: '113', fire: '115', medical: '118', general: '112' },
  ES: { police: '091', fire: '080', medical: '061', general: '112' },
  NL: { police: '112', fire: '112', medical: '112', general: '112' },
  BE: { police: '101', fire: '100', medical: '100', general: '112' },
  CH: { police: '117', fire: '118', medical: '144', general: '112' },
  AT: { police: '133', fire: '122', medical: '144', general: '112' },
  DK: { police: '112', fire: '112', medical: '112', general: '112' },
  SE: { police: '112', fire: '112', medical: '112', general: '112' },
  NO: { police: '112', fire: '110', medical: '113', general: '112' },
  FI: { police: '112', fire: '112', medical: '112', general: '112' },
  
  // Asia
  IN: { police: '100', fire: '101', medical: '108', general: '112' },
  CN: { police: '110', fire: '119', medical: '120', general: '110' },
  JP: { police: '110', fire: '119', medical: '119', general: '110' },
  KR: { police: '112', fire: '119', medical: '119', general: '112' },
  SG: { police: '999', fire: '995', medical: '995', general: '999' },
  MY: { police: '999', fire: '994', medical: '999', general: '999' },
  TH: { police: '191', fire: '199', medical: '1669', general: '191' },
  PH: { police: '117', fire: '116', medical: '911', general: '911' },
  ID: { police: '110', fire: '113', medical: '118', general: '112' },
  VN: { police: '113', fire: '114', medical: '115', general: '113' },
  
  // Middle East
  AE: { police: '999', fire: '997', medical: '998', general: '999' },
  SA: { police: '999', fire: '998', medical: '997', general: '999' },
  IL: { police: '100', fire: '102', medical: '101', general: '112' },
  TR: { police: '155', fire: '110', medical: '112', general: '112' },
  
  // Africa
  ZA: { police: '10111', fire: '10177', medical: '10177', general: '112' },
  EG: { police: '122', fire: '180', medical: '123', general: '122' },
  NG: { police: '199', fire: '199', medical: '199', general: '112' },
  
  // South America
  BR: { police: '190', fire: '193', medical: '192', general: '911' },
  AR: { police: '101', fire: '100', medical: '107', general: '911' },
  CL: { police: '133', fire: '132', medical: '131', general: '133' },
  CO: { police: '123', fire: '119', medical: '125', general: '123' },
  PE: { police: '105', fire: '116', medical: '117', general: '911' },
  
  // Oceania
  AU: { police: '000', fire: '000', medical: '000', general: '000' },
  NZ: { police: '111', fire: '111', medical: '111', general: '111' },
  
  // Default fallback
  DEFAULT: { police: '112', fire: '112', medical: '112', general: '112' }
};

// GPS Coordinate Ranges for Country Detection
export const COUNTRY_GPS_RANGES = {
  US: { latMin: 24.396308, latMax: 49.384358, lngMin: -125.0, lngMax: -66.93457 },
  CA: { latMin: 41.6, latMax: 83.23324, lngMin: -141.0, lngMax: -52.6 },
  MX: { latMin: 14.5388, latMax: 32.71865, lngMin: -118.4, lngMax: -86.7 },
  
  GB: { latMin: 49.9, latMax: 60.9, lngMin: -8.1, lngMax: 1.8 },
  DE: { latMin: 47.3, latMax: 55.1, lngMin: 5.9, lngMax: 15.0 },
  FR: { latMin: 41.3, latMax: 51.1, lngMin: -5.1, lngMax: 9.6 },
  IT: { latMin: 35.5, latMax: 47.1, lngMin: 6.6, lngMax: 18.5 },
  ES: { latMin: 27.6, latMax: 43.8, lngMin: -18.2, lngMax: 4.3 },
  
  IN: { latMin: 6.7, latMax: 35.7, lngMin: 68.1, lngMax: 97.4 },
  CN: { latMin: 18.2, latMax: 53.6, lngMin: 73.6, lngMax: 134.8 },
  JP: { latMin: 24.0, latMax: 46.0, lngMin: 123.0, lngMax: 146.0 },
  
  AU: { latMin: -44.0, latMax: -10.0, lngMin: 113.0, lngMax: 154.0 },
  BR: { latMin: -33.8, latMax: 5.3, lngMin: -74.0, lngMax: -28.8 }
};

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number; // 1 = highest priority
  canReceiveSMS: boolean;
  canReceiveCall: boolean;
  medicalProxy?: boolean; // Can make medical decisions
  emergencyOnly?: boolean; // Only contact in emergencies
}

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  physicianName?: string;
  physicianPhone?: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  emergencyContact?: EmergencyContact;
  medicalDirectives?: {
    organDonor?: boolean;
    dnaResuscitate?: boolean;
    medicalPowerOfAttorney?: string;
  };
}

export interface LocalEmergencyNumbers {
  country: string;
  countryCode: string;
  police: string;
  fire: string;
  medical: string;
  general: string;
  local?: {
    disasterHelpline?: string;
    poisonControl?: string;
    mentalHealthCrisis?: string;
    childAbuse?: string;
    domesticViolence?: string;
  };
}

export class EmergencyContactsSystem {
  
  // Auto-detect country based on GPS coordinates
  static detectCountryFromGPS(lat: number, lng: number): string {
    // Validate coordinates first
    const sanitizedCoords = InputSanitizer.sanitizeCoordinates(lat, lng);
    if (!sanitizedCoords) {
      return 'DEFAULT';
    }
    
    const { lat: sanitizedLat, lng: sanitizedLng } = sanitizedCoords;
    
    for (const [countryCode, range] of Object.entries(COUNTRY_GPS_RANGES)) {
      if (
        sanitizedLat >= range.latMin &&
        sanitizedLat <= range.latMax &&
        sanitizedLng >= range.lngMin &&
        sanitizedLng <= range.lngMax
      ) {
        return countryCode;
      }
    }
    
    return 'DEFAULT';
  }
  
  // Get local emergency numbers based on GPS location
  static async getLocalEmergencyNumbers(lat: number, lng: number): Promise<LocalEmergencyNumbers> {
    try {
      const countryCode = this.detectCountryFromGPS(lat, lng);
      const emergencyNumbers = INTERNATIONAL_EMERGENCY_NUMBERS[countryCode as keyof typeof INTERNATIONAL_EMERGENCY_NUMBERS] || INTERNATIONAL_EMERGENCY_NUMBERS.DEFAULT;
      
      // Try to get more specific local numbers via geocoding API
      let localNumbers = {};
      try {
        const response = await fetch(`/api/emergency-services/local?lat=${lat}&lng=${lng}`);
        if (response.ok) {
          const data = await response.json();
          localNumbers = data.localNumbers || {};
        }
      } catch (error) {
        console.warn('Could not fetch local emergency numbers:', error);
      }
      
      return {
        country: this.getCountryName(countryCode),
        countryCode,
        police: emergencyNumbers.police,
        fire: emergencyNumbers.fire,
        medical: emergencyNumbers.medical,
        general: emergencyNumbers.general,
        local: {
          disasterHelpline: this.getLocalHelpline(countryCode),
          poisonControl: this.getPoisonControlNumber(countryCode),
          mentalHealthCrisis: this.getMentalHealthNumber(countryCode),
          ...localNumbers
        }
      };
    } catch (error) {
      console.error('Error getting emergency numbers:', error);
      return {
        country: 'Unknown',
        countryCode: 'DEFAULT',
        police: '112',
        fire: '112',
        medical: '112',
        general: '112'
      };
    }
  }
  
  // Get country name from country code
  static getCountryName(countryCode: string): string {
    const countryNames: { [key: string]: string } = {
      US: 'United States',
      CA: 'Canada',
      MX: 'Mexico',
      GB: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
      IT: 'Italy',
      ES: 'Spain',
      IN: 'India',
      CN: 'China',
      JP: 'Japan',
      AU: 'Australia',
      BR: 'Brazil',
      DEFAULT: 'International'
    };
    
    return countryNames[countryCode] || 'Unknown';
  }
  
  // Get local disaster helpline numbers
  static getLocalHelpline(countryCode: string): string {
    const helplines: { [key: string]: string } = {
      US: '1-800-RED-CROSS',
      IN: '1077',
      GB: '0800-777-4055',
      AU: '132-500',
      CA: '1-800-733-2767',
      DEFAULT: '112'
    };
    
    return helplines[countryCode] || helplines.DEFAULT;
  }
  
  // Get poison control numbers
  static getPoisonControlNumber(countryCode: string): string {
    const poisonControl: { [key: string]: string } = {
      US: '1-800-222-1222',
      GB: '111',
      AU: '13-11-26',
      CA: '1-844-764-7669',
      DEFAULT: '112'
    };
    
    return poisonControl[countryCode] || poisonControl.DEFAULT;
  }
  
  // Get mental health crisis numbers
  static getMentalHealthNumber(countryCode: string): string {
    const mentalHealth: { [key: string]: string } = {
      US: '1-800-273-8255', // National Suicide Prevention Lifeline
      GB: '116-123', // Samaritans
      AU: '13-11-14', // Lifeline
      CA: '1-833-456-4566', // Talk Suicide Canada
      DEFAULT: '112'
    };
    
    return mentalHealth[countryCode] || mentalHealth.DEFAULT;
  }
  
  // Validate and sanitize emergency contact
  static validateEmergencyContact(contact: EmergencyContact): EmergencyContact | null {
    try {
      const sanitizedContact: EmergencyContact = {
        id: contact.id || `contact_${Date.now()}`,
        name: InputSanitizer.sanitizeText(contact.name),
        phone: InputSanitizer.sanitizePhoneNumber(contact.phone),
        relationship: InputSanitizer.sanitizeText(contact.relationship),
        priority: Math.max(1, Math.min(10, contact.priority || 5)),
        canReceiveSMS: Boolean(contact.canReceiveSMS),
        canReceiveCall: Boolean(contact.canReceiveCall),
        medicalProxy: Boolean(contact.medicalProxy),
        emergencyOnly: Boolean(contact.emergencyOnly)
      };
      
      // Validate required fields
      if (!sanitizedContact.name || !sanitizedContact.phone) {
        return null;
      }
      
      return sanitizedContact;
    } catch (error) {
      console.error('Error validating emergency contact:', error);
      return null;
    }
  }
  
  // Sort emergency contacts by priority
  static sortContactsByPriority(contacts: EmergencyContact[]): EmergencyContact[] {
    return contacts.sort((a, b) => {
      // Primary sort by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Secondary sort by medical proxy capability
      if (a.medicalProxy !== b.medicalProxy) {
        return a.medicalProxy ? -1 : 1;
      }
      
      // Tertiary sort by relationship priority
      const relationshipPriority: { [key: string]: number } = {
        'spouse': 1,
        'parent': 2,
        'child': 3,
        'sibling': 4,
        'guardian': 5,
        'friend': 6,
        'other': 7
      };
      
      const aPriority = relationshipPriority[a.relationship.toLowerCase()] || 7;
      const bPriority = relationshipPriority[b.relationship.toLowerCase()] || 7;
      
      return aPriority - bPriority;
    });
  }
  
  // Get high-priority emergency contacts for immediate notification
  static getHighPriorityContacts(contacts: EmergencyContact[], maxContacts: number = 3): EmergencyContact[] {
    const sortedContacts = this.sortContactsByPriority(contacts);
    return sortedContacts
      .filter(contact => contact.priority <= 3) // Only high priority contacts
      .slice(0, maxContacts);
  }
  
  // Format medical information for emergency responders
  static formatMedicalInfoForResponders(medicalInfo: MedicalInfo): string {
    const sections = [];
    
    if (medicalInfo.bloodType) {
      sections.push(`Blood Type: ${medicalInfo.bloodType}`);
    }
    
    if (medicalInfo.allergies && medicalInfo.allergies.length > 0) {
      sections.push(`Allergies: ${medicalInfo.allergies.join(', ')}`);
    }
    
    if (medicalInfo.conditions && medicalInfo.conditions.length > 0) {
      sections.push(`Medical Conditions: ${medicalInfo.conditions.join(', ')}`);
    }
    
    if (medicalInfo.medications && medicalInfo.medications.length > 0) {
      sections.push(`Current Medications: ${medicalInfo.medications.join(', ')}`);
    }
    
    if (medicalInfo.physicianName && medicalInfo.physicianPhone) {
      sections.push(`Physician: ${medicalInfo.physicianName} (${medicalInfo.physicianPhone})`);
    }
    
    if (medicalInfo.emergencyContact) {
      sections.push(`Emergency Contact: ${medicalInfo.emergencyContact.name} (${medicalInfo.emergencyContact.phone})`);
    }
    
    return sections.join(' | ');
  }
  
  // Send emergency alert to family contacts
  static async alertEmergencyContacts(
    contacts: EmergencyContact[],
    location: { lat: number; lng: number },
    emergencyType: string,
    userProfile?: { name?: string; medicalInfo?: MedicalInfo }
  ): Promise<{ success: string[]; failed: string[] }> {
    
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };
    const highPriorityContacts = this.getHighPriorityContacts(contacts, 5);
    
    const emergencyMessage = this.createEmergencyMessage(
      userProfile?.name || 'Emergency Contact',
      location,
      emergencyType,
      userProfile?.medicalInfo
    );
    
    for (const contact of highPriorityContacts) {
      try {
        // Send SMS if enabled
        if (contact.canReceiveSMS) {
          await this.sendEmergencySMS(contact.phone, emergencyMessage);
          results.success.push(`SMS to ${contact.name}`);
        }
        
        // Initiate call if enabled and high priority
        if (contact.canReceiveCall && contact.priority <= 2) {
          await this.initiateEmergencyCall(contact.phone, contact.name);
          results.success.push(`Call to ${contact.name}`);
        }
        
      } catch (error) {
        console.error(`Failed to alert ${contact.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push(`${contact.name}: ${errorMessage}`);
      }
    }
    
    return results;
  }
  
  // Create emergency message text
  private static createEmergencyMessage(
    userName: string,
    location: { lat: number; lng: number },
    emergencyType: string,
    medicalInfo?: MedicalInfo
  ): string {
    const sanitizedUserName = InputSanitizer.sanitizeText(userName);
    const sanitizedEmergencyType = InputSanitizer.sanitizeEmergencyType(emergencyType);
    
    let message = `🚨 EMERGENCY ALERT 🚨\n`;
    message += `${sanitizedUserName} needs immediate help!\n`;
    message += `Type: ${sanitizedEmergencyType}\n`;
    message += `Location: https://maps.google.com/maps?q=${location.lat},${location.lng}\n`;
    message += `Time: ${new Date().toLocaleString()}\n`;
    
    if (medicalInfo) {
      const medicalSummary = this.formatMedicalInfoForResponders(medicalInfo);
      if (medicalSummary) {
        message += `Medical Info: ${medicalSummary}\n`;
      }
    }
    
    message += `Emergency services have been notified. Please respond immediately.`;
    
    return message;
  }
  
  // Send emergency SMS
  private static async sendEmergencySMS(phone: string, message: string): Promise<void> {
    const sanitizedPhone = InputSanitizer.sanitizePhoneNumber(phone);
    const sanitizedMessage = InputSanitizer.sanitizeText(message);
    
    await fetch('/api/emergency-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: sanitizedPhone,
        message: sanitizedMessage,
        priority: 'emergency',
        timestamp: new Date().toISOString()
      })
    });
  }
  
  // Initiate emergency call
  private static async initiateEmergencyCall(phone: string, contactName: string): Promise<void> {
    const sanitizedPhone = InputSanitizer.sanitizePhoneNumber(phone);
    const sanitizedName = InputSanitizer.sanitizeText(contactName);
    
    await fetch('/api/emergency-call-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: sanitizedPhone,
        contactName: sanitizedName,
        timestamp: new Date().toISOString()
      })
    });
  }
  
  // Quick access medical information for first responders
  static getMedicalSummaryForFirstResponders(medicalInfo: MedicalInfo): {
    critical: string[];
    important: string[];
    contacts: string[];
  } {
    const critical = [];
    const important = [];
    const contacts = [];
    
    // Critical information (life-threatening)
    if (medicalInfo.allergies && medicalInfo.allergies.length > 0) {
      critical.push(`🚫 ALLERGIES: ${medicalInfo.allergies.join(', ')}`);
    }
    
    if (medicalInfo.bloodType) {
      critical.push(`🩸 BLOOD TYPE: ${medicalInfo.bloodType}`);
    }
    
    if (medicalInfo.medicalDirectives?.dnaResuscitate === false) {
      critical.push(`⛔ DNR: Do Not Resuscitate`);
    }
    
    // Important information
    if (medicalInfo.conditions && medicalInfo.conditions.length > 0) {
      important.push(`📋 CONDITIONS: ${medicalInfo.conditions.join(', ')}`);
    }
    
    if (medicalInfo.medications && medicalInfo.medications.length > 0) {
      important.push(`💊 MEDICATIONS: ${medicalInfo.medications.join(', ')}`);
    }
    
    // Emergency contacts
    if (medicalInfo.physicianName && medicalInfo.physicianPhone) {
      contacts.push(`👨‍⚕️ PHYSICIAN: ${medicalInfo.physicianName} (${medicalInfo.physicianPhone})`);
    }
    
    if (medicalInfo.emergencyContact) {
      contacts.push(`👥 EMERGENCY CONTACT: ${medicalInfo.emergencyContact.name} (${medicalInfo.emergencyContact.phone})`);
    }
    
    return { critical, important, contacts };
  }
}

export default EmergencyContactsSystem;
