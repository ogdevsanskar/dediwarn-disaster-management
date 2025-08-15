import { ethers } from 'ethers';

export const WARNING_CONTRACT_ADDRESS = "0x742d35Cc6665C0532846b18b4A7b283c42c8A52f";

export const WARNING_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "severity",
        "type": "uint8"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "location",
        "type": "string"
      }
    ],
    "name": "WarningIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "WarningResolved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedIssuers",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getWarning",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "message",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "severity",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "views",
            "type": "uint256"
          }
        ],
        "internalType": "struct WarningSystem.Warning",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_severity",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      }
    ],
    "name": "issueWarning",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "resolveWarning",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "warningCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "warnings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "severity",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "views",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export class WarningContract {
  private contract: ethers.Contract;
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner;

  constructor(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(WARNING_CONTRACT_ADDRESS, WARNING_CONTRACT_ABI, signer);
  }

  async issueWarning(message: string, severity: number, location: string) {
    try {
      const tx = await this.contract.issueWarning(message, severity, location);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error issuing warning:', error);
      throw error;
    }
  }

  async resolveWarning(warningId: number) {
    try {
      const tx = await this.contract.resolveWarning(warningId);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error resolving warning:', error);
      throw error;
    }
  }

  async getWarning(warningId: number) {
    try {
      return await this.contract.getWarning(warningId);
    } catch (error) {
      console.error('Error getting warning:', error);
      throw error;
    }
  }

  async getWarningCount() {
    try {
      return await this.contract.warningCount();
    } catch (error) {
      console.error('Error getting warning count:', error);
      throw error;
    }
  }

  async isAuthorizedIssuer(address: string) {
    try {
      return await this.contract.authorizedIssuers(address);
    } catch (error) {
      console.error('Error checking authorization:', error);
      throw error;
    }
  }

  onWarningIssued(callback: (id: number, message: string, severity: number, issuer: string, location: string) => void) {
    this.contract.on('WarningIssued', callback);
  }

  onWarningResolved(callback: (id: number) => void) {
    this.contract.on('WarningResolved', callback);
  }

  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}