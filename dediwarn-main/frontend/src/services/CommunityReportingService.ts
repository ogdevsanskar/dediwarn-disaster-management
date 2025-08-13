/**
 * Community Reporting Service
 * Crowdsourced incident reporting with photo/video evidence and community verification
 */

import { ReactNode } from "react";

// Event handler types
type EventHandler<T = unknown> = (data: T) => void;

export interface IncidentReport {
  status(status: string): ReactNode;
  id: string;
  reporterId: string;
  reporterName: string;
  reporterReputation: number;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    address?: string;
    accuracy: number; // GPS accuracy in meters
  };
  incidentType: 'fire' | 'flood' | 'earthquake' | 'accident' | 'hazard' | 'infrastructure' | 'medical' | 'security' | 'weather' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  tags: string[];
  evidence: MediaEvidence[];
  verificationStatus: 'pending' | 'verified' | 'disputed' | 'false' | 'needs_more_info';
  verifications: CommunityVerification[];
  updates: IncidentUpdate[];
  priority: number; // 0-100, calculated based on severity, verifications, etc.
  isActive: boolean;
  resolvedAt?: Date;
  officialResponse?: OfficialResponse;
  visibility: 'public' | 'authorities_only' | 'verified_users';
  relatedReports: string[]; // IDs of related incident reports
  impactArea: {
    radius: number; // estimated impact radius in meters
    affectedPopulation?: number;
  };
}

export interface MediaEvidence {
  id: string;
  type: 'photo' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  fileSize: number;
  uploadedAt: Date;
  metadata: {
    dimensions?: { width: number; height: number };
    duration?: number; // for video/audio
    gpsLocation?: { lat: number; lng: number };
    timestamp?: Date; // from EXIF data
    deviceInfo?: string;
  };
  processingStatus: 'uploading' | 'processing' | 'ready' | 'failed';
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  verificationScore: number; // 0-100, based on metadata analysis
}

export interface CommunityVerification {
  id: string;
  verifierId: string;
  verifierName: string;
  verifierReputation: number;
  timestamp: Date;
  status: 'confirmed' | 'disputed' | 'needs_clarification' | 'false_report';
  confidence: number; // 0-100
  evidence?: string; // Additional evidence provided by verifier
  location?: { lat: number; lng: number }; // Verifier's location at time of verification
  comments: string;
  helpful: number; // Number of users who found this verification helpful
  flags: number; // Number of flags for inappropriate content
}

export interface IncidentUpdate {
  id: string;
  reporterId: string;
  reporterName: string;
  timestamp: Date;
  updateType: 'status_change' | 'new_evidence' | 'situation_update' | 'resolution';
  content: string;
  evidence?: MediaEvidence[];
  location?: { lat: number; lng: number };
  verifications: CommunityVerification[];
}

export interface OfficialResponse {
  id: string;
  respondingAgency: string;
  officerName: string;
  officerId: string;
  timestamp: Date;
  status: 'acknowledged' | 'investigating' | 'responding' | 'resolved' | 'false_alarm';
  response: string;
  estimatedResponseTime?: number; // minutes
  resourcesDeployed?: string[];
  publicUpdate?: string;
}

export interface ReporterProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  reputation: number; // 0-1000
  level: 'new' | 'trusted' | 'expert' | 'authority';
  badges: ReputationBadge[];
  reportingHistory: {
    totalReports: number;
    verifiedReports: number;
    falseReports: number;
    averageAccuracy: number;
    specializations: string[]; // Types of incidents they're good at reporting
  };
  location?: { lat: number; lng: number };
  preferences: {
    notifications: boolean;
    anonymousReporting: boolean;
    shareLocation: boolean;
  };
  joinedAt: Date;
  lastActive: Date;
}

export interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'accuracy' | 'frequency' | 'expertise' | 'community' | 'special';
}

export interface ReportingAnalytics {
  rejectedReports: ReactNode;
  pendingReports: ReactNode;
  timeframe: 'hour' | 'day' | 'week' | 'month';
  totalReports: number;
  verifiedReports: number;
  falseReports: number;
  averageVerificationTime: number; // minutes
  topIncidentTypes: Array<{ type: string; count: number }>;
  topReporters: Array<{ name: string; reputation: number; reportCount: number }>;
  geographicHotspots: Array<{
    location: { lat: number; lng: number };
    incidentCount: number;
    severity: number;
  }>;
  responseMetrics: {
    averageOfficialResponseTime: number;
    responseRate: number;
  };
}

class CommunityReportingService {
  private static instance: CommunityReportingService;
  private reports: Map<string, IncidentReport> = new Map();
  private reporters: Map<string, ReporterProfile> = new Map();
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private uploadQueue: Map<string, MediaEvidence> = new Map();
  private verificationQueue: string[] = [];

  // Real-time event system
  private ws: WebSocket | null = null;

  private constructor() {
    this.initializeWebSocket();
    this.startPeriodicUpdates();
    this.loadCachedData();
  }

  static getInstance(): CommunityReportingService {
    if (!CommunityReportingService.instance) {
      CommunityReportingService.instance = new CommunityReportingService();
    }
    return CommunityReportingService.instance;
  }

  /**
   * Submit a new incident report
   */
  async submitReport(
    reportData: Omit<IncidentReport, 'id' | 'timestamp' | 'verifications' | 'updates' | 'priority' | 'verificationStatus'>,
    evidence?: File[]
  ): Promise<string> {
    const reportId = this.generateId();
    
    try {
      // Upload evidence files if provided
      const mediaEvidence: MediaEvidence[] = [];
      if (evidence && evidence.length > 0) {
        for (const file of evidence) {
          const evidenceId = await this.uploadEvidence(file, reportId);
          const mediaItem = this.uploadQueue.get(evidenceId);
          if (mediaItem) {
            mediaEvidence.push(mediaItem);
          }
        }
      }

      // Create incident report
      const report: IncidentReport = {
        ...reportData,
        id: reportId,
        timestamp: new Date(),
        evidence: mediaEvidence,
        verifications: [],
        updates: [],
        verificationStatus: 'pending',
        priority: this.calculateInitialPriority(reportData),
        isActive: true,
        relatedReports: [],
        impactArea: {
          radius: this.estimateImpactRadius(reportData.incidentType, reportData.severity)
        }
      };

      // Store report
      this.reports.set(reportId, report);

      // Update reporter's profile
      await this.updateReporterProfile(reportData.reporterId, 'new_report');

      // Send real-time notification
      this.broadcastEvent('new_report', report);

      // Auto-detect similar reports
      await this.findRelatedReports(report);

      // Trigger community verification process
      this.addToVerificationQueue(reportId);

      // Cache data
      this.cacheData();

      return reportId;
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  }

  /**
   * Upload evidence files (photos, videos, audio)
   */
  async uploadEvidence(file: File, reportId: string): Promise<string> {
    const evidenceId = this.generateId();
    
    // Validate file
    if (!this.validateFile(file)) {
      throw new Error('Invalid file type or size');
    }

    try {
      // Create media evidence object
      const mediaEvidence: MediaEvidence = {
        id: evidenceId,
        type: this.getFileType(file),
        url: '', // Will be set after upload
        filename: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        processingStatus: 'uploading',
        moderationStatus: 'pending',
        verificationScore: 0,
        metadata: await this.extractFileMetadata(file)
      };

      // Add to upload queue
      this.uploadQueue.set(evidenceId, mediaEvidence);

      // Simulate file upload (replace with actual cloud storage upload)
      mediaEvidence.processingStatus = 'processing';
      
      // Create object URL for immediate display
      const objectUrl = URL.createObjectURL(file);
      mediaEvidence.url = objectUrl;
      
      if (file.type.startsWith('image/')) {
        mediaEvidence.thumbnailUrl = await this.generateThumbnail(file);
      }

      // Simulate processing completion
      setTimeout(() => {
        mediaEvidence.processingStatus = 'ready';
        mediaEvidence.verificationScore = this.analyzeFileVerification(mediaEvidence);
        this.broadcastEvent('evidence_processed', { reportId, evidenceId, mediaEvidence });
      }, 2000);

      return evidenceId;
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw error;
    }
  }

  /**
   * Submit community verification
   */
  async submitVerification(
    reportId: string,
    verification: Omit<CommunityVerification, 'id' | 'timestamp' | 'helpful' | 'flags'>
  ): Promise<string> {
    const verificationId = this.generateId();
    const report = this.reports.get(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    const communityVerification: CommunityVerification = {
      ...verification,
      id: verificationId,
      timestamp: new Date(),
      helpful: 0,
      flags: 0
    };

    // Add verification to report
    report.verifications.push(communityVerification);

    // Update verification status based on community consensus
    await this.updateVerificationStatus(report);

    // Update verifier's reputation
    await this.updateReporterProfile(verification.verifierId, 'verification');

    // Broadcast update
    this.broadcastEvent('verification_added', { reportId, verification: communityVerification });

    // Cache data
    this.cacheData();

    return verificationId;
  }

  /**
   * Add real-time update to existing report
   */
  async addReportUpdate(
    reportId: string,
    update: Omit<IncidentUpdate, 'id' | 'timestamp' | 'verifications'>
  ): Promise<string> {
    const updateId = this.generateId();
    const report = this.reports.get(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    const incidentUpdate: IncidentUpdate = {
      ...update,
      id: updateId,
      timestamp: new Date(),
      verifications: []
    };

    // Add update to report
    report.updates.push(incidentUpdate);

    // Update report priority based on new information
    report.priority = this.recalculatePriority(report);

    // Broadcast real-time update
    this.broadcastEvent('report_updated', { reportId, update: incidentUpdate });

    // Notify subscribers
    this.notifySubscribers(reportId, incidentUpdate);

    return updateId;
  }

  /**
   * Get reports by location and filters
   */
  async getReports(filters: {
    location?: { lat: number; lng: number; radius: number };
    incidentTypes?: string[];
    severity?: string[];
    verificationStatus?: string[];
    timeframe?: { start: Date; end: Date };
    limit?: number;
    sortBy?: 'timestamp' | 'priority' | 'verifications';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<IncidentReport[]> {
    let reports = Array.from(this.reports.values());

    // Apply filters
    if (filters.location) {
      reports = reports.filter(report => {
        const distance = this.calculateDistance(
          filters.location!.lat,
          filters.location!.lng,
          report.location.lat,
          report.location.lng
        );
        return distance <= filters.location!.radius;
      });
    }

    if (filters.incidentTypes?.length) {
      reports = reports.filter(report => 
        filters.incidentTypes!.includes(report.incidentType)
      );
    }

    if (filters.severity?.length) {
      reports = reports.filter(report => 
        filters.severity!.includes(report.severity)
      );
    }

    if (filters.verificationStatus?.length) {
      reports = reports.filter(report => 
        filters.verificationStatus!.includes(report.verificationStatus)
      );
    }

    if (filters.timeframe) {
      reports = reports.filter(report => 
        report.timestamp >= filters.timeframe!.start &&
        report.timestamp <= filters.timeframe!.end
      );
    }

    // Sort reports
    const sortBy = filters.sortBy || 'timestamp';
    const sortOrder = filters.sortOrder || 'desc';
    
    reports.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'verifications':
          comparison = a.verifications.length - b.verifications.length;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply limit
    if (filters.limit) {
      reports = reports.slice(0, filters.limit);
    }

    return reports;
  }

  /**
   * Real-time event system
   */
  addEventListener(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  removeEventListener(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private broadcastEvent(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }

    // Send via WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  /**
   * Community verification analysis
   */
  private async updateVerificationStatus(report: IncidentReport): Promise<void> {
    if (report.verifications.length === 0) {
      report.verificationStatus = 'pending';
      return;
    }

    // Calculate verification scores
    const confirmedWeight = report.verifications
      .filter(v => v.status === 'confirmed')
      .reduce((sum, v) => sum + v.confidence * (v.verifierReputation / 1000), 0);

    const disputedWeight = report.verifications
      .filter(v => v.status === 'disputed' || v.status === 'false_report')
      .reduce((sum, v) => sum + v.confidence * (v.verifierReputation / 1000), 0);

    const totalWeight = confirmedWeight + disputedWeight;

    if (totalWeight === 0) {
      report.verificationStatus = 'needs_more_info';
      return;
    }

    const confirmationRatio = confirmedWeight / totalWeight;

    // Set verification status based on community consensus
    if (confirmationRatio >= 0.8 && confirmedWeight >= 2) {
      report.verificationStatus = 'verified';
    } else if (confirmationRatio <= 0.2 && disputedWeight >= 2) {
      report.verificationStatus = 'false';
    } else if (Math.abs(confirmationRatio - 0.5) < 0.2) {
      report.verificationStatus = 'disputed';
    } else {
      report.verificationStatus = 'needs_more_info';
    }

    // Update priority based on verification
    report.priority = this.recalculatePriority(report);
  }

  /**
   * File validation and processing
   */
  private validateFile(file: File): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/heic',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mp3', 'audio/wav', 'audio/m4a'
    ];

    return file.size <= maxSize && allowedTypes.includes(file.type);
  }

  private getFileType(file: File): 'photo' | 'video' | 'audio' {
    if (file.type.startsWith('image/')) return 'photo';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'photo'; // Default
  }

  private async extractFileMetadata(file: File): Promise<MediaEvidence['metadata']> {
    const metadata: MediaEvidence['metadata'] = {};

    if (file.type.startsWith('image/')) {
      // Extract image metadata (simplified)
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          metadata.dimensions = { width: img.width, height: img.height };
          URL.revokeObjectURL(img.src);
          resolve(metadata);
        };
        img.src = URL.createObjectURL(file);
      });
    } else if (file.type.startsWith('video/')) {
      // Extract video metadata (simplified)
      const video = document.createElement('video');
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          metadata.dimensions = { width: video.videoWidth, height: video.videoHeight };
          metadata.duration = video.duration;
          URL.revokeObjectURL(video.src);
          resolve(metadata);
        };
        video.src = URL.createObjectURL(file);
      });
    }

    return metadata;
  }

  private async generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      img.onload = () => {
        // Create thumbnail (200x200 max)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private analyzeFileVerification(evidence: MediaEvidence): number {
    let score = 50; // Base score

    // Check metadata consistency
    if (evidence.metadata.timestamp) {
      const timeDiff = Math.abs(evidence.uploadedAt.getTime() - evidence.metadata.timestamp.getTime());
      if (timeDiff < 3600000) { // Within 1 hour
        score += 20;
      }
    }

    // Check GPS data
    if (evidence.metadata.gpsLocation) {
      score += 15;
    }

    // Check file integrity
    if (evidence.metadata.dimensions && evidence.type === 'photo') {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Priority and ranking calculations
   */
  private calculateInitialPriority(reportData: Partial<IncidentReport>): number {
    let priority = 0;

    // Severity weight
    const severityWeights = { low: 10, medium: 30, high: 60, critical: 90 };
    priority += severityWeights[reportData.severity || 'low'];

    // Incident type weight
    const typeWeights = {
      fire: 80, flood: 70, earthquake: 85, accident: 40, hazard: 50,
      infrastructure: 30, medical: 60, security: 45, weather: 35, other: 20
    };
    priority += typeWeights[reportData.incidentType || 'other'];

    // Reporter reputation bonus
    if (reportData.reporterReputation && reportData.reporterReputation > 500) {
      priority += 10;
    }

    return Math.min(100, priority);
  }

  private recalculatePriority(report: IncidentReport): number {
    let priority = this.calculateInitialPriority(report);

    // Verification bonus/penalty
    if (report.verificationStatus === 'verified') {
      priority += 20;
    } else if (report.verificationStatus === 'false') {
      priority = 0;
    }

    // Community engagement bonus
    priority += Math.min(report.verifications.length * 2, 20);

    // Freshness decay
    const hoursOld = (Date.now() - report.timestamp.getTime()) / (1000 * 60 * 60);
    const decayFactor = Math.max(0.5, 1 - hoursOld / 24); // Decay over 24 hours
    priority *= decayFactor;

    return Math.min(100, Math.max(0, priority));
  }

  /**
   * Utility methods
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private estimateImpactRadius(incidentType: string, severity: string): number {
    const baseRadius = {
      fire: 500, flood: 2000, earthquake: 5000, accident: 100,
      hazard: 200, infrastructure: 1000, medical: 50, security: 200,
      weather: 1000, other: 100
    };

    const severityMultiplier = { low: 0.5, medium: 1, high: 2, critical: 4 };
    
    return (baseRadius[incidentType as keyof typeof baseRadius] || 100) * 
           (severityMultiplier[severity as keyof typeof severityMultiplier] || 1);
  }

  // WebSocket and real-time functionality
  private initializeWebSocket(): void {
    // Simulate WebSocket connection
    // In real implementation, connect to your WebSocket server
    console.log('Community Reporting WebSocket initialized');
  }

  private startPeriodicUpdates(): void {
    setInterval(() => {
      this.processVerificationQueue();
      this.updateReportPriorities();
      this.cleanupOldReports();
    }, 30000); // Every 30 seconds
  }

  private addToVerificationQueue(reportId: string): void {
    this.verificationQueue.push(reportId);
  }

  private processVerificationQueue(): void {
    // Process pending verifications
    this.verificationQueue.forEach(reportId => {
      const report = this.reports.get(reportId);
      if (report && report.verifications.length > 0) {
        this.updateVerificationStatus(report);
      }
    });
    this.verificationQueue = [];
  }

  private updateReportPriorities(): void {
    this.reports.forEach(report => {
      const newPriority = this.recalculatePriority(report);
      if (Math.abs(report.priority - newPriority) > 5) {
        report.priority = newPriority;
        this.broadcastEvent('priority_updated', { reportId: report.id, priority: newPriority });
      }
    });
  }

  private cleanupOldReports(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.reports.forEach((report, id) => {
      if (report.timestamp < oneWeekAgo && !report.isActive) {
        this.reports.delete(id);
      }
    });
  }

  // Additional helper methods
  private async findRelatedReports(report: IncidentReport): Promise<void> {
    const related: string[] = [];
    
    this.reports.forEach((existingReport, id) => {
      if (id === report.id) return;
      
      const distance = this.calculateDistance(
        report.location.lat, report.location.lng,
        existingReport.location.lat, existingReport.location.lng
      );
      
      const timeDiff = Math.abs(report.timestamp.getTime() - existingReport.timestamp.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (distance < 1 && hoursDiff < 4 && report.incidentType === existingReport.incidentType) {
        related.push(id);
      }
    });
    
    report.relatedReports = related;
  }

  private async updateReporterProfile(reporterId: string, action: 'new_report' | 'verification'): Promise<void> {
    let reporter = this.reporters.get(reporterId);
    
    if (!reporter) {
      reporter = {
        id: reporterId,
        username: `User${reporterId.slice(-6)}`,
        email: '',
        reputation: 100,
        level: 'new',
        badges: [],
        reportingHistory: {
          totalReports: 0,
          verifiedReports: 0,
          falseReports: 0,
          averageAccuracy: 0,
          specializations: []
        },
        preferences: {
          notifications: true,
          anonymousReporting: false,
          shareLocation: true
        },
        joinedAt: new Date(),
        lastActive: new Date()
      };
    }

    if (action === 'new_report') {
      reporter.reportingHistory.totalReports++;
    } else if (action === 'verification') {
      reporter.reputation += 5; // Small reputation boost for verification
    }

    reporter.lastActive = new Date();
    this.reporters.set(reporterId, reporter);
  }

  private notifySubscribers(reportId: string, update: IncidentUpdate): void {
    // Send push notifications to users who are subscribed to this report
    this.broadcastEvent('report_notification', {
      reportId,
      update,
      message: `New update for incident: ${update.content.substring(0, 50)}...`
    });
  }

  // Data persistence
  private cacheData(): void {
    try {
      localStorage.setItem('community_reports', JSON.stringify(Array.from(this.reports.entries())));
      localStorage.setItem('community_reporters', JSON.stringify(Array.from(this.reporters.entries())));
    } catch (error) {
      console.error('Error caching community reporting data:', error);
    }
  }

  private loadCachedData(): void {
    try {
      const cachedReports = localStorage.getItem('community_reports');
      const cachedReporters = localStorage.getItem('community_reporters');
      
      if (cachedReports) {
        const reportsData = JSON.parse(cachedReports);
        this.reports = new Map(reportsData.map(([id, report]: [string, Record<string, unknown>]) => [
          id, { 
            ...report, 
            timestamp: new Date(report.timestamp as string),
            status: (status: string) => status 
          } as IncidentReport
        ]));
      }
      
      if (cachedReporters) {
        const reportersData = JSON.parse(cachedReporters);
        this.reporters = new Map(reportersData);
      }
    } catch (error) {
      console.error('Error loading cached community reporting data:', error);
    }
  }

  /**
   * Analytics and reporting
   */
  async getAnalytics(timeframe: 'hour' | 'day' | 'week' | 'month'): Promise<ReportingAnalytics> {
    const now = new Date();
    let startTime: Date;

    switch (timeframe) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const reportsInTimeframe = Array.from(this.reports.values())
      .filter(report => report.timestamp >= startTime);

    const analytics: ReportingAnalytics = {
      rejectedReports: null, // Replace with actual ReactNode if needed
      pendingReports: null,  // Replace with actual ReactNode if needed
      timeframe,
      totalReports: reportsInTimeframe.length,
      verifiedReports: reportsInTimeframe.filter(r => r.verificationStatus === 'verified').length,
      falseReports: reportsInTimeframe.filter(r => r.verificationStatus === 'false').length,
      averageVerificationTime: this.calculateAverageVerificationTime(reportsInTimeframe),
      topIncidentTypes: this.getTopIncidentTypes(reportsInTimeframe),
      topReporters: this.getTopReporters(reportsInTimeframe),
      geographicHotspots: this.getGeographicHotspots(reportsInTimeframe),
      responseMetrics: {
        averageOfficialResponseTime: this.calculateAverageResponseTime(reportsInTimeframe),
        responseRate: this.calculateResponseRate(reportsInTimeframe)
      }
    };

    return analytics;
  }

  private calculateAverageVerificationTime(reports: IncidentReport[]): number {
    const verifiedReports = reports.filter(r => r.verificationStatus === 'verified' && r.verifications.length > 0);
    if (verifiedReports.length === 0) return 0;

    const totalTime = verifiedReports.reduce((sum, report) => {
      const firstVerification = report.verifications.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
      return sum + (firstVerification.timestamp.getTime() - report.timestamp.getTime());
    }, 0);

    return totalTime / verifiedReports.length / (1000 * 60); // Return in minutes
  }

  private getTopIncidentTypes(reports: IncidentReport[]) {
    const typeCounts = new Map<string, number>();
    reports.forEach(report => {
      typeCounts.set(report.incidentType, (typeCounts.get(report.incidentType) || 0) + 1);
    });

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTopReporters(reports: IncidentReport[]) {
    const reporterCounts = new Map<string, { name: string; reputation: number; count: number }>();
    
    reports.forEach(report => {
      const existing = reporterCounts.get(report.reporterId);
      if (existing) {
        existing.count++;
      } else {
        reporterCounts.set(report.reporterId, {
          name: report.reporterName,
          reputation: report.reporterReputation,
          count: 1
        });
      }
    });

    return Array.from(reporterCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(reporter => ({
        name: reporter.name,
        reputation: reporter.reputation,
        reportCount: reporter.count
      }));
  }

  private getGeographicHotspots(reports: IncidentReport[]) {
    // Simplified hotspot detection - group by approximate location
    const grid = new Map<string, { lat: number; lng: number; count: number; totalSeverity: number }>();
    const gridSize = 0.01; // ~1km grid

    reports.forEach(report => {
      const gridLat = Math.round(report.location.lat / gridSize) * gridSize;
      const gridLng = Math.round(report.location.lng / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;

      const severity = { low: 1, medium: 2, high: 3, critical: 4 }[report.severity];
      
      const existing = grid.get(key);
      if (existing) {
        existing.count++;
        existing.totalSeverity += severity;
      } else {
        grid.set(key, { lat: gridLat, lng: gridLng, count: 1, totalSeverity: severity });
      }
    });

    return Array.from(grid.values())
      .filter(spot => spot.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(spot => ({
        location: { lat: spot.lat, lng: spot.lng },
        incidentCount: spot.count,
        severity: spot.totalSeverity / spot.count
      }));
  }

  private calculateAverageResponseTime(reports: IncidentReport[]): number {
    const reportsWithResponse = reports.filter(r => r.officialResponse);
    if (reportsWithResponse.length === 0) return 0;

    const totalTime = reportsWithResponse.reduce((sum, report) => {
      return sum + (report.officialResponse!.timestamp.getTime() - report.timestamp.getTime());
    }, 0);

    return totalTime / reportsWithResponse.length / (1000 * 60); // Return in minutes
  }

  private calculateResponseRate(reports: IncidentReport[]): number {
    if (reports.length === 0) return 0;
    const responsesCount = reports.filter(r => r.officialResponse).length;
    return (responsesCount / reports.length) * 100;
  }
}

export default CommunityReportingService;
