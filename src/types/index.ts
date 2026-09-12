export type Language = 'hi' | 'en' | 'te';

export type NetworkMode = 'online' | 'degraded_2g' | 'offline';

export interface UserProfile {
  id: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  relation: string;
  relationHi?: string;
  relationTe?: string;
  avatar: string;
  photoUrl?: string;
  pin: string;
  walletBalancePaise: number;
  phone: string;
  aadhaarMasked: string;
  pmKisanId: string;
  agriStackFid: string;
  khasraNo: string;
  landAreaAcres: number;
  bankAccount: string;
  bankName: string;
  ifscCode: string;
  dbtStatus: 'active_linked' | 'pending' | 'verified';
  primaryCrop: string;
  gender: 'M' | 'F' | 'Other';
  age: number;
  nomineeName: string;
  nomineeRelation: string;
  nomineeRelationHi?: string;
  nomineeRelationTe?: string;
  rationCardNo: string;
  village: string;
  mandal: string;
  district: string;
  state: string;
}

export interface Crop {
  id: string;
  nameHi: string;
  nameEn: string;
  nameTe?: string;
  icon: string;
  imageUrl?: string;
  droughtThresholdMm: number;
  basePremiumPaisePerAcre: number;
  maxPayoutPaisePerAcre: number;
  category?: 'kharif' | 'rabi' | 'millet' | 'pulse_oilseed' | 'commercial';
  season?: string;
}

export interface RegionGrid {
  id: string;
  code: string;
  mandal: string;
  district: string;
  state: string;
  normalSeasonalMm: number;
  latitude: number;
  longitude: number;
}

export interface DeclarativeProduct {
  id: string;
  code: string;
  name: string;
  cropId: string;
  gridId: string;
  thresholdMm: number;
  maxPayoutPaise: number;
  premiumPaise: number;
  season: string;
  oracleWeights: {
    awsGround: number;
    imdRadar: number;
    chirpsSat: number;
  };
  payoutCurveType: 'step_binary' | 'linear_deficit';
  active: boolean;
  version: number;
  createdAt: number;
}

export type PolicyStatus = 'bound_offline' | 'synced' | 'payout_triggered' | 'payout_settled' | 'expired';

export interface PolicyRecord {
  id: string;
  clientTxUuid: string;
  profileId: string;
  farmerName: string;
  farmerPhone: string;
  productId: string;
  productName: string;
  cropId: string;
  gridId: string;
  acreage: number;
  premiumPaidPaise: number;
  maxPayoutPaise: number;
  thresholdMm: number;
  boundOffline: boolean;
  boundTimestamp: number;
  comprehensionScore: number;
  status: PolicyStatus;
  payoutTxId?: string;
  payoutTimestamp?: number;
  reconstructionHash?: string;
}

export type OracleFailureMode = 'healthy' | 'lying_manipulated' | 'stale_frozen' | 'degraded_lossy';

export interface OracleFeed {
  id: 'aws_ground' | 'imd_radar' | 'chirps_sat';
  name: string;
  type: string;
  reportedMm: number;
  healthState: OracleFailureMode;
  lastUpdated: number;
  latencyMs: number;
  confidence: number;
}

export interface ConsensusEvaluation {
  gridId: string;
  evaluatedAt: number;
  rawFeeds: Record<string, number>;
  consensusMm: number;
  thresholdMm: number;
  isTriggered: boolean;
  payoutPercentage: number;
  anomaliesDetected: string[];
  disputeRuleApplied: string;
  auditHash: string;
  errorDirectionMetrics: {
    falseAcceptanceRisk: number; // 0.0 to 1.0
    falseRejectionRisk: number;  // 0.0 to 1.0
  };
}

export interface OfflineVoucher {
  id: string;
  voucherCode: string;
  policyId: string;
  profileId: string;
  amountPaise: number;
  issuedAt: number;
  status: 'active' | 'redeemed_offline' | 'reconciled';
  offlinePinProof: string;
  merchantRecipient?: string;
  redeemedAt?: number;
}

export interface ReconstructionAuditRecord {
  id: string;
  timestamp: number;
  gridId: string;
  eventType: 'ORACLE_SAMPLE' | 'FRAUD_REJECTED' | 'DROUGHT_TRIGGER' | 'PAYOUT_DISBURSED';
  feeds: {
    awsGroundMm: number;
    imdRadarMm: number;
    chirpsSatMm: number;
  };
  consensusMm: number;
  thresholdMm: number;
  verdict: 'PAYOUT_APPROVED' | 'CLAIM_REJECTED' | 'NORMAL_CONDITIONS';
  ruleFired: string;
  payoutAmountPaise?: number;
  payoutRecipientPhone?: string;
  hash: string;
  previousHash: string;
}

export interface LedgerTransaction {
  txId: string;
  profileId: string;
  amountPaise: number; // positive = credit (+), negative = debit (-)
  balanceAfterPaise: number;
  title: string;
  titleHi: string;
  titleTe: string;
  category: 'payout' | 'subsidy' | 'premium' | 'spend';
  timestamp: number;
  paymentRail: 'NPCI_APB' | 'DBT_PFMS' | 'E_RUPI' | 'OFFLINE_ED25519';
  referenceId: string;
  offlineProof: string;
  status: 'success' | 'settled_offline' | 'pending';
}
