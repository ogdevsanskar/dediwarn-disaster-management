import { ethers, Contract, Wallet, Provider } from 'ethers';
import Web3 from 'web3';
import winston from 'winston';
import Redis from 'ioredis';
import crypto from 'crypto';
import { EventEmitter } from 'events';

/**
 * Blockchain Verification System
 * Immutable emergency records, verified volunteer credentials, transparent resource allocation
 */

export interface EmergencyRecord {
  id: string;
  blockchainId: string;
  incidentType: 'medical' | 'fire' | 'police' | 'rescue' | 'hazmat' | 'natural-disaster';
  severity: 1 | 2 | 3 | 4 | 5;
  location: {
    lat: number;
    lng: number;
    address: string;
    geohash: string;
  };
  timestamp: Date;
  reportedBy: string;
  verifiedBy: string[];
  description: string;
  evidence: Array<{
    type: 'photo' | 'video' | 'audio' | 'document' | 'sensor-data';
    hash: string;
    ipfsHash?: string;
    metadata: any;
  }>;
  responseActions: Array<{
    timestamp: Date;
    action: string;
    performer: string;
    verification: string;
    outcome?: string;
  }>;
  resourcesUsed: Array<{
    type: string;
    quantity: number;
    cost: number;
    supplier: string;
    verification: string;
  }>;
  status: 'reported' | 'verified' | 'responding' | 'resolved' | 'closed';
  blockNumber: number;
  transactionHash: string;
  gasUsed: number;
  immutable: boolean;
}

export interface VolunteerCredential {
  id: string;
  volunteerId: string;
  credentialType: 'first-aid' | 'cpr' | 'emergency-response' | 'search-rescue' | 'medical' | 'fire-safety' | 'disaster-relief';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  verification: {
    certificate: string;
    institution: string;
    verifiedBy: string[];
    blockchainProof: string;
  };
  skills: string[];
  endorsements: Array<{
    endorser: string;
    endorsementType: string;
    comment: string;
    timestamp: Date;
    verificationHash: string;
  }>;
  deploymentHistory: Array<{
    emergencyId: string;
    role: string;
    performance: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
    feedback: string;
    timestamp: Date;
  }>;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  blockchainId: string;
  nftTokenId?: string;
}

export interface ResourceAllocation {
  id: string;
  allocationId: string;
  emergencyId: string;
  resourceType: 'personnel' | 'equipment' | 'supplies' | 'funding' | 'vehicles';
  resourceDetails: {
    name: string;
    quantity: number;
    unit: string;
    specifications?: any;
  };
  requestedBy: string;
  approvedBy: string;
  supplier: string;
  allocation: {
    timestamp: Date;
    priority: 1 | 2 | 3 | 4 | 5;
    justification: string;
    estimatedCost: number;
    actualCost?: number;
  };
  delivery: {
    scheduledDelivery: Date;
    actualDelivery?: Date;
    deliveryLocation: {
      lat: number;
      lng: number;
      address: string;
    };
    recipient: string;
    condition: string;
  };
  utilization: {
    percentageUsed: number;
    effectiveness: 'high' | 'medium' | 'low';
    feedback: string;
    returnDate?: Date;
    returnCondition?: string;
  };
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    performer: string;
    details: string;
    verification: string;
  }>;
  blockchainId: string;
  transparency: {
    publiclyVisible: boolean;
    stakeholderAccess: string[];
    reportingLevel: 'full' | 'summary' | 'restricted';
  };
}

export interface BlockchainConfig {
  network: 'ethereum' | 'polygon' | 'bsc' | 'avalanche' | 'local';
  rpcUrl: string;
  chainId: number;
  contractAddresses: {
    emergencyRecords: string;
    volunteerCredentials: string;
    resourceAllocation: string;
  };
  privateKey: string;
  gasPrice: string;
  gasLimit: number;
}

export interface SmartContractEvent {
  contractAddress: string;
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
  args: any;
  verified: boolean;
}

class BlockchainVerificationSystem extends EventEmitter {
  private static instance: BlockchainVerificationSystem;
  private logger!: winston.Logger;
  private redis!: Redis;
  
  // Blockchain connections
  private ethersProvider!: Provider;
  private web3!: Web3;
  private wallet!: Wallet;
  
  // Smart contracts
  private emergencyRecordsContract!: Contract;
  private volunteerCredentialsContract!: Contract;
  private resourceAllocationContract!: Contract;
  
  // Configuration
  private config?: BlockchainConfig;
  private isInitialized: boolean = false;
  
  // Local caches
  private emergencyRecords: Map<string, EmergencyRecord> = new Map();
  private volunteerCredentials: Map<string, VolunteerCredential> = new Map();
  private resourceAllocations: Map<string, ResourceAllocation> = new Map();
  
  // Event monitoring
  private eventListeners: Map<string, any> = new Map();

  private constructor() {
    super();
    this.initializeLogger();
    this.initializeRedis();
  }

  static getInstance(): BlockchainVerificationSystem {
    if (!BlockchainVerificationSystem.instance) {
      BlockchainVerificationSystem.instance = new BlockchainVerificationSystem();
    }
    return BlockchainVerificationSystem.instance;
  }

  /**
   * Initialize logger
   */
  private initializeLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/blockchain-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/blockchain-combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true
    });

    this.redis.on('connect', () => {
      this.logger.info('Blockchain Verification System connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  /**
   * Initialize blockchain connections and contracts
   */
  async initialize(config?: Partial<BlockchainConfig>): Promise<void> {
    try {
      // Set configuration
      this.config = {
        network: (config?.network || process.env.BLOCKCHAIN_NETWORK || 'polygon') as any,
        rpcUrl: config?.rpcUrl || process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-rpc.com',
        chainId: config?.chainId || parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '137'),
        contractAddresses: {
          emergencyRecords: config?.contractAddresses?.emergencyRecords || process.env.EMERGENCY_RECORDS_CONTRACT || '',
          volunteerCredentials: config?.contractAddresses?.volunteerCredentials || process.env.VOLUNTEER_CREDENTIALS_CONTRACT || '',
          resourceAllocation: config?.contractAddresses?.resourceAllocation || process.env.RESOURCE_ALLOCATION_CONTRACT || ''
        },
        privateKey: config?.privateKey || process.env.BLOCKCHAIN_PRIVATE_KEY || '',
        gasPrice: config?.gasPrice || process.env.BLOCKCHAIN_GAS_PRICE || '30000000000', // 30 gwei
        gasLimit: config?.gasLimit || parseInt(process.env.BLOCKCHAIN_GAS_LIMIT || '500000')
      };

      // Initialize providers
      this.ethersProvider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      this.web3 = new Web3(this.config.rpcUrl);

      // Initialize wallet
      this.wallet = new ethers.Wallet(this.config.privateKey, this.ethersProvider);

      // Initialize smart contracts
      await this.initializeContracts();

      // Start event monitoring
      this.startEventMonitoring();

      this.isInitialized = true;
      this.logger.info(`Blockchain Verification System initialized on ${this.config.network}`);

    } catch (error) {
      this.logger.error('Error initializing blockchain system:', error);
      throw error;
    }
  }

  /**
   * Initialize smart contracts
   */
  private async initializeContracts(): Promise<void> {
    // Emergency Records Contract ABI (simplified)
    const emergencyRecordsABI = [
      "function recordEmergency(string calldata emergencyId, uint8 severity, string calldata location, string calldata description, string calldata evidenceHash) external returns (uint256)",
      "function verifyEmergency(string calldata emergencyId, address verifier) external",
      "function updateEmergencyStatus(string calldata emergencyId, uint8 status) external",
      "function getEmergency(string calldata emergencyId) external view returns (tuple(string id, uint8 severity, string location, string description, string evidenceHash, uint8 status, uint256 timestamp))",
      "event EmergencyRecorded(string indexed emergencyId, uint8 severity, uint256 timestamp)",
      "event EmergencyVerified(string indexed emergencyId, address indexed verifier, uint256 timestamp)",
      "event EmergencyStatusUpdated(string indexed emergencyId, uint8 status, uint256 timestamp)"
    ];

    // Volunteer Credentials Contract ABI (simplified)
    const volunteerCredentialsABI = [
      "function issueCredential(string calldata volunteerId, uint8 credentialType, uint8 level, string calldata certificationHash, uint256 expiryDate) external returns (uint256)",
      "function verifyCredential(string calldata volunteerId, address verifier) external",
      "function endorseVolunteer(string calldata volunteerId, string calldata endorsementHash) external",
      "function getCredential(string calldata volunteerId) external view returns (tuple(string id, uint8 credentialType, uint8 level, string certificationHash, uint256 expiryDate, bool active))",
      "event CredentialIssued(string indexed volunteerId, uint8 credentialType, uint256 timestamp)",
      "event CredentialVerified(string indexed volunteerId, address indexed verifier, uint256 timestamp)",
      "event VolunteerEndorsed(string indexed volunteerId, address indexed endorser, uint256 timestamp)"
    ];

    // Resource Allocation Contract ABI (simplified)
    const resourceAllocationABI = [
      "function allocateResource(string calldata allocationId, string calldata emergencyId, uint8 resourceType, uint256 quantity, uint256 cost, string calldata details) external returns (uint256)",
      "function approveAllocation(string calldata allocationId, address approver) external",
      "function recordDelivery(string calldata allocationId, string calldata deliveryHash) external",
      "function recordUtilization(string calldata allocationId, uint8 effectiveness, string calldata feedback) external",
      "function getAllocation(string calldata allocationId) external view returns (tuple(string id, string emergencyId, uint8 resourceType, uint256 quantity, uint256 cost, uint8 status))",
      "event ResourceAllocated(string indexed allocationId, string indexed emergencyId, uint8 resourceType, uint256 cost)",
      "event AllocationApproved(string indexed allocationId, address indexed approver, uint256 timestamp)",
      "event ResourceDelivered(string indexed allocationId, uint256 timestamp)",
      "event UtilizationRecorded(string indexed allocationId, uint8 effectiveness, uint256 timestamp)"
    ];

    // Initialize contracts
    if (this.config && this.config.contractAddresses && this.config.contractAddresses.emergencyRecords) {
      this.emergencyRecordsContract = new ethers.Contract(
        this.config.contractAddresses.emergencyRecords,
        emergencyRecordsABI,
        this.wallet
      );
    }

    if (this.config && this.config.contractAddresses && this.config.contractAddresses.volunteerCredentials) {
      this.volunteerCredentialsContract = new ethers.Contract(
        this.config.contractAddresses.volunteerCredentials,
        volunteerCredentialsABI,
        this.wallet
      );
    }

    if (this.config && this.config.contractAddresses && this.config.contractAddresses.resourceAllocation) {
      this.resourceAllocationContract = new ethers.Contract(
        this.config.contractAddresses.resourceAllocation,
        resourceAllocationABI,
        this.wallet
      );
    }

    this.logger.info('Smart contracts initialized');
  }

  /**
   * Record emergency incident on blockchain
   */
  async recordEmergency(emergency: {
    id: string;
    incidentType: 'medical' | 'fire' | 'police' | 'rescue' | 'hazmat' | 'natural-disaster';
    severity: 1 | 2 | 3 | 4 | 5;
    location: { lat: number; lng: number; address: string };
    description: string;
    reportedBy: string;
    evidence?: any[];
  }): Promise<EmergencyRecord> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain system not initialized');
      }

      // Create evidence hash
      const evidenceHash = this.createHash({
        evidence: emergency.evidence || [],
        timestamp: Date.now(),
        reportedBy: emergency.reportedBy
      });

      // Create geohash for location
      const geohash = this.createLocationHash(emergency.location.lat, emergency.location.lng);

      // Record on blockchain
      const tx = await this.emergencyRecordsContract.recordEmergency(
        emergency.id,
        emergency.severity,
        JSON.stringify({
          lat: emergency.location.lat,
          lng: emergency.location.lng,
          address: emergency.location.address,
          geohash
        }),
        emergency.description,
        evidenceHash,
        {
          gasLimit: this.config?.gasLimit ?? 500000,
          gasPrice: this.config?.gasPrice ?? '30000000000'
        }
      );

      const receipt = await tx.wait();

      // Create emergency record
      const emergencyRecord: EmergencyRecord = {
        id: emergency.id,
        blockchainId: `${this.config?.chainId ?? ''}-${receipt.blockNumber}-${receipt.transactionIndex}`,
        incidentType: emergency.incidentType,
        severity: emergency.severity,
        location: {
          ...emergency.location,
          geohash
        },
        timestamp: new Date(),
        reportedBy: emergency.reportedBy,
        verifiedBy: [],
        description: emergency.description,
        evidence: (emergency.evidence || []).map(evidence => ({
          type: evidence.type,
          hash: this.createHash(evidence),
          ipfsHash: evidence.ipfsHash,
          metadata: evidence
        })),
        responseActions: [],
        resourcesUsed: [],
        status: 'reported',
        blockNumber: receipt.blockNumber,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        immutable: true
      };

      // Store in cache
      this.emergencyRecords.set(emergency.id, emergencyRecord);
      
      // Store in Redis
      await this.redis.setex(
        `blockchain:emergency:${emergency.id}`,
        86400, // 24 hours
        JSON.stringify(emergencyRecord)
      );

      this.emit('emergency:recorded', emergencyRecord);
      this.logger.info(`Emergency recorded on blockchain: ${emergency.id} (Block: ${receipt.blockNumber})`);

      return emergencyRecord;

    } catch (error) {
      this.logger.error('Error recording emergency on blockchain:', error);
      throw error;
    }
  }

  /**
   * Verify volunteer credentials
   */
  async issueVolunteerCredential(credential: {
    volunteerId: string;
    credentialType: 'first-aid' | 'cpr' | 'emergency-response' | 'search-rescue' | 'medical' | 'fire-safety' | 'disaster-relief';
    level: 'basic' | 'intermediate' | 'advanced' | 'expert';
    issuedBy: string;
    certificate: any;
    skills: string[];
    expiryDate: Date;
  }): Promise<VolunteerCredential> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain system not initialized');
      }

      // Create certification hash
      const certificationHash = this.createHash({
        certificate: credential.certificate,
        issuedBy: credential.issuedBy,
        skills: credential.skills,
        timestamp: Date.now()
      });

      // Issue credential on blockchain
      const credentialTypeMap = {
        'first-aid': 1, 'cpr': 2, 'emergency-response': 3,
        'search-rescue': 4, 'medical': 5, 'fire-safety': 6, 'disaster-relief': 7
      };
      const levelMap = { 'basic': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };

      const tx = await this.volunteerCredentialsContract.issueCredential(
        credential.volunteerId,
        credentialTypeMap[credential.credentialType],
        levelMap[credential.level],
        certificationHash,
        Math.floor(credential.expiryDate.getTime() / 1000),
        {
          gasLimit: this.config?.gasLimit ?? 500000,
          gasPrice: this.config?.gasPrice ?? '30000000000'
        }
      );

      const receipt = await tx.wait();

      // Create credential record
      const volunteerCredential: VolunteerCredential = {
        id: `credential_${credential.volunteerId}_${Date.now()}`,
        volunteerId: credential.volunteerId,
        credentialType: credential.credentialType,
        level: credential.level,
        issuedBy: credential.issuedBy,
        issuedDate: new Date(),
        expiryDate: credential.expiryDate,
        verification: {
          certificate: certificationHash,
          institution: credential.issuedBy,
          verifiedBy: [this.wallet.address],
          blockchainProof: receipt.hash
        },
        skills: credential.skills,
        endorsements: [],
        deploymentHistory: [],
        status: 'active',
        blockchainId: `${this.config?.chainId ?? ''}-${receipt.blockNumber}-${receipt.transactionIndex ?? ''}`,
        nftTokenId: receipt.logs[0]?.topics[1] // Assuming NFT token ID is emitted
      };

      // Store in cache
      this.volunteerCredentials.set(credential.volunteerId, volunteerCredential);
      
      // Store in Redis
      await this.redis.setex(
        `blockchain:volunteer:${credential.volunteerId}`,
        86400 * 30, // 30 days
        JSON.stringify(volunteerCredential)
      );

      this.emit('credential:issued', volunteerCredential);
      this.logger.info(`Volunteer credential issued: ${credential.volunteerId} (${credential.credentialType})`);

      return volunteerCredential;

    } catch (error) {
      this.logger.error('Error issuing volunteer credential:', error);
      throw error;
    }
  }

  /**
   * Record resource allocation with transparent tracking
   */
  async recordResourceAllocation(allocation: {
    id: string;
    emergencyId: string;
    resourceType: 'personnel' | 'equipment' | 'supplies' | 'funding' | 'vehicles';
    resourceDetails: {
      name: string;
      quantity: number;
      unit: string;
      specifications?: any;
    };
    requestedBy: string;
    estimatedCost: number;
    priority: 1 | 2 | 3 | 4 | 5;
    justification: string;
    supplier: string;
  }): Promise<ResourceAllocation> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain system not initialized');
      }

      const resourceTypeMap = {
        'personnel': 1, 'equipment': 2, 'supplies': 3, 'funding': 4, 'vehicles': 5
      };

      // Record allocation on blockchain
      const tx = await this.resourceAllocationContract.allocateResource(
        allocation.id,
        allocation.emergencyId,
        resourceTypeMap[allocation.resourceType],
        allocation.resourceDetails.quantity,
        ethers.parseEther(allocation.estimatedCost.toString()),
        JSON.stringify({
          name: allocation.resourceDetails.name,
          unit: allocation.resourceDetails.unit,
          specifications: allocation.resourceDetails.specifications,
          justification: allocation.justification,
          supplier: allocation.supplier
        }),
        {
          gasLimit: this.config?.gasLimit ?? 500000,
          gasPrice: this.config?.gasPrice ?? '30000000000'
        }
      );

      const receipt = await tx.wait();

      // Create resource allocation record
      const resourceAllocation: ResourceAllocation = {
        id: allocation.id,
        allocationId: `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        emergencyId: allocation.emergencyId,
        resourceType: allocation.resourceType,
        resourceDetails: allocation.resourceDetails,
        requestedBy: allocation.requestedBy,
        approvedBy: '', // Will be set when approved
        supplier: allocation.supplier,
        allocation: {
          timestamp: new Date(),
          priority: allocation.priority,
          justification: allocation.justification,
          estimatedCost: allocation.estimatedCost
        },
        delivery: {
          scheduledDelivery: new Date(Date.now() + 3600000), // Default to 1 hour from now
          deliveryLocation: { lat: 0, lng: 0, address: '' }, // Will be set later
          recipient: '',
          condition: ''
        },
        utilization: {
          percentageUsed: 0,
          effectiveness: 'medium',
          feedback: ''
        },
        auditTrail: [{
          timestamp: new Date(),
          action: 'allocation-requested',
          performer: allocation.requestedBy,
          details: `Requested ${allocation.resourceDetails.quantity} ${allocation.resourceDetails.unit} of ${allocation.resourceDetails.name}`,
          verification: receipt.hash
        }],
        blockchainId: `${this.config?.chainId ?? ''}-${receipt.blockNumber ?? ''}-${receipt.transactionIndex ?? ''}`,
        transparency: {
          publiclyVisible: true,
          stakeholderAccess: ['emergency-coordinators', 'auditors', 'public'],
          reportingLevel: 'full'
        }
      };

      // Store in cache
      this.resourceAllocations.set(allocation.id, resourceAllocation);
      
      // Store in Redis
      await this.redis.setex(
        `blockchain:allocation:${allocation.id}`,
        86400 * 7, // 7 days
        JSON.stringify(resourceAllocation)
      );

      this.emit('allocation:recorded', resourceAllocation);
      this.logger.info(`Resource allocation recorded: ${allocation.id} (${allocation.resourceType})`);

      return resourceAllocation;

    } catch (error) {
      this.logger.error('Error recording resource allocation:', error);
      throw error;
    }
  }

  /**
   * Verify emergency incident with multi-party verification
   */
  async verifyEmergency(emergencyId: string, verifierId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain system not initialized');
      }

      // Verify on blockchain
      const tx = await this.emergencyRecordsContract.verifyEmergency(
        emergencyId,
        this.wallet.address,
        {
          gasLimit: this.config?.gasLimit ?? 500000,
          gasPrice: this.config?.gasPrice ?? '30000000000'
        }
      );

      const receipt = await tx.wait();

      // Update local record
      const emergency = this.emergencyRecords.get(emergencyId);
      if (emergency) {
        emergency.verifiedBy.push(verifierId);
        emergency.status = 'verified';
        
        // Update in cache
        this.emergencyRecords.set(emergencyId, emergency);
        
        // Update in Redis
        await this.redis.setex(
          `blockchain:emergency:${emergencyId}`,
          86400,
          JSON.stringify(emergency)
        );
      }

      this.emit('emergency:verified', { emergencyId, verifierId, transactionHash: receipt.hash });
      this.logger.info(`Emergency verified: ${emergencyId} by ${verifierId}`);

    } catch (error) {
      this.logger.error('Error verifying emergency:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for resource allocation
   */
  async getAuditTrail(allocationId: string): Promise<ResourceAllocation['auditTrail'] | null> {
    try {
      // Try cache first
      let allocation = this.resourceAllocations.get(allocationId);
      
      if (!allocation) {
        // Try Redis
        const cached = await this.redis.get(`blockchain:allocation:${allocationId}`);
        if (cached) {
          allocation = JSON.parse(cached);
        }
      }

      if (!allocation) {
        // Query blockchain
        const onChainData = await this.resourceAllocationContract.getAllocation(allocationId);
        // Parse and reconstruct allocation if needed
      }

      return allocation?.auditTrail || null;

    } catch (error) {
      this.logger.error('Error getting audit trail:', error);
      return null;
    }
  }

  /**
   * Generate transparency report
   */
  async generateTransparencyReport(emergencyId?: string): Promise<{
    summary: any;
    emergencyRecords: EmergencyRecord[];
    resourceAllocations: ResourceAllocation[];
    totalCosts: number;
    verificationCount: number;
    timeRange: { start: Date; end: Date };
  }> {
    try {
      const report = {
        summary: {},
        emergencyRecords: [] as EmergencyRecord[],
        resourceAllocations: [] as ResourceAllocation[],
        totalCosts: 0,
        verificationCount: 0,
        timeRange: {
          start: new Date(Date.now() - 86400000 * 30), // Last 30 days
          end: new Date()
        }
      };

      // Get emergency records
      if (emergencyId) {
        const emergency = await this.getEmergencyRecord(emergencyId);
        if (emergency) report.emergencyRecords.push(emergency);
      } else {
        report.emergencyRecords = Array.from(this.emergencyRecords.values());
      }

      // Get resource allocations
      const allocations = emergencyId 
        ? Array.from(this.resourceAllocations.values()).filter(a => a.emergencyId === emergencyId)
        : Array.from(this.resourceAllocations.values());
      
      report.resourceAllocations = allocations;

      // Calculate totals
      report.totalCosts = allocations.reduce((sum, alloc) => 
        sum + (alloc.allocation.actualCost || alloc.allocation.estimatedCost), 0);
      
      report.verificationCount = report.emergencyRecords.reduce((sum, emergency) => 
        sum + emergency.verifiedBy.length, 0);

      // Generate summary statistics
      report.summary = {
        totalEmergencies: report.emergencyRecords.length,
        totalAllocations: report.resourceAllocations.length,
        totalCosts: report.totalCosts,
        averageVerifications: report.verificationCount / Math.max(report.emergencyRecords.length, 1),
        emergencyTypes: this.groupBy(report.emergencyRecords, 'incidentType'),
        resourceTypes: this.groupBy(report.resourceAllocations, 'resourceType'),
        verificationRate: (report.verificationCount / Math.max(report.emergencyRecords.length, 1)) * 100
      };

      this.logger.info('Transparency report generated');
      return report;

    } catch (error) {
      this.logger.error('Error generating transparency report:', error);
      throw error;
    }
  }

  /**
   * Start monitoring blockchain events
   */
  private startEventMonitoring(): void {
    if (!this.emergencyRecordsContract) return;

    // Monitor emergency events
    const emergencyFilter = this.emergencyRecordsContract.filters.EmergencyRecorded();
    this.emergencyRecordsContract.on(emergencyFilter, (emergencyId, severity, timestamp, event) => {
      this.handleBlockchainEvent('EmergencyRecorded', {
        emergencyId,
        severity: severity.toString(),
        timestamp: new Date(timestamp * 1000),
        transactionHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber
      });
    });

    // Monitor verification events
    const verificationFilter = this.emergencyRecordsContract.filters.EmergencyVerified();
    this.emergencyRecordsContract.on(verificationFilter, (emergencyId, verifier, timestamp, event) => {
      this.handleBlockchainEvent('EmergencyVerified', {
        emergencyId,
        verifier,
        timestamp: new Date(timestamp * 1000),
        transactionHash: event.log.transactionHash,
        blockNumber: event.log.blockNumber
      });
    });

    // Monitor resource allocation events
    if (this.resourceAllocationContract) {
      const allocationFilter = this.resourceAllocationContract.filters.ResourceAllocated();
      this.resourceAllocationContract.on(allocationFilter, (allocationId, emergencyId, resourceType, cost, event) => {
        this.handleBlockchainEvent('ResourceAllocated', {
          allocationId,
          emergencyId,
          resourceType: resourceType.toString(),
          cost: ethers.formatEther(cost),
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });
    }

    this.logger.info('Blockchain event monitoring started');
  }

  /**
   * Handle blockchain events
   */
  private handleBlockchainEvent(eventName: string, eventData: any): void {
    const event: SmartContractEvent = {
      contractAddress: eventData.address || '',
      eventName,
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      timestamp: eventData.timestamp || new Date(),
      args: eventData,
      verified: true
    };

    this.emit('blockchain:event', event);
    this.logger.debug(`Blockchain event: ${eventName}`, eventData);
  }

  // Helper methods

  private createHash(data: any): string {
    return crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private createLocationHash(lat: number, lng: number, precision: number = 6): string {
    // Simple geohash implementation
    return crypto.createHash('md5')
      .update(`${lat.toFixed(precision)},${lng.toFixed(precision)}`)
      .digest('hex')
      .substr(0, 12);
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  /**
   * Get emergency record
   */
  private async getEmergencyRecord(emergencyId: string): Promise<EmergencyRecord | null> {
    try {
      // Try cache first
      let emergency = this.emergencyRecords.get(emergencyId);
      
      if (!emergency) {
        // Try Redis
        const cached = await this.redis.get(`blockchain:emergency:${emergencyId}`);
        if (cached) {
          emergency = JSON.parse(cached);
          this.emergencyRecords.set(emergencyId, emergency!);
        }
      }

      return emergency || null;

    } catch (error) {
      this.logger.error('Error getting emergency record:', error);
      return null;
    }
  }

  /**
   * Get blockchain network status
   */
  async getNetworkStatus(): Promise<{
    network: string;
    chainId: number;
    blockNumber: number;
    gasPrice: string;
    connected: boolean;
  }> {
    try {
      const [blockNumber, gasPrice, network] = await Promise.all([
        this.ethersProvider.getBlockNumber(),
        this.ethersProvider.getFeeData(),
        this.ethersProvider.getNetwork()
      ]);

      return {
        network: this.config?.network ?? '',
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        connected: true
      };

    } catch (error) {
      this.logger.error('Error getting network status:', error);
      return {
        network: this.config?.network ?? '',
        chainId: this.config?.chainId ?? 0,
        blockNumber: 0,
        gasPrice: '0',
        connected: false
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      // Remove all event listeners
      if (this.emergencyRecordsContract) {
        this.emergencyRecordsContract.removeAllListeners();
      }
      if (this.volunteerCredentialsContract) {
        this.volunteerCredentialsContract.removeAllListeners();
      }
      if (this.resourceAllocationContract) {
        this.resourceAllocationContract.removeAllListeners();
      }

      // Close Redis connection
      await this.redis.quit();

      this.isInitialized = false;
      this.logger.info('Blockchain Verification System shut down gracefully');

    } catch (error) {
      this.logger.error('Error during blockchain system shutdown:', error);
    }
  }
}

export default BlockchainVerificationSystem;
