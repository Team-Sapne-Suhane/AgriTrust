import { Crop, RegionGrid, DeclarativeProduct, UserProfile } from '../../types';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user_rameshwar',
    name: 'रामेश्वर पटेल (Rameshwar Patel)',
    nameHi: 'रामेश्वर पटेल',
    nameTe: 'రామేశ్వర్ పటేల్ (Rameshwar Patel)',
    relation: 'Head of Household (Primary Cultivator)',
    relationHi: 'परिवार का मुखिया (मुख्य कृषक)',
    relationTe: 'కుటుంబ పెద్ద (ప్రధాన రైతు)',
    avatar: '👨🏽‍🌾',
    photoUrl: '/rameshwar.jpg',
    pin: '1234',
    walletBalancePaise: 206000,
    phone: '+91 98450 26041',
    aadhaarMasked: 'XXXX-XXXX-8921',
    pmKisanId: 'PMK-AP-2026-904128',
    agriStackFid: 'AGRI-FID-88194-AP',
    khasraNo: '412/08A (Sub-Division 2)',
    landAreaAcres: 2.0,
    bankAccount: '••••••••4819',
    bankName: 'State Bank of India (SBI)',
    ifscCode: 'SBIN0001423',
    dbtStatus: 'active_linked',
    primaryCrop: 'Paddy / Rice (వరి / धान)',
    gender: 'M',
    age: 52,
    nomineeName: 'सुनीता देवी (Sunita Devi)',
    nomineeRelation: 'Spouse (100% Benefit)',
    nomineeRelationHi: 'पत्नी (100% नामित)',
    nomineeRelationTe: 'భార్య (100% నామినీ)',
    rationCardNo: 'NFSA-AP-04918239',
    village: 'రాయచోటి గ్రామం / Rayachoti Village',
    mandal: 'Rayachoti Mandal',
    district: 'Annamayya / Kadapa',
    state: 'Andhra Pradesh'
  },
  {
    id: 'user_sunita',
    name: 'सुनीता देवी (Sunita Devi)',
    nameHi: 'सुनीता देवी',
    nameTe: 'సునీతా దేవి (Sunita Devi)',
    relation: 'Spouse & Co-Cultivator (Mahila Kisan)',
    relationHi: 'सह-कृषक (महिला किसान)',
    relationTe: 'భార్య & సహ-రైతు (మహిళా కిసాన్)',
    avatar: '👩🏽‍🌾',
    photoUrl: '/sunita.png',
    pin: '4321',
    walletBalancePaise: 200000,
    phone: '+91 98450 26042',
    aadhaarMasked: 'XXXX-XXXX-6194',
    pmKisanId: 'PMK-AP-2026-904129',
    agriStackFid: 'AGRI-FID-88195-AP',
    khasraNo: '412/08B (Joint RoR Title)',
    landAreaAcres: 1.5,
    bankAccount: '••••••••9021',
    bankName: 'Andhra Pragathi Grameena Bank (APGB)',
    ifscCode: 'APGB0003011',
    dbtStatus: 'active_linked',
    primaryCrop: 'Groundnut (వేరుశనగ / मूंगफली)',
    gender: 'F',
    age: 48,
    nomineeName: 'रामेश्वर पटेल (Rameshwar Patel)',
    nomineeRelation: 'Husband (100% Benefit)',
    nomineeRelationHi: 'पति (100% नामित)',
    nomineeRelationTe: 'భర్త (100% నామినీ)',
    rationCardNo: 'NFSA-AP-04918239',
    village: 'రాయచోటి గ్రామం / Rayachoti Village',
    mandal: 'Rayachoti Mandal',
    district: 'Annamayya / Kadapa',
    state: 'Andhra Pradesh'
  },
  {
    id: 'user_raghavendra',
    name: 'राघवेंद्र राव (Raghavendra Rao)',
    nameHi: 'राघवेंद्र राव',
    nameTe: 'రాఘవేంద్ర రావు (Raghavendra Rao)',
    relation: 'Progressive Medium Farmer (8.00 Acres RoR)',
    relationHi: 'मध्यम कृषक (8.00 एकड़ RoR)',
    relationTe: 'మధ్య తరహా రైతు (8.00 ఎకరాల RoR)',
    avatar: '👨🏽‍🌾',
    photoUrl: '/images.jpg',
    pin: '5678',
    walletBalancePaise: 350000,
    phone: '+91 98450 26043',
    aadhaarMasked: 'XXXX-XXXX-3418',
    pmKisanId: 'PMK-AP-2026-904130',
    agriStackFid: 'AGRI-FID-88196-AP',
    khasraNo: '308/04B (Full Commercial Plot)',
    landAreaAcres: 8.0,
    bankAccount: '••••••••7732',
    bankName: 'Union Bank of India',
    ifscCode: 'UBIN0532011',
    dbtStatus: 'active_linked',
    primaryCrop: 'Cotton (कपास / పత్తి)',
    gender: 'M',
    age: 45,
    nomineeName: 'लक्ष्मी राव (Lakshmi Rao)',
    nomineeRelation: 'Spouse (100% Benefit)',
    nomineeRelationHi: 'पत्नी (100% नामित)',
    nomineeRelationTe: 'భార్య (100% నామినీ)',
    rationCardNo: 'NFSA-AP-04918240',
    village: 'రాయచోటి గ్రామం / Rayachoti Village',
    mandal: 'Rayachoti Mandal',
    district: 'Annamayya / Kadapa',
    state: 'Andhra Pradesh'
  }
];

export const DEFAULT_CROPS: Crop[] = [
  {
    id: 'crop_paddy',
    nameHi: 'धान / चावल (Paddy)',
    nameEn: 'Paddy / Rice',
    nameTe: 'వరి / బియ్యం (Paddy)',
    icon: '🌾',
    imageUrl: '/paddy.jpg',
    droughtThresholdMm: 35,
    basePremiumPaisePerAcre: 18000, // ₹180
    maxPayoutPaisePerAcre: 1200000,  // ₹12,000
    category: 'kharif',
    season: 'Kharif'
  },
  {
    id: 'crop_wheat',
    nameHi: 'गेहूं (Wheat)',
    nameEn: 'Wheat',
    nameTe: 'గోధుమ (Wheat)',
    icon: '🌱',
    imageUrl: '/Wheat.jpg',
    droughtThresholdMm: 30,
    basePremiumPaisePerAcre: 15000, // ₹150
    maxPayoutPaisePerAcre: 1050000,  // ₹10,500
    category: 'rabi',
    season: 'Rabi'
  },
  {
    id: 'crop_cotton',
    nameHi: 'कपास (Cotton)',
    nameEn: 'Cotton',
    nameTe: 'పత్తి (Cotton)',
    icon: '☁️',
    imageUrl: '/cotton.jpg',
    droughtThresholdMm: 42,
    basePremiumPaisePerAcre: 24000, // ₹240
    maxPayoutPaisePerAcre: 1500000,  // ₹15,000
    category: 'commercial',
    season: 'Kharif'
  },
  {
    id: 'crop_soybean',
    nameHi: 'सोयाबीन (Soybean)',
    nameEn: 'Soybean',
    nameTe: 'సోయాబీన్ (Soybean)',
    icon: '🫘',
    imageUrl: '/soybean.jpg',
    droughtThresholdMm: 38,
    basePremiumPaisePerAcre: 20000, // ₹200
    maxPayoutPaisePerAcre: 1350000,  // ₹13,500
    category: 'pulse_oilseed',
    season: 'Kharif'
  },
  {
    id: 'crop_groundnut',
    nameHi: 'मूंगफली (Groundnut)',
    nameEn: 'Groundnut / Peanut',
    nameTe: 'వేరుశనగ (Groundnut)',
    icon: '🥜',
    imageUrl: '/groundnut.jpg',
    droughtThresholdMm: 32,
    basePremiumPaisePerAcre: 16000, // ₹160
    maxPayoutPaisePerAcre: 1100000,  // ₹11,000
    category: 'pulse_oilseed',
    season: 'Kharif'
  },
  {
    id: 'crop_mustard',
    nameHi: 'सरसों / राई (Mustard)',
    nameEn: 'Mustard / Rapeseed',
    nameTe: 'ఆవాలు (Mustard)',
    icon: '🌼',
    imageUrl: '/mustard.jpg',
    droughtThresholdMm: 28,
    basePremiumPaisePerAcre: 14000, // ₹140
    maxPayoutPaisePerAcre: 1000000,  // ₹10,000
    category: 'pulse_oilseed',
    season: 'Rabi'
  },
  {
    id: 'crop_bajra',
    nameHi: 'बाजरा (Pearl Millet / श्री अन्न)',
    nameEn: 'Bajra (Pearl Millet)',
    nameTe: 'సజ్జలు (Pearl Millet / శ్రీ అన్న)',
    icon: '🌾',
    imageUrl: '/pearl_millet.jpg',
    droughtThresholdMm: 25,
    basePremiumPaisePerAcre: 12000, // ₹120
    maxPayoutPaisePerAcre: 900000,   // ₹9,000
    category: 'millet',
    season: 'Kharif / Shri Anna'
  },
  {
    id: 'crop_jowar',
    nameHi: 'ज्वार (Sorghum / श्री अन्न)',
    nameEn: 'Jowar (Sorghum)',
    nameTe: 'జొన్నలు (Sorghum / శ్రీ అన్న)',
    icon: '🌿',
    imageUrl: '/sorghum.jpg',
    droughtThresholdMm: 28,
    basePremiumPaisePerAcre: 13000, // ₹130
    maxPayoutPaisePerAcre: 950000,   // ₹9,500
    category: 'millet',
    season: 'Kharif / Rabi'
  },
  {
    id: 'crop_maize',
    nameHi: 'मक्का / भुट्टा (Maize)',
    nameEn: 'Maize / Corn',
    nameTe: 'మొక్కజొన్న (Maize)',
    icon: '🌽',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    droughtThresholdMm: 36,
    basePremiumPaisePerAcre: 17000, // ₹170
    maxPayoutPaisePerAcre: 1150000,  // ₹11,500
    category: 'kharif',
    season: 'Kharif / Rabi'
  },
  {
    id: 'crop_chana',
    nameHi: 'चना / छोले (Gram / Chickpea)',
    nameEn: 'Gram / Chickpea (Chana)',
    nameTe: 'శనగలు (Chickpea / Chana)',
    icon: '🍲',
    imageUrl: '/chickpea.jpg',
    droughtThresholdMm: 26,
    basePremiumPaisePerAcre: 15000, // ₹150
    maxPayoutPaisePerAcre: 1000000,  // ₹10,000
    category: 'pulse_oilseed',
    season: 'Rabi'
  },
  {
    id: 'crop_toor',
    nameHi: 'अरहर / तूर दाल (Pigeon Pea)',
    nameEn: 'Toor / Arhar Dal',
    nameTe: 'కందులు / తూర్ దాల్ (Pigeon Pea)',
    icon: '🥣',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    droughtThresholdMm: 34,
    basePremiumPaisePerAcre: 19000, // ₹190
    maxPayoutPaisePerAcre: 1300000,  // ₹13,000
    category: 'pulse_oilseed',
    season: 'Kharif'
  },
  {
    id: 'crop_moong',
    nameHi: 'मूंग दाल (Green Gram)',
    nameEn: 'Moong (Green Gram)',
    nameTe: 'పెసలు / మూంగ్ (Green Gram)',
    icon: '🥗',
    imageUrl: '/green_gram.jpg',
    droughtThresholdMm: 24,
    basePremiumPaisePerAcre: 12500, // ₹125
    maxPayoutPaisePerAcre: 850000,   // ₹8,500
    category: 'pulse_oilseed',
    season: 'Zaid / Kharif'
  },
  {
    id: 'crop_urad',
    nameHi: 'उड़द दाल (Black Gram)',
    nameEn: 'Urad (Black Gram)',
    nameTe: 'మినుములు / ఉద్ది (Black Gram)',
    icon: '🖤',
    imageUrl: '/black_gram.jpg',
    droughtThresholdMm: 27,
    basePremiumPaisePerAcre: 14500, // ₹145
    maxPayoutPaisePerAcre: 980000,   // ₹9,800
    category: 'pulse_oilseed',
    season: 'Kharif'
  },
  {
    id: 'crop_sugarcane',
    nameHi: 'गन्ना (Sugarcane)',
    nameEn: 'Sugarcane',
    nameTe: 'చెరకు (Sugarcane)',
    icon: '🎋',
    imageUrl: '/sugarcane.jpg',
    droughtThresholdMm: 55,
    basePremiumPaisePerAcre: 35000, // ₹350
    maxPayoutPaisePerAcre: 2200000,  // ₹22,000
    category: 'commercial',
    season: 'Annual Cash Crop'
  },
  {
    id: 'crop_sesame',
    nameHi: 'तिल (Sesame / Til)',
    nameEn: 'Sesame / Til',
    nameTe: 'నువ్వులు (Sesame / Til)',
    icon: '✨',
    imageUrl: '/sesame.jpg',
    droughtThresholdMm: 22,
    basePremiumPaisePerAcre: 11000, // ₹110
    maxPayoutPaisePerAcre: 800000,   // ₹8,000
    category: 'pulse_oilseed',
    season: 'Kharif / Semi-Arid'
  }
];

export const DEFAULT_GRIDS: RegionGrid[] = [
  {
    id: 'grid_anantapur_01',
    code: 'AP-ATP-04',
    mandal: 'Raptadu (राप्ताडू)',
    district: 'Anantapur',
    state: 'Andhra Pradesh',
    normalSeasonalMm: 110,
    latitude: 14.62,
    longitude: 77.60
  },
  {
    id: 'grid_mahabubnagar_04',
    code: 'TS-MBN-12',
    mandal: 'Jadcherla (जड़चेरला)',
    district: 'Mahabubnagar',
    state: 'Telangana',
    normalSeasonalMm: 125,
    latitude: 16.76,
    longitude: 78.14
  },
  {
    id: 'grid_solapur_02',
    code: 'MH-SLP-07',
    mandal: 'Karmala (करमाला)',
    district: 'Solapur',
    state: 'Maharashtra',
    normalSeasonalMm: 95,
    latitude: 18.18,
    longitude: 75.19
  },
  {
    id: 'grid_barmer_05',
    code: 'RJ-BMR-02',
    mandal: 'Baytoo (बायतु)',
    district: 'Barmer',
    state: 'Rajasthan',
    normalSeasonalMm: 65,
    latitude: 25.89,
    longitude: 71.77
  },
  {
    id: 'grid_indore_03',
    code: 'MP-IND-09',
    mandal: 'Sanwer (सांवेर)',
    district: 'Indore',
    state: 'Madhya Pradesh',
    normalSeasonalMm: 130,
    latitude: 22.97,
    longitude: 75.82
  },
  {
    id: 'grid_varanasi_02',
    code: 'UP-VNS-15',
    mandal: 'Pindra (पिंडरा)',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    normalSeasonalMm: 155,
    latitude: 25.49,
    longitude: 82.85
  },
  {
    id: 'grid_ludhiana_01',
    code: 'PB-LDH-03',
    mandal: 'Samrala (समराला)',
    district: 'Ludhiana',
    state: 'Punjab',
    normalSeasonalMm: 140,
    latitude: 30.83,
    longitude: 76.19
  },
  {
    id: 'grid_rajkot_01',
    code: 'GJ-RJK-08',
    mandal: 'Gondal (गोंडल)',
    district: 'Rajkot',
    state: 'Gujarat',
    normalSeasonalMm: 85,
    latitude: 21.96,
    longitude: 70.80
  },
  {
    id: 'grid_dharwad_02',
    code: 'KA-DHD-05',
    mandal: 'Hubballi (हुबली ग्रामीण)',
    district: 'Dharwad',
    state: 'Karnataka',
    normalSeasonalMm: 115,
    latitude: 15.36,
    longitude: 75.12
  },
  {
    id: 'grid_patna_03',
    code: 'BR-PAT-11',
    mandal: 'Danapur (दानापुर)',
    district: 'Patna',
    state: 'Bihar',
    normalSeasonalMm: 165,
    latitude: 25.63,
    longitude: 85.04
  }
];

export const INITIAL_PRODUCTS: DeclarativeProduct[] = [
  {
    id: 'prod_paddy_monsoon_2026',
    code: 'PAD-MON-26',
    name: 'Kharif Paddy Rainfall Index Cover (खरीफ धान वर्षा सूचकांक)',
    cropId: 'crop_paddy',
    gridId: 'grid_anantapur_01',
    thresholdMm: 35,
    maxPayoutPaise: 1200000, // ₹12,000
    premiumPaise: 18000,     // ₹180
    season: 'Kharif 2026',
    oracleWeights: {
      awsGround: 0.35,
      imdRadar: 0.35,
      chirpsSat: 0.30
    },
    payoutCurveType: 'step_binary',
    active: true,
    version: 1,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'prod_cotton_drought_shield',
    code: 'COT-SHIELD-26',
    name: 'Kharif Cotton Deficit Shield (कपास सूखा सुरक्षा)',
    cropId: 'crop_cotton',
    gridId: 'grid_mahabubnagar_04',
    thresholdMm: 42,
    maxPayoutPaise: 1500000, // ₹15,000
    premiumPaise: 24000,     // ₹240
    season: 'Kharif 2026',
    oracleWeights: {
      awsGround: 0.40,
      imdRadar: 0.30,
      chirpsSat: 0.30
    },
    payoutCurveType: 'step_binary',
    active: true,
    version: 1,
    createdAt: Date.now() - 43200000
  }
];
