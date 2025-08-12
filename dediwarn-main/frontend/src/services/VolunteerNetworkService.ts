/**
 * Volunteer Network Service
 * Real-time volunteer coordination and community management
 */

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: { lat: number; lng: number; address: string };
  skills: Skill[];
  availability: {
    status: 'available' | 'busy' | 'on-mission' | 'offline';
    schedule: WeeklySchedule;
    emergencyOnly: boolean;
  };
  experience: {
    level: 'beginner' | 'intermediate' | 'expert';
    totalHours: number;
    completedMissions: number;
    specializations: string[];
  };
  certifications: Certification[];
  resources: Resource[];
  preferences: {
    maxDistance: number; // km
    communicationMethod: 'phone' | 'sms' | 'email' | 'app';
    languages: string[];
    workingWithChildren: boolean;
    physicalCapabilities: string[];
  };
  rating: number; // 0-5 stars
  joinedDate: Date;
  lastActive: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: 'medical' | 'rescue' | 'logistics' | 'communication' | 'technical' | 'support';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  verifiedBy?: string;
  certificationRequired: boolean;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;
  recurring: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  verified: boolean;
  level: 'basic' | 'intermediate' | 'advanced';
  skills: string[];
}

export interface Resource {
  id: string;
  name: string;
  type: 'vehicle' | 'equipment' | 'supplies' | 'shelter' | 'communication';
  description: string;
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  availability: 'available' | 'in-use' | 'maintenance';
  location: { lat: number; lng: number };
  specifications?: Record<string, string | number | boolean>;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'emergency' | 'training' | 'community-service' | 'preparation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  location: { lat: number; lng: number; address: string };
  requiredSkills: Skill[];
  requiredResources: Resource[];
  volunteersNeeded: number;
  assignedVolunteers: string[]; // volunteer IDs
  createdBy: string;
  createdAt: Date;
  startTime: Date;
  estimatedDuration: number; // hours
  actualDuration?: number;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  safetyRating: number; // 0-10
  completionReward: {
    points: number;
    badges?: string[];
    certificates?: string[];
  };
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: 'basic-safety' | 'first-aid' | 'search-rescue' | 'disaster-response' | 'leadership';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // hours
  format: 'online' | 'in-person' | 'hybrid';
  schedule: {
    startDate: Date;
    endDate: Date;
    sessions: TrainingSession[];
  };
  prerequisites: string[];
  maxParticipants: number;
  currentParticipants: string[]; // volunteer IDs
  instructor: string;
  location?: { lat: number; lng: number; address: string };
  materials: string[];
  certification?: string;
  cost: number;
  rating: number;
  reviews: TrainingReview[];
}

export interface TrainingSession {
  id: string;
  title: string;
  date: Date;
  duration: number; // minutes
  location: string;
  topics: string[];
  materials: string[];
  attendance: string[]; // volunteer IDs who attended
}

export interface TrainingReview {
  volunteerId: string;
  rating: number; // 0-5
  comment: string;
  date: Date;
  helpful: boolean;
}

export interface VolunteerMatch {
  volunteer: Volunteer;
  mission: Mission;
  matchScore: number; // 0-100
  matchFactors: {
    skillMatch: number;
    locationProximity: number;
    availability: number;
    experience: number;
    preference: number;
  };
  estimatedTravelTime: number; // minutes
  recommended: boolean;
}

export interface RecognitionAward {
  id: string;
  volunteerId: string;
  type: 'badge' | 'certificate' | 'achievement' | 'milestone';
  name: string;
  description: string;
  criteria: string;
  earnedDate: Date;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  category: string;
  icon: string;
}

class VolunteerNetworkService {
  private static instance: VolunteerNetworkService;
  private volunteers: Map<string, Volunteer> = new Map();
  private missions: Map<string, Mission> = new Map();
  private trainingPrograms: Map<string, TrainingProgram> = new Map();
  private recognitionSystem: Map<string, RecognitionAward[]> = new Map();
  // Removed unused realTimeUpdates property
  private eventListeners: Map<string, ((data: unknown) => void)[]> = new Map();

  private constructor() {
    this.initializeVolunteerNetwork();
    this.startRealTimeUpdates();
  }

  static getInstance(): VolunteerNetworkService {
    if (!VolunteerNetworkService.instance) {
      VolunteerNetworkService.instance = new VolunteerNetworkService();
    }
    return VolunteerNetworkService.instance;
  }

  /**
   * Initialize volunteer network with sample data
   */
  private initializeVolunteerNetwork(): void {
    // Initialize with sample volunteers, missions, and training programs
    this.createSampleData();
  }

  /**
   * Real-time volunteer coordination
   */
  async coordinateVolunteers(missionId: string): Promise<VolunteerMatch[]> {
    const mission = this.missions.get(missionId);
    if (!mission) throw new Error('Mission not found');

    const availableVolunteers = Array.from(this.volunteers.values())
      .filter(v => v.availability.status === 'available');

    const matches: VolunteerMatch[] = [];

    for (const volunteer of availableVolunteers) {
      const matchScore = await this.calculateMatchScore(volunteer, mission);
      
      if (matchScore > 30) { // Minimum threshold
        matches.push({
          volunteer,
          mission,
          matchScore,
          matchFactors: await this.calculateMatchFactors(volunteer, mission),
          estimatedTravelTime: await this.calculateTravelTime(volunteer.location, mission.location),
          recommended: matchScore > 70
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Emit real-time update
    this.emitUpdate('volunteer-coordination', { missionId, matches });

    return matches.slice(0, mission.volunteersNeeded * 2); // Return twice the needed volunteers
  }

  /**
   * Skill-based matching algorithm
   */
  private async calculateMatchScore(volunteer: Volunteer, mission: Mission): Promise<number> {
    let totalScore = 0;
    let maxScore = 0;

    // Skill matching (40% weight)
    const skillMatch = this.calculateSkillMatch(volunteer.skills, mission.requiredSkills);
    totalScore += skillMatch * 0.4;
    maxScore += 40;

    // Location proximity (25% weight)
    const distance = this.calculateDistance(volunteer.location, mission.location);
    const proximityScore = Math.max(0, 100 - (distance / volunteer.preferences.maxDistance) * 100);
    totalScore += proximityScore * 0.25;
    maxScore += 25;

    // Experience level (20% weight)
    const experienceScore = this.calculateExperienceScore(volunteer);
    totalScore += experienceScore * 0.2;
    maxScore += 20;

    // Availability (10% weight)
    const availabilityScore = this.calculateAvailabilityScore(volunteer, mission);
    totalScore += availabilityScore * 0.1;
    maxScore += 10;

    // Resource availability (5% weight)
    const resourceScore = this.calculateResourceScore(volunteer, mission);
    totalScore += resourceScore * 0.05;
    maxScore += 5;

    return (totalScore / maxScore) * 100;
  }

  private calculateSkillMatch(volunteerSkills: Skill[], requiredSkills: Skill[]): number {
    if (requiredSkills.length === 0) return 100;

    let matchedSkills = 0;
    let totalWeight = 0;

    for (const requiredSkill of requiredSkills) {
      const matchingSkill = volunteerSkills.find(vs => 
        vs.name === requiredSkill.name && vs.category === requiredSkill.category
      );

      if (matchingSkill) {
        // Weight based on skill level match
        const levelScore = this.getSkillLevelScore(matchingSkill.level, requiredSkill.level);
        matchedSkills += levelScore;
      }
      totalWeight += 100;
    }

    return totalWeight > 0 ? (matchedSkills / totalWeight) * 100 : 0;
  }

  private getSkillLevelScore(volunteerLevel: string, requiredLevel: string): number {
    const levels = { 'basic': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const volunteerLevelNum = levels[volunteerLevel as keyof typeof levels] || 0;
    const requiredLevelNum = levels[requiredLevel as keyof typeof levels] || 0;

    if (volunteerLevelNum >= requiredLevelNum) {
      return 100; // Perfect match or overqualified
    } else if (volunteerLevelNum === requiredLevelNum - 1) {
      return 70; // Close match
    } else {
      return 30; // Basic skill present but underqualified
    }
  }

  private calculateExperienceScore(volunteer: Volunteer): number {
    const { experience } = volunteer;
    let score = 0;

    // Total hours factor
    score += Math.min((experience.totalHours / 100) * 30, 30);

    // Completed missions factor
    score += Math.min((experience.completedMissions / 20) * 30, 30);

    // Level factor
    const levelScores = { 'beginner': 20, 'intermediate': 60, 'expert': 100 };
    score += levelScores[experience.level] * 0.4;

    return Math.min(score, 100);
  }

  
  private calculateAvailabilityScore(volunteer: Volunteer, mission: Mission): number {
    if (volunteer.availability.status !== 'available') return 0;
    
    // Check schedule compatibility
    const missionDay = mission.startTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = volunteer.availability.schedule[missionDay as keyof WeeklySchedule];
    
    if (!daySchedule || daySchedule.length === 0) return 50; // Assume available if no schedule set

    const missionHour = mission.startTime.getHours();
    const missionMinute = mission.startTime.getMinutes();
    const missionTime = missionHour * 60 + missionMinute;

    for (const slot of daySchedule) {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      const slotStart = startHour * 60 + startMin;
      const slotEnd = endHour * 60 + endMin;

      if (missionTime >= slotStart && missionTime <= slotEnd - mission.estimatedDuration * 60) {
        return 100;
      }
    }

    return volunteer.availability.emergencyOnly && mission.priority === 'critical' ? 80 : 20;
  }

  private calculateResourceScore(volunteer: Volunteer, mission: Mission): number {
    if (mission.requiredResources.length === 0) return 100;

    let availableResources = 0;
    for (const requiredResource of mission.requiredResources) {
      const hasResource = volunteer.resources.some(vr => 
        vr.type === requiredResource.type && vr.availability === 'available'
      );
      if (hasResource) availableResources++;
    }

    return (availableResources / mission.requiredResources.length) * 100;
  }

  private async calculateMatchFactors(volunteer: Volunteer, mission: Mission) {
    return {
      skillMatch: this.calculateSkillMatch(volunteer.skills, mission.requiredSkills),
      locationProximity: Math.max(0, 100 - (this.calculateDistance(volunteer.location, mission.location) / volunteer.preferences.maxDistance) * 100),
      availability: this.calculateAvailabilityScore(volunteer, mission),
      experience: this.calculateExperienceScore(volunteer),
      preference: this.calculateResourceScore(volunteer, mission)
    };
  }

  /**
   * Resource sharing system
   */
  async shareResource(volunteerId: string, resourceId: string, recipientId: string, duration: number): Promise<boolean> {
    const volunteer = this.volunteers.get(volunteerId);
    const recipient = this.volunteers.get(recipientId);
    
    if (!volunteer || !recipient) return false;

    const resource = volunteer.resources.find(r => r.id === resourceId);
    if (!resource || resource.availability !== 'available') return false;

    // Update resource status
    resource.availability = 'in-use';
    
    // Create sharing record
    const sharingRecord = {
      id: `sharing-${Date.now()}`,
      resource: resourceId,
      owner: volunteerId,
      recipient: recipientId,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 60 * 60 * 1000),
      status: 'active'
    };

    // Emit real-time update
    this.emitUpdate('resource-shared', sharingRecord);

    // Award points for sharing
    await this.awardPoints(volunteerId, 10, 'resource-sharing');

    return true;
  }

  /**
   * Training program management
   */
  async createTrainingProgram(program: Omit<TrainingProgram, 'id' | 'currentParticipants' | 'rating' | 'reviews'>): Promise<string> {
    const id = `training-${Date.now()}`;
    const trainingProgram: TrainingProgram = {
      ...program,
      id,
      currentParticipants: [],
      rating: 0,
      reviews: []
    };

    this.trainingPrograms.set(id, trainingProgram);
    this.emitUpdate('training-program-created', trainingProgram);

    return id;
  }

  async enrollInTraining(volunteerId: string, programId: string): Promise<boolean> {
    const volunteer = this.volunteers.get(volunteerId);
    const program = this.trainingPrograms.get(programId);

    if (!volunteer || !program) return false;
    if (program.currentParticipants.length >= program.maxParticipants) return false;

    // Check prerequisites
    if (program.prerequisites.length > 0) {
      const hasPrerequisites = program.prerequisites.every(prereq =>
        volunteer.certifications.some(cert => cert.name === prereq && cert.verified)
      );
      if (!hasPrerequisites) return false;
    }

    program.currentParticipants.push(volunteerId);
    this.emitUpdate('volunteer-enrolled', { volunteerId, programId });

    return true;
  }

  async completeTrainingProgram(volunteerId: string, programId: string, score: number): Promise<void> {
    const volunteer = this.volunteers.get(volunteerId);
    const program = this.trainingPrograms.get(programId);

    if (!volunteer || !program) return;

    // Award certification if applicable
    if (program.certification && score >= 80) {
      const cert: Certification = {
        id: `cert-${Date.now()}`,
        name: program.certification,
        issuer: 'Emergency Response Training',
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        verified: true,
        level: program.level as 'basic' | 'intermediate' | 'advanced',
        skills: program.category.split('-')
      };

      volunteer.certifications.push(cert);
    }

    // Award points and recognition
    const points = Math.floor(program.duration * score / 10);
    await this.awardPoints(volunteerId, points, 'training-completion');

    // Check for training-related achievements
    await this.checkTrainingAchievements(volunteerId);

    this.emitUpdate('training-completed', { volunteerId, programId, score });
  }

  /**
   * Volunteer recognition system
   */
  async awardPoints(volunteerId: string, points: number, reason: string): Promise<void> {
    const volunteer = this.volunteers.get(volunteerId);
    if (!volunteer) return;

    // Award points logic would go here
    this.emitUpdate('points-awarded', { volunteerId, points, reason });

    // Check for new achievements
    await this.checkAchievements(volunteerId);
  }

  async checkAchievements(volunteerId: string): Promise<RecognitionAward[]> {
    const volunteer = this.volunteers.get(volunteerId);
    if (!volunteer) return [];

    const newAwards: RecognitionAward[] = [];
    const existingAwards = this.recognitionSystem.get(volunteerId) || [];

    // Mission completion achievements
    if (volunteer.experience.completedMissions === 1 && !existingAwards.some(a => a.name === 'First Mission')) {
      newAwards.push({
        id: `award-${Date.now()}`,
        volunteerId,
        type: 'badge',
        name: 'First Mission',
        description: 'Completed your first volunteer mission',
        criteria: 'Complete 1 mission',
        earnedDate: new Date(),
        points: 50,
        rarity: 'common',
        category: 'missions',
        icon: '🎯'
      });
    }

    if (volunteer.experience.completedMissions === 10 && !existingAwards.some(a => a.name === 'Dedicated Volunteer')) {
      newAwards.push({
        id: `award-${Date.now()}-2`,
        volunteerId,
        type: 'certificate',
        name: 'Dedicated Volunteer',
        description: 'Completed 10 volunteer missions',
        criteria: 'Complete 10 missions',
        earnedDate: new Date(),
        points: 200,
        rarity: 'uncommon',
        category: 'missions',
        icon: '🏆'
      });
    }

    // Hours-based achievements
    if (volunteer.experience.totalHours >= 50 && !existingAwards.some(a => a.name === 'Time Contributor')) {
      newAwards.push({
        id: `award-${Date.now()}-3`,
        volunteerId,
        type: 'milestone',
        name: 'Time Contributor',
        description: 'Contributed 50+ hours of volunteer service',
        criteria: 'Volunteer for 50+ hours',
        earnedDate: new Date(),
        points: 300,
        rarity: 'rare',
        category: 'time',
        icon: '⏰'
      });
    }

    // Add new awards to recognition system
    if (newAwards.length > 0) {
      const allAwards = [...existingAwards, ...newAwards];
      this.recognitionSystem.set(volunteerId, allAwards);
      this.emitUpdate('awards-earned', { volunteerId, newAwards });
    }

    return newAwards;
  }

  private async checkTrainingAchievements(volunteerId: string): Promise<void> {
    const volunteer = this.volunteers.get(volunteerId);
    if (!volunteer) return;

    const completedTrainings = volunteer.certifications.length;
    const existingAwards = this.recognitionSystem.get(volunteerId) || [];

    if (completedTrainings >= 3 && !existingAwards.some(a => a.name === 'Skilled Responder')) {
      const award: RecognitionAward = {
        id: `award-${Date.now()}`,
        volunteerId,
        type: 'badge',
        name: 'Skilled Responder',
        description: 'Completed 3 or more training certifications',
        criteria: 'Complete 3+ training programs',
        earnedDate: new Date(),
        points: 150,
        rarity: 'uncommon',
        category: 'training',
        icon: '📚'
      };

      const allAwards = [...existingAwards, award];
      this.recognitionSystem.set(volunteerId, allAwards);
      this.emitUpdate('awards-earned', { volunteerId, newAwards: [award] });
    }
  }

  /**
   * Real-time updates system
   */
  private startRealTimeUpdates(): void {
    setInterval(() => {
      this.updateVolunteerStatuses();
      this.updateMissionStatuses();
    }, 30000); // Update every 30 seconds
  }

  private updateVolunteerStatuses(): void {
    // Simulate real-time status updates
    this.volunteers.forEach((volunteer, id) => {
      if (Math.random() < 0.1) { // 10% chance of status change
        const statuses: Array<'available' | 'busy' | 'on-mission' | 'offline'> = ['available', 'busy', 'on-mission', 'offline'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        volunteer.availability.status = newStatus;
        volunteer.lastActive = new Date();
        
        this.emitUpdate('volunteer-status-changed', { volunteerId: id, status: newStatus });
      }
    });
  }

  private updateMissionStatuses(): void {
    this.missions.forEach((mission, id) => {
      if (mission.status === 'in-progress' && Math.random() < 0.05) { // 5% chance of completion
        mission.status = 'completed';
        mission.actualDuration = mission.estimatedDuration + (Math.random() - 0.5) * 2; // ±2 hours variation
        
        // Award points to volunteers
        mission.assignedVolunteers.forEach(volunteerId => {
          const points = 20 + (mission.priority === 'critical' ? 30 : mission.priority === 'high' ? 20 : 10);
          this.awardPoints(volunteerId, points, 'mission-completion');
        });

        this.emitUpdate('mission-completed', { missionId: id, mission });
      }
    });
  }

  private emitUpdate(eventType: string, data: unknown): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  addEventListener(eventType: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (data: unknown) => void): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Utility methods
  private calculateDistance(location1: { lat: number; lng: number }, location2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = (location2.lat - location1.lat) * Math.PI / 180;
    const dLon = (location2.lng - location1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(location1.lat * Math.PI / 180) * Math.cos(location2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async calculateTravelTime(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<number> {
    const distance = this.calculateDistance(from, to);
    return Math.round(distance / 0.5); // Assume 30 km/h average speed in emergency conditions
  }

  /**
   * Create sample data for demonstration
   */
  private createSampleData(): void {
    // Sample volunteers
    const sampleVolunteers: Volunteer[] = [
      {
        id: 'vol-001',
        name: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@email.com',
        phone: '+1-555-0101',
        location: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
        skills: [
          { id: 'skill-medical-1', name: 'Emergency Medicine', category: 'medical', level: 'expert', verified: true, certificationRequired: true },
          { id: 'skill-medical-2', name: 'Trauma Care', category: 'medical', level: 'advanced', verified: true, certificationRequired: true }
        ],
        availability: {
          status: 'available',
          schedule: {
            monday: [{ start: '09:00', end: '17:00', recurring: true }],
            tuesday: [{ start: '09:00', end: '17:00', recurring: true }],
            wednesday: [{ start: '09:00', end: '17:00', recurring: true }],
            thursday: [{ start: '09:00', end: '17:00', recurring: true }],
            friday: [{ start: '09:00', end: '17:00', recurring: true }],
            saturday: [{ start: '10:00', end: '14:00', recurring: true }],
            sunday: []
          },
          emergencyOnly: false
        },
        experience: {
          level: 'expert',
          totalHours: 245,
          completedMissions: 18,
          specializations: ['Emergency Medicine', 'Disaster Medicine', 'Mass Casualty Events']
        },
        certifications: [
          {
            id: 'cert-001',
            name: 'Emergency Medicine Certification',
            issuer: 'American Board of Emergency Medicine',
            issueDate: new Date('2020-01-15'),
            expiryDate: new Date('2025-01-15'),
            verified: true,
            level: 'advanced',
            skills: ['Emergency Medicine', 'Trauma Care']
          }
        ],
        resources: [
          {
            id: 'res-001',
            name: 'Emergency Medical Kit',
            type: 'equipment',
            description: 'Comprehensive emergency medical supplies',
            quantity: 1,
            condition: 'excellent',
            availability: 'available',
            location: { lat: 37.7749, lng: -122.4194 }
          }
        ],
        preferences: {
          maxDistance: 50,
          communicationMethod: 'phone',
          languages: ['English', 'Spanish'],
          workingWithChildren: true,
          physicalCapabilities: ['Heavy lifting', 'Extended walking', 'Climbing']
        },
        rating: 4.9,
        joinedDate: new Date('2022-03-01'),
        lastActive: new Date()
      }
    ];

    sampleVolunteers.forEach(volunteer => {
      this.volunteers.set(volunteer.id, volunteer);
    });

    // Sample missions
    const sampleMissions: Mission[] = [
      {
        id: 'mission-001',
        title: 'Medical Response Team - Earthquake Aftermath',
        description: 'Provide emergency medical care for earthquake victims in downtown area',
        type: 'emergency',
        priority: 'critical',
        status: 'open',
        location: { lat: 37.7849, lng: -122.4094, address: 'Downtown San Francisco, CA' },
        requiredSkills: [
          { id: 'skill-medical-1', name: 'Emergency Medicine', category: 'medical', level: 'intermediate', verified: true, certificationRequired: true }
        ],
        requiredResources: [],
        volunteersNeeded: 3,
        assignedVolunteers: [],
        createdBy: 'emergency-coordinator-1',
        createdAt: new Date(),
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        estimatedDuration: 8,
        difficulty: 'challenging',
        safetyRating: 6,
        completionReward: {
          points: 100,
          badges: ['Emergency Responder'],
          certificates: ['Emergency Response Certificate']
        }
      }
    ];

    sampleMissions.forEach(mission => {
      this.missions.set(mission.id, mission);
    });

    // Sample training programs
    const sampleTraining: TrainingProgram[] = [
      {
        id: 'training-001',
        title: 'Basic Emergency Response',
        description: 'Fundamental skills for emergency response volunteers',
        category: 'basic-safety',
        level: 'beginner',
        duration: 16,
        format: 'hybrid',
        schedule: {
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          sessions: [
            {
              id: 'session-001',
              title: 'Emergency Response Basics',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              duration: 240,
              location: 'Community Center',
              topics: ['Emergency Assessment', 'Communication Protocols', 'Safety Procedures'],
              materials: ['Emergency Response Manual', 'Safety Checklist'],
              attendance: []
            }
          ]
        },
        prerequisites: [],
        maxParticipants: 20,
        currentParticipants: [],
        instructor: 'Chief Johnson',
        location: { lat: 37.7649, lng: -122.4294, address: 'Community Training Center' },
        materials: ['Training Manual', 'Safety Equipment', 'Assessment Forms'],
        certification: 'Basic Emergency Response Certificate',
        cost: 0,
        rating: 4.7,
        reviews: []
      }
    ];

    sampleTraining.forEach(training => {
      this.trainingPrograms.set(training.id, training);
    });
  }

  // Public API methods
  getVolunteer(id: string): Volunteer | undefined {
    return this.volunteers.get(id);
  }

  getAllVolunteers(): Volunteer[] {
    return Array.from(this.volunteers.values());
  }

  getMission(id: string): Mission | undefined {
    return this.missions.get(id);
  }

  getAllMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  getTrainingProgram(id: string): TrainingProgram | undefined {
    return this.trainingPrograms.get(id);
  }

  getAllTrainingPrograms(): TrainingProgram[] {
    return Array.from(this.trainingPrograms.values());
  }

  getVolunteerRecognition(volunteerId: string): RecognitionAward[] {
    return this.recognitionSystem.get(volunteerId) || [];
  }
}

export default VolunteerNetworkService;
