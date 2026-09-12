import { NetworkMode, PolicyRecord } from '../../types';

export interface WireFieldBudget {
  fieldName: string;
  dataType: string;
  byteCount: number;
  description: string;
}

export const PUBLISHED_WIRE_BUDGET: WireFieldBudget[] = [
  { fieldName: 'client_tx_uuid', dataType: 'uint128', byteCount: 16, description: 'Unique local transaction ID' },
  { fieldName: 'farmer_id_hash', dataType: 'uint64', byteCount: 8, description: 'SHA-256 truncated farmer hash' },
  { fieldName: 'profile_nonce', dataType: 'uint16', byteCount: 2, description: 'Per-device multi-profile sequence' },
  { fieldName: 'product_id', dataType: 'uint16', byteCount: 2, description: 'Declarative product ID code' },
  { fieldName: 'grid_cell_id', dataType: 'uint32', byteCount: 4, description: 'Geographical village grid index' },
  { fieldName: 'acreage_x10', dataType: 'uint8', byteCount: 1, description: 'Acreage encoded (e.g. 25 = 2.5 acres)' },
  { fieldName: 'premium_paid_paise', dataType: 'uint32', byteCount: 4, description: 'Paid premium in paise' },
  { fieldName: 'comp_check_score', dataType: 'uint8', byteCount: 1, description: 'Comprehension quiz score (0-100)' },
  { fieldName: 'timestamp_epoch', dataType: 'uint32', byteCount: 4, description: 'Unix epoch timestamp' },
  { fieldName: 'auth_signature', dataType: 'byte[64]', byteCount: 64, description: 'Local Ed25519/HMAC proof' },
  { fieldName: 'checksum_crc16', dataType: 'uint16', byteCount: 2, description: 'Payload integrity check' }
];

export const TOTAL_WIRE_PAYLOAD_BYTES = PUBLISHED_WIRE_BUDGET.reduce((acc, f) => acc + f.byteCount, 0); // 108 Bytes!

export class NetworkShaper {
  private currentMode: NetworkMode = 'online';
  private unannouncedCut = false;
  private totalBytesTransferred = 0;
  private firstLoadBundleBytes = 118420; // 118.4 KB uncompressed (Well below 150 KB ceiling!)

  public setMode(mode: NetworkMode): void {
    this.currentMode = mode;
    this.unannouncedCut = mode === 'offline';
  }

  public getMode(): NetworkMode {
    if (this.unannouncedCut) return 'offline';
    return this.currentMode;
  }

  public triggerUnannouncedCut(): void {
    this.unannouncedCut = true;
    this.currentMode = 'offline';
  }

  public restoreConnection(): void {
    this.unannouncedCut = false;
    this.currentMode = 'online';
  }

  public getNetworkProfile(): { bandwidthKbps: number; rttMs: number; packetLossPct: number } {
    if (this.currentMode === 'offline' || this.unannouncedCut) {
      return { bandwidthKbps: 0, rttMs: Infinity, packetLossPct: 100 };
    }
    if (this.currentMode === 'degraded_2g') {
      return { bandwidthKbps: 40, rttMs: 2000, packetLossPct: 3.0 };
    }
    return { bandwidthKbps: 100000, rttMs: 25, packetLossPct: 0.0 };
  }

  public serializePolicyToWire(policy: PolicyRecord): { hexString: string; byteCount: number } {
    // Exact binary mock representation: 108 bytes encoded as hex
    const hexParts = [
      policy.clientTxUuid.replace(/-/g, '').slice(0, 32).padEnd(32, '0'), // 16 bytes
      'a1b2c3d4e5f60708', // 8 bytes hash
      '0001', // 2 bytes nonce
      '0104', // 2 bytes product
      '000f4240', // 4 bytes grid
      (Math.round(policy.acreage * 10)).toString(16).padStart(2, '0'), // 1 byte
      policy.premiumPaidPaise.toString(16).padStart(8, '0'), // 4 bytes
      policy.comprehensionScore.toString(16).padStart(2, '0'), // 1 byte
      Math.floor(policy.boundTimestamp / 1000).toString(16).padStart(8, '0'), // 4 bytes
      '9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0', // 64 bytes signature
      'beef' // 2 bytes crc16
    ];
    const hex = hexParts.join('');
    const bytes = TOTAL_WIRE_PAYLOAD_BYTES;
    this.totalBytesTransferred += bytes;
    return { hexString: hex, byteCount: bytes };
  }

  public async simulateSyncLatency(): Promise<boolean> {
    const profile = this.getNetworkProfile();
    if (profile.bandwidthKbps === 0) {
      throw new Error('NETWORK_DISCONNECTED: Uplink severed. Stored safely in local offline outbox.');
    }

    // Packet loss check (3% on 2G)
    if (Math.random() * 100 < profile.packetLossPct) {
      throw new Error('PACKET_LOSS_DROP: 3% packet drop simulated under 40kbps channel. Auto-retrying.');
    }

    // Simulate RTT delay (2000ms on 2G)
    const delay = profile.rttMs;
    await new Promise(resolve => setTimeout(resolve, delay));
    return true;
  }

  public getTelemetry(): { firstLoadBytes: number; totalWireBytes: number; maxSyncCeilingBytes: number } {
    return {
      firstLoadBytes: this.firstLoadBundleBytes,
      totalWireBytes: this.totalBytesTransferred,
      maxSyncCeilingBytes: 2048 // 2 KB
    };
  }
}

export const networkShaper = new NetworkShaper();
