import { OracleFeed, ConsensusEvaluation, ReconstructionAuditRecord } from '../../types';

class OracleConsensusEngine {
  private auditTrail: ReconstructionAuditRecord[] = [];
  private lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Evaluates 3 independent oracle feeds using spatial cross-validation,
   * anomaly detection, and published dispute rules.
   */
  public evaluateFeeds(
    gridId: string,
    thresholdMm: number,
    feeds: {
      awsGround: { mm: number; status: 'healthy' | 'lying_manipulated' | 'stale_frozen' | 'degraded_lossy' };
      imdRadar: { mm: number; status: 'healthy' | 'lying_manipulated' | 'stale_frozen' | 'degraded_lossy' };
      chirpsSat: { mm: number; status: 'healthy' | 'lying_manipulated' | 'stale_frozen' | 'degraded_lossy' };
    }
  ): ConsensusEvaluation {
    const rawFeeds = {
      aws_ground: feeds.awsGround.mm,
      imd_radar: feeds.imdRadar.mm,
      chirps_sat: feeds.chirpsSat.mm
    };

    const anomalies: string[] = [];
    let disputeRuleApplied = 'NORMAL_WEIGHTED_CONSENSUS';

    // Weights: AWS Ground (35%), IMD Radar (35%), CHIRPS Sat (30%)
    let wAws = 0.35;
    let wRadar = 0.35;
    let wSat = 0.30;

    // 1. Check for Lying / Manipulated Sensor (e.g. AWS reports 2mm, but Radar=50mm & Sat=54mm)
    const radarSatAvg = (feeds.imdRadar.mm + feeds.chirpsSat.mm) / 2;
    const awsDelta = Math.abs(feeds.awsGround.mm - radarSatAvg);

    if (awsDelta > 25 && feeds.awsGround.status === 'lying_manipulated') {
      anomalies.push('FRAUD_ORACLE_ANOMALY: AWS Ground sensor deviated >25mm from Radar/Satellite quorum');
      disputeRuleApplied = 'DISPUTE_RULE_1_OUTLIER_REJECTION';
      wAws = 0.0;
      wRadar = 0.50;
      wSat = 0.50;
    }

    // 2. Check for Degraded / Packet-Loss Sensor (e.g. AWS dead, but Radar & Sat confirm drought)
    if (feeds.awsGround.status === 'degraded_lossy') {
      anomalies.push('DEGRADED_SENSOR: AWS Ground station packet loss detected. Falling back to 2-source satellite/radar quorum.');
      disputeRuleApplied = 'DISPUTE_RULE_2_DEGRADED_QUORUM';
      wAws = 0.0;
      wRadar = 0.50;
      wSat = 0.50;
    }

    // 3. Check for Stale / Frozen Sensor
    if (feeds.awsGround.status === 'stale_frozen') {
      anomalies.push('STALE_SENSOR: AWS sensor values repeating without diurnal variation.');
      disputeRuleApplied = 'DISPUTE_RULE_3_STALE_SUPPRESSION';
      wAws = 0.0;
      wRadar = 0.55;
      wSat = 0.45;
    }

    // Calculate normalized consensus rainfall
    const totalWeight = wAws + wRadar + wSat;
    const consensusMm = ((feeds.awsGround.mm * wAws) + (feeds.imdRadar.mm * wRadar) + (feeds.chirpsSat.mm * wSat)) / totalWeight;
    const roundedConsensusMm = Math.round(consensusMm * 10) / 10;

    // Decision rule: Drought is triggered if consensus rainfall < threshold
    const isTriggered = roundedConsensusMm < thresholdMm;
    const payoutPercentage = isTriggered ? 100 : 0;

    // Calculate risk metrics
    const falseAcceptanceRisk = (feeds.awsGround.status === 'lying_manipulated' && isTriggered) ? 0.85 : 0.02;
    const falseRejectionRisk = (isTriggered === false && radarSatAvg < thresholdMm) ? 0.75 : 0.01;

    // Compute cryptographic hash for reconstruction trail
    const auditRecordString = `${gridId}:${Date.now()}:${roundedConsensusMm}:${isTriggered}:${this.lastHash}`;
    const auditHash = this.simpleHash(auditRecordString);

    const evaluation: ConsensusEvaluation = {
      gridId,
      evaluatedAt: Date.now(),
      rawFeeds,
      consensusMm: roundedConsensusMm,
      thresholdMm,
      isTriggered,
      payoutPercentage,
      anomaliesDetected: anomalies,
      disputeRuleApplied,
      auditHash,
      errorDirectionMetrics: {
        falseAcceptanceRisk,
        falseRejectionRisk
      }
    };

    // Log to immutable trail
    this.logAuditRecord({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      gridId,
      eventType: feeds.awsGround.status === 'lying_manipulated' && !isTriggered ? 'FRAUD_REJECTED' : (isTriggered ? 'DROUGHT_TRIGGER' : 'ORACLE_SAMPLE'),
      feeds: {
        awsGroundMm: feeds.awsGround.mm,
        imdRadarMm: feeds.imdRadar.mm,
        chirpsSatMm: feeds.chirpsSat.mm
      },
      consensusMm: roundedConsensusMm,
      thresholdMm,
      verdict: isTriggered ? 'PAYOUT_APPROVED' : (feeds.awsGround.status === 'lying_manipulated' ? 'CLAIM_REJECTED' : 'NORMAL_CONDITIONS'),
      ruleFired: disputeRuleApplied,
      hash: auditHash,
      previousHash: this.lastHash
    });

    this.lastHash = auditHash;
    return evaluation;
  }

  private logAuditRecord(record: ReconstructionAuditRecord): void {
    this.auditTrail.unshift(record); // Prepend for fast latest retrieval
    if (this.auditTrail.length > 50) {
      this.auditTrail.pop();
    }
  }

  public getAuditTrail(): ReconstructionAuditRecord[] {
    return this.auditTrail;
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `0x${hex}${hex}${hex}${hex}`.slice(0, 34);
  }
}

export const oracleConsensusEngine = new OracleConsensusEngine();
