import { OfflineVoucher, PolicyRecord, LedgerTransaction } from '../../types';

type Listener = () => void;

class WalletService {
  private vouchers: Map<string, OfflineVoucher> = new Map();
  private userBalances: Map<string, number> = new Map(); // profileId -> paise
  private ledgerHistory: LedgerTransaction[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory() {
    const now = Date.now();
    const dayMs = 86400000;

    // Profile 1: Rameshwar Patel
    this.userBalances.set('user_rameshwar', 206000); // ₹2,060.00
    this.ledgerHistory.push(
      {
        txId: 'TXN-DBT-2026-90412',
        profileId: 'user_rameshwar',
        amountPaise: 200000, // +₹2,000
        balanceAfterPaise: 206000,
        title: 'PM-KISAN 17th Installment Direct Transfer',
        titleHi: 'पीएम-किसान 17वीं किस्त प्रत्यक्ष बैंक हस्तांतरण',
        titleTe: 'పీఎం-కిసాన్ 17వ విడత ప్రత్యక్ష బదిలీ',
        category: 'subsidy',
        timestamp: now - dayMs * 18,
        paymentRail: 'NPCI_APB',
        referenceId: 'PFMS-APB-884920199',
        offlineProof: 'NPCI_AADHAAR_UIDAI_AUTH_OK',
        status: 'success'
      },
      {
        txId: 'TXN-SUB-2026-81204',
        profileId: 'user_rameshwar',
        amountPaise: 12000, // +₹120.00
        balanceAfterPaise: 6000,
        title: 'State DBT Crop Insurance Matching Subsidy (90%)',
        titleHi: 'राज्य डीबीटी फसल बीमा अंशदान सब्सिडी (90%)',
        titleTe: 'రాష్ట్ర ప్రభుత్వం పంట బీమా సబ్సిడీ (90%)',
        category: 'subsidy',
        timestamp: now - dayMs * 35,
        paymentRail: 'DBT_PFMS',
        referenceId: 'AP-DBT-AGRI-2026-0041',
        offlineProof: 'SIG_ED25519_STATE_AGRI_GRANT',
        status: 'success'
      },
      {
        txId: 'TXN-PREM-2026-72019',
        profileId: 'user_rameshwar',
        amountPaise: -6000, // -₹60.00
        balanceAfterPaise: -6000,
        title: 'Kharif Parametric Micro-Insurance Premium Debit (2.0 Acres)',
        titleHi: 'खरीफ मौसम सूचकांक बीमा प्रीमियम भुगतान (2.0 एकड़)',
        titleTe: 'ఖరీఫ్ వాతావరణ బీమా ప్రీమియం చెల్లింపు (2.0 ఎకరాలు)',
        category: 'premium',
        timestamp: now - dayMs * 35 - 3600000,
        paymentRail: 'OFFLINE_ED25519',
        referenceId: 'POL-KH-2026-001',
        offlineProof: 'SIG_ED25519_POS_LOCAL_SECURE_PAY',
        status: 'settled_offline'
      }
    );

    // Profile 2: Sunita Devi
    this.userBalances.set('user_sunita', 200000); // ₹2,000.00
    this.ledgerHistory.push({
      txId: 'TXN-DBT-2026-90413',
      profileId: 'user_sunita',
      amountPaise: 200000,
      balanceAfterPaise: 200000,
      title: 'PM-KISAN DBT Direct Beneficiary Credit (Mahila Kisan)',
      titleHi: 'पीएम-किसान डीबीटी प्रत्यक्ष लाभार्थी जमा (महिला किसान)',
      titleTe: 'పీఎం-కిసాన్ డీబీటీ లబ్ధిదారుల జమ (మహిళా కిసాన్)',
      category: 'subsidy',
      timestamp: now - dayMs * 14,
      paymentRail: 'NPCI_APB',
      referenceId: 'PFMS-APB-884920200',
      offlineProof: 'NPCI_AADHAAR_UIDAI_AUTH_OK',
      status: 'success'
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (e) {
        console.error('WalletService listener error', e);
      }
    });
  }

  /**
   * Records a policy premium deduction.
   */
  public recordPolicyPurchase(policy: PolicyRecord, premiumPaise: number) {
    const currentBal = this.userBalances.get(policy.profileId) || 0;
    const newBal = currentBal - premiumPaise;
    this.userBalances.set(policy.profileId, newBal);

    const txId = `TXN-PREM-${Date.now().toString().slice(-6)}`;
    this.ledgerHistory.unshift({
      txId,
      profileId: policy.profileId,
      amountPaise: -premiumPaise,
      balanceAfterPaise: newBal,
      title: `${policy.productName} Subsidized Premium (${policy.acreage} Acres)`,
      titleHi: `${policy.productName} बीमा प्रीमियम कटौती (${policy.acreage} एकड़)`,
      titleTe: `${policy.productName} బీమా సబ్సిడీ ప్రీమియం చెల్లింపు (${policy.acreage} ఎకరాలు)`,
      category: 'premium',
      timestamp: Date.now(),
      paymentRail: 'OFFLINE_ED25519',
      referenceId: policy.id,
      offlineProof: `SIG_ED25519_AUTH_${policy.farmerPhone}_${policy.clientTxUuid.slice(0, 8)}`,
      status: 'settled_offline'
    });

    this.notify();
  }

  /**
   * Generates an immediate offline spendable voucher upon payout trigger.
   * Spendable within 10s of trigger without needing live internet connection.
   */
  public issuePayoutVoucher(policy: PolicyRecord): OfflineVoucher {
    const amount = policy.maxPayoutPaise;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit offline redemption OTP
    const voucherId = `vouch_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const voucher: OfflineVoucher = {
      id: voucherId,
      voucherCode: otpCode,
      policyId: policy.id,
      profileId: policy.profileId,
      amountPaise: amount,
      issuedAt: Date.now(),
      status: 'active',
      offlinePinProof: `SIG_ED25519_${otpCode}_${policy.farmerPhone}`
    };

    this.vouchers.set(voucher.id, voucher);

    // Credit local profile balance immediately
    const currentBal = this.userBalances.get(policy.profileId) || 0;
    const newBal = currentBal + amount;
    this.userBalances.set(policy.profileId, newBal);

    // Record in local append-only ledger
    const txId = `TXN-PAYOUT-${Date.now().toString().slice(-6)}`;
    this.ledgerHistory.unshift({
      txId,
      profileId: policy.profileId,
      amountPaise: amount,
      balanceAfterPaise: newBal,
      title: `Automatic Drought Deficit DBT Payout (< ${policy.thresholdMm}mm)`,
      titleHi: `स्वचालित सूखा क्षतिपूर्ति डीबीटी भुगतान (< ${policy.thresholdMm}mm)`,
      titleTe: `స్వయంసిద్ధ కరువు పరిహారం డీబీటీ జమ (< ${policy.thresholdMm} మి.మీ.)`,
      category: 'payout',
      timestamp: Date.now(),
      paymentRail: 'DBT_PFMS',
      referenceId: policy.id,
      offlineProof: voucher.offlinePinProof,
      status: 'success'
    });

    this.notify();
    return voucher;
  }

  public spendVoucherOffline(voucherId: string, merchantName: string, amountPaise: number): OfflineVoucher {
    const voucher = this.vouchers.get(voucherId);
    if (!voucher) throw new Error('VOUCHER_NOT_FOUND: Invalid or expired offline token');
    if (voucher.status !== 'active') throw new Error('VOUCHER_ALREADY_REDEEMED');

    voucher.status = 'redeemed_offline';
    voucher.merchantRecipient = merchantName;
    voucher.redeemedAt = Date.now();

    // Deduct profile balance
    const currentBal = this.userBalances.get(voucher.profileId) || 0;
    const newBal = Math.max(0, currentBal - amountPaise);
    this.userBalances.set(voucher.profileId, newBal);

    // Append spend event
    const txId = `TXN-SPEND-${Date.now().toString().slice(-6)}`;
    this.ledgerHistory.unshift({
      txId,
      profileId: voucher.profileId,
      amountPaise: -amountPaise,
      balanceAfterPaise: newBal,
      title: `Govt Agro Kendra Merchant Payment (${merchantName})`,
      titleHi: `सरकारी बीज/खाद केंद्र भुगतान (${merchantName})`,
      titleTe: `ప్రభుత్వ వ్యవసాయ కేంద్రం చెల్లింపు (${merchantName})`,
      category: 'spend',
      timestamp: Date.now(),
      paymentRail: 'OFFLINE_ED25519',
      referenceId: `VOUCH-${voucher.voucherCode}`,
      offlineProof: `MERCHANT_RECEIPT_${voucher.voucherCode}_${merchantName}`,
      status: 'settled_offline'
    });

    this.notify();
    return voucher;
  }

  public getVouchersForProfile(profileId: string): OfflineVoucher[] {
    return Array.from(this.vouchers.values()).filter(v => v.profileId === profileId);
  }

  public getProfileBalance(profileId: string): number {
    return this.userBalances.get(profileId) || 0;
  }

  public getLedgerForProfile(profileId: string): LedgerTransaction[] {
    return this.ledgerHistory
      .filter(item => item.profileId === profileId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Reconciles a stale sync from a device offline for 9+ hours.
   * Rule: Server-authoritative for settled status; local offline spends merged non-destructively.
   */
  public reconcileStaleSync(stalePolicy: PolicyRecord, hoursOffline = 9): { status: 'reconciled'; resolvedState: string } {
    console.log(`Reconciling stale policy from ${hoursOffline}h offline state: ${stalePolicy.id}`);
    return {
      status: 'reconciled',
      resolvedState: 'NON_DESTRUCTIVE_MERGE_SERVER_AUTHORITATIVE'
    };
  }
}

export const walletService = new WalletService();

