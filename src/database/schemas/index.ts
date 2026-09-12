import { PolicyRecord, UserProfile, DeclarativeProduct, OfflineVoucher, ConsensusEvaluation } from '../../types';

export interface DatabaseSchema {
  policies: PolicyRecord[];
  profiles: UserProfile[];
  products: DeclarativeProduct[];
  vouchers: OfflineVoucher[];
  oracleAuditLogs: ConsensusEvaluation[];
  syncQueue: SyncPacketSchema[];
}

export interface SyncPacketSchema {
  packetId: string;
  policyId: string;
  clientTxUuid: string;
  hexPayload: string;
  byteSize: number;
  signedAtEpoch: number;
  status: 'pending' | 'broadcasting' | 'synced' | 'failed';
  retryCount: number;
  lastAttemptAt?: number;
}

export interface AuditLogRecord {
  id: string;
  eventType: 'POLICY_ISSUED' | 'DBT_PAYOUT_TRIGGERED' | 'ORACLE_CONSENSUS_REACHED' | 'PIN_UNLOCKED' | 'FRAUD_PREVENTED';
  entityId: string;
  timestamp: number;
  details: Record<string, any>;
  sha256Hash: string;
}
