import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Leaf, Car, Building2, Utensils, Coffee, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, Upload, Sparkles, CreditCard, ChevronRight, 
  ArrowRight, Info, RefreshCw, X, ShieldAlert, Check, Camera, MapPin, 
  Landmark, Eye
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';

const SPRING = { type: 'spring', stiffness: 360, damping: 26 };

// Demo preset photos for quick one-click presentation testing
const DEMO_PROOF_PRESETS_ECO = [
  {
    name: '🛺 Ayodhya E-Rickshaw Ride',
    url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    vehicleType: 'E-Rickshaw',
    vehicleNumber: 'UP-42-ER-6622',
    fare: 100
  },
  {
    name: '⚡ EV Green Cab Ride',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    vehicleType: 'Electric Cab',
    vehicleNumber: 'UP-42-EV-3311',
    fare: 650
  },
  {
    name: '🚌 Solar Electric Bus Ticket',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    vehicleType: 'Electric Bus',
    vehicleNumber: 'UP-42-EB-9944',
    fare: 40
  }
];

const DEMO_PROOF_PRESETS_PARTNER = [
  {
    name: '🏨 Hotel Grand Ayodhya Reception',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    partnerId: 'part_01',
    city: 'Ayodhya',
    state: 'Uttar Pradesh'
  },
  {
    name: '🌿 Sarayu Eco Resort Check-in',
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
    partnerId: 'part_02',
    city: 'Ayodhya',
    state: 'Uttar Pradesh'
  },
  {
    name: '☕ Taj View Cafe Dining',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    partnerId: 'part_03',
    city: 'Agra',
    state: 'Uttar Pradesh'
  },
  {
    name: '🍲 Royal Awadh Pure Veg Dinner',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    partnerId: 'part_04',
    city: 'Ayodhya',
    state: 'Uttar Pradesh'
  },
  {
    name: '🍲 Kashi Organic Thali Heritage',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    partnerId: 'part_05',
    city: 'Varanasi',
    state: 'Uttar Pradesh'
  }
];

const DEMO_PROOF_PRESETS_TOURIST = [
  {
    name: '🕌 Taj Mahal, Agra',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    placeName: 'Taj Mahal',
    city: 'Agra',
    state: 'Uttar Pradesh',
    placeCategory: 'Heritage Site'
  },
  {
    name: '🛕 Mahakaleshwar Temple, Ujjain',
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80',
    placeName: 'Mahakaleshwar Temple',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    placeCategory: 'Religious Place'
  },
  {
    name: '🛕 Kashi Vishwanath, Varanasi',
    url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80',
    placeName: 'Kashi Vishwanath Temple',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    placeCategory: 'Religious Place'
  }
];

// Default demo partners available instantly even before or without backend API response
// Default demo partners available instantly even before or without backend API response
const DEFAULT_PARTNERS = [
  {
    id: 'part_01',
    name: 'Hotel Grand Ayodhya Heritage',
    type: 'HOTEL',
    location: 'Ayodhya',
    address: 'Ram Path, Near Circuit House, Ayodhya, UP',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.8,
    contactPhone: '+91 98765 43210',
    description: 'Solar-powered eco-heritage hotel on the sacred Ram Path corridor.',
    discountPolicy: [
      { coins: 10, discountPercent: 2 },
      { coins: 25, discountPercent: 5 },
      { coins: 50, discountPercent: 10 },
      { coins: 100, discountPercent: 20 }
    ],
    maximumDiscount: 20
  },
  {
    id: 'part_02',
    name: 'Sarayu Riverfront Eco Resort',
    type: 'HOTEL',
    location: 'Ayodhya',
    address: 'Guptar Ghat Road, Ayodhya, UP',
    status: 'ACTIVE',
    rewardCoins: 2,
    isSpecialEco: true,
    rating: 4.9,
    contactPhone: '+91 98765 43211',
    description: 'Certified 0-waste luxury eco-resort on the tranquil banks of River Sarayu.',
    discountPolicy: [
      { coins: 10, discountPercent: 2 },
      { coins: 25, discountPercent: 5 },
      { coins: 50, discountPercent: 8 },
      { coins: 100, discountPercent: 15 }
    ],
    maximumDiscount: 15
  },
  {
    id: 'part_03',
    name: 'Taj View Eco Bistro & Cafe',
    type: 'CAFE',
    location: 'Agra',
    address: 'Taj East Gate Road, Agra, UP',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.7,
    contactPhone: '+91 98765 43212',
    description: 'Panoramic rooftop view of Taj Mahal with organic farm-to-table beverages.',
    discountPolicy: [
      { coins: 10, discountPercent: 1 },
      { coins: 25, discountPercent: 3 },
      { coins: 50, discountPercent: 5 }
    ],
    maximumDiscount: 5
  },
  {
    id: 'part_04',
    name: 'Royal Awadh Dining & Pure Veg',
    type: 'RESTAURANT',
    location: 'Ayodhya',
    address: 'Civil Lines, Ayodhya, UP',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.6,
    contactPhone: '+91 98765 43213',
    description: 'Authentic Satvik Awadhi delicacies cooked with organic ingredients.',
    discountPolicy: [
      { coins: 10, discountPercent: 1 },
      { coins: 25, discountPercent: 4 },
      { coins: 50, discountPercent: 7 },
      { coins: 100, discountPercent: 10 }
    ],
    maximumDiscount: 10
  },
  {
    id: 'part_05',
    name: 'Kashi Organic Thali Heritage',
    type: 'RESTAURANT',
    location: 'Varanasi',
    address: 'Assi Ghat Road, Varanasi, UP',
    status: 'ACTIVE',
    rewardCoins: 2,
    isSpecialEco: true,
    rating: 4.8,
    contactPhone: '+91 98765 43214',
    description: 'Traditional multi-course Banarasi Thali using locally farmed millets and solar kitchen.',
    discountPolicy: [
      { coins: 10, discountPercent: 3 },
      { coins: 25, discountPercent: 6 },
      { coins: 50, discountPercent: 12 },
      { coins: 100, discountPercent: 18 }
    ],
    maximumDiscount: 18
  },
  {
    id: 'part_06',
    name: 'Brahmaputra Breeze Green Cafe',
    type: 'CAFE',
    location: 'Guwahati',
    address: 'MG Road, Riverside Walk, Guwahati, Assam',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.5,
    contactPhone: '+91 98765 43215',
    description: 'Eco-friendly tea lounge serving indigenous organic Assam green teas.',
    discountPolicy: [
      { coins: 10, discountPercent: 2 },
      { coins: 25, discountPercent: 4 },
      { coins: 50, discountPercent: 8 }
    ],
    maximumDiscount: 8
  },
  {
    id: 'part_07',
    name: 'Himalayan Pine Valley Hotel',
    type: 'HOTEL',
    location: 'Katra',
    address: 'Katra Main Road, Katra, Jammu & Kashmir',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.7,
    contactPhone: '+91 98765 43216',
    description: 'Eco-certified pilgrim hotel with renewable water heating and mountain views.',
    discountPolicy: [
      { coins: 10, discountPercent: 2 },
      { coins: 25, discountPercent: 5 },
      { coins: 50, discountPercent: 10 },
      { coins: 100, discountPercent: 20 }
    ],
    maximumDiscount: 20
  }
];

// Rich demo submissions history ensuring history tab is never empty
const DEFAULT_HISTORY = [
  {
    id: 'gr_h01',
    touristId: 'TID-1035',
    touristName: 'Ananya Mishra',
    activityType: 'ECO_VEHICLE',
    vehicleType: 'Electric Cab',
    vehicleNumber: 'UP-42-EV-1001',
    farePaid: 650,
    status: 'APPROVED',
    coins: 2,
    sourceCategory: 'Eco Travel',
    proofImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString(),
    verifiedBy: 'S.A.F.A.R. Central Command (Dr. Ananya Sharma)'
  },
  {
    id: 'gr_h02',
    touristId: 'TID-1035',
    touristName: 'Ananya Mishra',
    activityType: 'PARTNER_HOTEL',
    partnerId: 'part_01',
    partnerName: 'Hotel Grand Ayodhya Heritage',
    partnerType: 'HOTEL',
    status: 'APPROVED',
    coins: 1,
    sourceCategory: 'Partner Hotels',
    proofImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 2 * 86400000 + 4000000).toISOString(),
    verifiedBy: 'S.A.F.A.R. Desk (Insp. Bikram Gogoi)'
  },
  {
    id: 'gr_h03',
    touristId: 'TID-1035',
    touristName: 'Ananya Mishra',
    activityType: 'TOURIST_PLACE',
    placeName: 'Taj Mahal',
    placeLocation: 'Agra, Uttar Pradesh',
    placeCategory: 'Heritage Site',
    status: 'APPROVED',
    coins: 3,
    sourceCategory: 'Tourist Places',
    proofImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    verifiedAt: new Date(Date.now() - 1 * 86400000 + 1800000).toISOString(),
    verifiedBy: 'S.A.F.A.R. Authority Desk (Heritage Wing)'
  },
  {
    id: 'gr_h04',
    touristId: 'TID-1035',
    touristName: 'Ananya Mishra',
    activityType: 'ECO_VEHICLE',
    vehicleType: 'E-Rickshaw',
    vehicleNumber: 'UP-42-ER-6622',
    farePaid: 100,
    status: 'APPROVED',
    coins: 1,
    sourceCategory: 'Eco Travel',
    proofImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    submittedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    verifiedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    verifiedBy: 'S.A.F.A.R. Authority Desk (Ayodhya Urban)'
  },
  {
    id: 'gr_h05',
    touristId: 'TID-1035',
    touristName: 'Ananya Mishra',
    activityType: 'TOURIST_PLACE',
    placeName: 'Mahakaleshwar Temple',
    placeLocation: 'Ujjain, Madhya Pradesh',
    placeCategory: 'Religious Place',
    status: 'PENDING',
    coins: 0,
    sourceCategory: 'Tourist Places',
    proofImage: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80',
    taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
    submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    verifiedAt: null,
    verifiedBy: null
  }
];

const DEFAULT_WALLET = {
  totalCoins: 27,
  availableDiscountTier: 10,
  lifetimeEarned: 27,
  spentCoins: 0,
  earnedFrom: {
    ecoTravel: 15,
    partnerHotels: 7,
    restaurants: 3,
    cafes: 2,
    touristPlaces: 0
  }
};

// Payment Methods for the Pay at Partner modal
const PAYMENT_METHODS = [
  { id: 'UPI / QR Code', label: 'UPI / QR Code', emoji: '📱', color: '#7C3AED', bg: 'rgba(124,58,237,0.07)', desc: 'Scan & Pay via any UPI app' },
  { id: 'PayTM', label: 'PayTM', emoji: '🔵', color: '#00BAF2', bg: 'rgba(0,186,242,0.07)', desc: 'Pay via PayTM Wallet' },
  { id: 'Google Pay', label: 'Google Pay', emoji: '🟢', color: '#34A853', bg: 'rgba(52,168,83,0.07)', desc: 'Pay via Google Pay (GPay)' },
  { id: 'PhonePe', label: 'PhonePe', emoji: '💜', color: '#5F259F', bg: 'rgba(95,37,159,0.07)', desc: 'Pay via PhonePe UPI' },
  { id: 'Debit / Credit Card', label: 'Debit / Credit Card', emoji: '💳', color: '#1C1C1E', bg: 'rgba(0,0,0,0.04)', desc: 'Visa, Mastercard, RuPay' },
  { id: 'Net Banking', label: 'Net Banking', emoji: '🏦', color: '#0A84FF', bg: 'rgba(10,132,255,0.07)', desc: 'Direct bank transfer' },
];

export default function GreenRewardsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'submit'; // 'submit' | 'directory' | 'history'

  const [activeTab, setActiveTab] = useState(initialTab);
  const [submissionOption, setSubmissionOption] = useState('ECO'); // 'ECO' | 'PARTNER' | 'TOURIST'
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'ECO' | 'PARTNER' | 'TOURIST'
  const [previewPhotoModal, setPreviewPhotoModal] = useState(null);

  // User state
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('safar_user');
      return stored ? JSON.parse(stored) : { touristId: 'TID-1035', name: 'Ananya Mishra' };
    } catch {
      return { touristId: 'TID-1035', name: 'Ananya Mishra' };
    }
  });

  const activeTid = currentUser?.touristId || 'TID-1035';

  // Data states
  const [wallet, setWallet] = useState(DEFAULT_WALLET);
  const [partners, setPartners] = useState(DEFAULT_PARTNERS);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('safar_rewards_history');
      return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
    } catch {
      return DEFAULT_HISTORY;
    }
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Form State - Option 1: Eco Vehicle
  const [ecoForm, setEcoForm] = useState({
    vehicleType: 'E-Rickshaw',
    vehicleNumber: '',
    farePaid: '',
    proofImage: '',
    notes: ''
  });

  // Form State - Option 2: Partner Visit (pre-selected with default demo partner)
  const [partnerForm, setPartnerForm] = useState({
    partnerId: 'part_01',
    proofImage: '',
    notes: '',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    taggedAuthorityDesk: false,
    taggedPlaceName: true
  });

  // Form State - Option 3: Tourist Place (city + state as separate mandatory fields)
  const [touristPlaceForm, setTouristPlaceForm] = useState({
    placeName: '',
    city: '',
    state: '',
    placeCategory: 'Heritage Site',
    proofImage: '',
    taggedAuthorityDesk: false,
    taggedPlaceName: false,
    notes: ''
  });
  const [publicGallery, setPublicGallery] = useState([]);

  useEffect(() => {
    fetchInitialPageData();
  }, [activeTid]);

  const fetchInitialPageData = async () => {
    try {
      setLoading(true);

      const fetchJson = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      };

      const [dataW, dataP, dataH, dataG] = await Promise.all([
        fetchJson(`/api/rewards/wallet/${activeTid}`),
        fetchJson('/api/rewards/partners'),
        fetchJson(`/api/rewards/history/${activeTid}`),
        fetchJson('/api/rewards/public-gallery')
      ]);

      if (dataW && dataW.success) setWallet(dataW.wallet);
      if (dataP && dataP.success && dataP.partners && dataP.partners.length > 0) {
        setPartners(dataP.partners);
        if (!partnerForm.partnerId) {
          setPartnerForm((prev) => ({ ...prev, partnerId: dataP.partners[0].id }));
        }
      }
      if (dataH && dataH.success) setHistory(dataH.history);
      if (dataG && dataG.success) setPublicGallery(dataG.gallery || []);
    } catch (err) {
      console.error('Fetch Page Data Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle image file upload (convert to Base64 data URL)
  const handleFileUpload = (e, targetForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      if (targetForm === 'ECO') {
        setEcoForm((prev) => ({ ...prev, proofImage: dataUrl }));
      } else if (targetForm === 'TOURIST') {
        setTouristPlaceForm((prev) => ({ ...prev, proofImage: dataUrl }));
      } else {
        setPartnerForm((prev) => ({ ...prev, proofImage: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Activity 1: Eco Vehicle
  // Submit Activity 1: Eco Vehicle
  const handleSubmitEco = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);
    setSubmissionNotice(null);

    if (!ecoForm.proofImage) {
      setSubmissionError('Please select or upload a proof photograph of the vehicle / journey.');
      setSubmitting(false);
      return;
    }

    const payload = {
      touristId: activeTid,
      activityType: 'ECO_VEHICLE',
      vehicleType: ecoForm.vehicleType,
      vehicleNumber: ecoForm.vehicleNumber,
      farePaid: Number(ecoForm.farePaid) || 0,
      proofImage: ecoForm.proofImage,
      notes: ecoForm.notes
    };

    try {
      const res = await fetch('/api/rewards/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        setSubmissionError(data.error || 'Failed to submit eco-travel proof');
      } else {
        setSubmissionNotice('✓ Proof submitted to SAFAR Authority Desk! Photograph saved in backend database.');
        setEcoForm({ vehicleType: 'E-Rickshaw', vehicleNumber: '', farePaid: '', proofImage: '', notes: '' });
        fetchInitialPageData();
      }
    } catch (err) {
      // Graceful offline fallback: persist locally and credit reward
      const localId = `gr_local_${Date.now()}`;
      const localItem = {
        id: localId,
        touristId: activeTid,
        activityType: 'ECO_VEHICLE',
        vehicleType: ecoForm.vehicleType,
        vehicleNumber: ecoForm.vehicleNumber,
        farePaid: Number(ecoForm.farePaid) || 0,
        status: 'PENDING',
        coins: 1,
        sourceCategory: 'Eco Travel',
        proofImage: ecoForm.proofImage,
        submittedAt: new Date().toISOString(),
        verifiedAt: null,
        verifiedBy: null
      };
      setHistory((prev) => {
        const updated = [localItem, ...prev];
        try { localStorage.setItem('safar_rewards_history', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setSubmissionNotice('✓ Proof submitted & photo saved! Status is PENDING verification.');
      setEcoForm({ vehicleType: 'E-Rickshaw', vehicleNumber: '', farePaid: '', proofImage: '', notes: '' });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Activity 2: Partner Visit
  const handleSubmitPartner = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);
    setSubmissionNotice(null);

    if (!partnerForm.partnerId) {
      setSubmissionError('Please select a SAFAR Partner establishment.');
      setSubmitting(false);
      return;
    }

    // Mandatory 4-tag validation
    if (!partnerForm.taggedPlaceName) {
      setSubmissionError('🔴 Tag 1 Required: You must confirm tagging the place/hotel name before uploading.');
      setSubmitting(false);
      return;
    }
    if (!partnerForm.taggedAuthorityDesk) {
      setSubmissionError('🔴 Tag 2 Required: You must tag @SAFAR Central Command Authority Desk before uploading.');
      setSubmitting(false);
      return;
    }
    if (!partnerForm.city || partnerForm.city.trim().length < 2) {
      setSubmissionError('🔴 Tag 3 Required: City name is mandatory before uploading the photo.');
      setSubmitting(false);
      return;
    }
    if (!partnerForm.state || partnerForm.state.trim().length < 2) {
      setSubmissionError('🔴 Tag 4 Required: State name is mandatory before uploading the photo.');
      setSubmitting(false);
      return;
    }

    if (!partnerForm.proofImage) {
      setSubmissionError('Please select or upload a visit photograph at the partner establishment.');
      setSubmitting(false);
      return;
    }

    const selectedPartner = partners.find((p) => p.id === partnerForm.partnerId);
    const payload = {
      touristId: activeTid,
      activityType: selectedPartner?.type === 'HOTEL' ? 'PARTNER_HOTEL'
        : selectedPartner?.type === 'RESTAURANT' ? 'PARTNER_RESTAURANT' : 'PARTNER_CAFE',
      partnerId: partnerForm.partnerId,
      proofImage: partnerForm.proofImage,
      taggedAuthorityDesk: partnerForm.taggedAuthorityDesk,
      taggedPlaceName: partnerForm.taggedPlaceName,
      notes: `City: ${partnerForm.city}, State: ${partnerForm.state}. ${partnerForm.notes}`.trim()
    };

    try {
      const res = await fetch('/api/rewards/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        setSubmissionError(data.error || 'Failed to submit partner visit proof');
      } else {
        setSubmissionNotice(`✓ Visit proof for ${selectedPartner?.name} submitted with all 4 tags! Saved to backend.`);
        setPartnerForm((prev) => ({ ...prev, proofImage: '', notes: '' }));
        fetchInitialPageData();
      }
    } catch (err) {
      const localId = `gr_local_${Date.now()}`;
      const localItem = {
        id: localId,
        touristId: activeTid,
        activityType: payload.activityType,
        partnerId: partnerForm.partnerId,
        partnerName: selectedPartner?.name,
        partnerType: selectedPartner?.type,
        status: 'PENDING',
        coins: selectedPartner?.rewardCoins || 1,
        sourceCategory: 'Partner Visit',
        proofImage: partnerForm.proofImage,
        submittedAt: new Date().toISOString(),
        verifiedAt: null,
        verifiedBy: null
      };
      setHistory((prev) => {
        const updated = [localItem, ...prev];
        try { localStorage.setItem('safar_rewards_history', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setSubmissionNotice(`✓ Visit proof for ${selectedPartner?.name} submitted with all 4 tags! Status is PENDING verification.`);
      setPartnerForm((prev) => ({ ...prev, proofImage: '', notes: '' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTouristPlace = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);
    setSubmissionNotice(null);

    // 1. Mandatory Place Name validation
    if (!touristPlaceForm.placeName || touristPlaceForm.placeName.trim().length < 3) {
      setSubmissionError('🔴 Tag 1 Required: Tourist place name is required (minimum 3 characters).');
      setSubmitting(false);
      return;
    }

    // 2. Mandatory Authority Desk tagging
    if (!touristPlaceForm.taggedAuthorityDesk) {
      setSubmissionError('🔴 Tag 2 Required: You must tag @SAFAR Central Command Authority Desk before uploading.');
      setSubmitting(false);
      return;
    }

    // 3. Mandatory City validation
    if (!touristPlaceForm.city || touristPlaceForm.city.trim().length < 2) {
      setSubmissionError('🔴 Tag 3 Required: City is mandatory before uploading the photo.');
      setSubmitting(false);
      return;
    }

    // 4. Mandatory State validation
    if (!touristPlaceForm.state || touristPlaceForm.state.trim().length < 2) {
      setSubmissionError('🔴 Tag 4 Required: State is mandatory before uploading the photo.');
      setSubmitting(false);
      return;
    }

    // 5. Mandatory Place Name Tagging
    if (!touristPlaceForm.taggedPlaceName) {
      setSubmissionError('Compulsory user tagging required: You must confirm tagging the Tourist Place before uploading.');
      setSubmitting(false);
      return;
    }

    // 6. Mandatory Photo validation
    if (!touristPlaceForm.proofImage || !touristPlaceForm.proofImage.trim()) {
      setSubmissionError('Photo upload required: Please select or upload a photograph of the tourist place.');
      setSubmitting(false);
      return;
    }

    const combinedLocation = `${touristPlaceForm.city.trim()}, ${touristPlaceForm.state.trim()}`;
    const payload = {
      touristId: activeTid,
      activityType: 'TOURIST_PLACE',
      placeName: touristPlaceForm.placeName.trim(),
      placeLocation: combinedLocation,
      placeCategory: touristPlaceForm.placeCategory,
      proofImage: touristPlaceForm.proofImage,
      taggedAuthorityDesk: touristPlaceForm.taggedAuthorityDesk,
      taggedPlaceName: touristPlaceForm.taggedPlaceName,
      notes: touristPlaceForm.notes
    };

    try {
      const res = await fetch('/api/rewards/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        setSubmissionError(data.error || 'Upload failed: The photo was not accepted.');
      } else {
        setSubmissionNotice('✓ Tourist place photo submitted with all 4 mandatory tags! Photograph saved in backend database and published to gallery.');
        setTouristPlaceForm({
          placeName: '',
          city: '',
          state: '',
          placeCategory: 'Heritage Site',
          proofImage: '',
          taggedAuthorityDesk: false,
          taggedPlaceName: false,
          notes: ''
        });
        fetchInitialPageData();
      }
    } catch (err) {
      const localId = `gr_local_${Date.now()}`;
      const localItem = {
        id: localId,
        touristId: activeTid,
        activityType: 'TOURIST_PLACE',
        placeName: touristPlaceForm.placeName.trim(),
        placeLocation: combinedLocation,
        placeCategory: touristPlaceForm.placeCategory,
        status: 'PENDING',
        coins: 2,
        sourceCategory: 'Tourist Places',
        proofImage: touristPlaceForm.proofImage,
        submittedAt: new Date().toISOString(),
        verifiedAt: null,
        verifiedBy: null
      };
      setHistory((prev) => {
        const updated = [localItem, ...prev];
        try { localStorage.setItem('safar_rewards_history', JSON.stringify(updated)); } catch {}
        return updated;
      });
      setSubmissionNotice('✓ Tourist place photo submitted with all 4 mandatory tags! Saved locally & queued for SAFAR Authority Verification.');
      setTouristPlaceForm({
        placeName: '',
        city: '',
        state: '',
        placeCategory: 'Heritage Site',
        proofImage: '',
        taggedAuthorityDesk: false,
        taggedPlaceName: false,
        notes: ''
      });
    } finally {
      setSubmitting(false);
    }
  };
  const selectedPartnerObj = partners.find((p) => p.id === partnerForm.partnerId);

  // Computed: form completion guards (all 4 mandatory tags must be confirmed before photo upload allowed)
  const isPartnerFormComplete = Boolean(
    partnerForm.partnerId &&
    partnerForm.taggedPlaceName &&
    partnerForm.taggedAuthorityDesk &&
    partnerForm.city.trim().length >= 2 &&
    partnerForm.state.trim().length >= 2
  );
  const isTouristFormComplete = Boolean(
    touristPlaceForm.placeName.trim().length >= 3 &&
    touristPlaceForm.taggedAuthorityDesk &&
    touristPlaceForm.city.trim().length >= 2 &&
    touristPlaceForm.state.trim().length >= 2 &&
    touristPlaceForm.taggedPlaceName
  );

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      
      {/* Hero Header */}
      <div 
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden border shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(236, 253, 245, 0.98) 0%, rgba(255, 255, 255, 0.98) 55%, rgba(240, 253, 250, 0.98) 100%)',
          borderColor: 'rgba(52, 199, 89, 0.35)',
          boxShadow: '0 12px 40px rgba(52, 199, 89, 0.12)'
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ECO-TOURISM INITIATIVE
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Ministry of Tourism · Govt of India
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Leaf className="w-7 h-7 text-emerald-600 inline shrink-0" />
              <span>SAFAR Green Rewards Ecosystem</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Earn Green Coins by choosing eco-friendly transport (E-Rickshaw, EV Cabs, Electric Buses), visiting verified SAFAR Partner hotels/cafes, and uploading verified photos of iconic tourist places. Accumulate coins to unlock up to 40% discount on partner checkouts.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setSelectedPaymentMethod(null); setShowPaymentModal(true); }}
            className="px-5 py-3 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex items-center space-x-2 shrink-0 transition-all"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Pay at Partner with Discount</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Prominent Green Wallet Card */}
      <div className="rounded-3xl p-5 sm:p-7 bg-white border border-emerald-200 shadow-lg space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Your Green Wallet</h2>
                <span className="text-[10px] font-bold text-slate-500 font-mono">({activeTid})</span>
              </div>
              <p className="text-xs text-slate-500">Accumulated verified eco-rewards and partner visits</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eligible Tier</span>
              <span className="text-2xl font-black text-blue-700 font-mono">
                {wallet?.availableDiscountTier || 5}% OFF
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Coins</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                {wallet?.totalCoins || 27}
              </span>
            </div>
          </div>
        </div>

        {/* Source Breakdown Cards */}
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
            Reward Point Sources (Distinguished Breakdown)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block flex items-center space-x-1">
                  <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Eco Travel</span>
                </span>
                <span className="text-[10px] text-slate-400">EVs, E-Rickshaws</span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-800">
                +{wallet?.earnedFrom?.ecoTravel || 15}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Partner Hotels</span>
                </span>
                <span className="text-[10px] text-slate-400">Verified Stays</span>
              </div>
              <span className="text-lg font-black font-mono text-indigo-800">
                +{wallet?.earnedFrom?.partnerHotels || 7}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-amber-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block flex items-center space-x-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Restaurants</span>
                </span>
                <span className="text-[10px] text-slate-400">Organic Dining</span>
              </div>
              <span className="text-lg font-black font-mono text-amber-800">
                +{wallet?.earnedFrom?.restaurants || 3}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-orange-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-600 block flex items-center space-x-1">
                  <Coffee className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Cafes</span>
                </span>
                <span className="text-[10px] text-slate-400">Eco Bistro Visits</span>
              </div>
              <span className="text-lg font-black font-mono text-orange-800">
                +{wallet?.earnedFrom?.cafes || 2}
              </span>
            </div>
          </div>
        </div>

        {/* Tier Ladder Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Green Coin Tier Progression:</span>
            <span className="text-emerald-800 font-mono">Maximum Green Coin Discount: 40% (Minimum Payable: 60%)</span>
          </div>
          <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
            <div className={`p-1 rounded ${wallet?.totalCoins >= 1 ? 'bg-emerald-200 font-bold text-emerald-900' : 'bg-white text-slate-400'}`}>1–9: 2%</div>
            <div className={`p-1 rounded ${wallet?.totalCoins >= 10 ? 'bg-emerald-200 font-bold text-emerald-900' : 'bg-white text-slate-400'}`}>10–24: 5%</div>
            <div className={`p-1 rounded ${wallet?.totalCoins >= 25 ? 'bg-emerald-300 font-black text-emerald-950 ring-2 ring-emerald-500' : 'bg-white text-slate-400'}`}>25–49: 10% ★</div>
            <div className={`p-1 rounded ${wallet?.totalCoins >= 50 ? 'bg-emerald-200 font-bold text-emerald-900' : 'bg-white text-slate-400'}`}>50–74: 20%</div>
            <div className={`p-1 rounded ${wallet?.totalCoins >= 75 ? 'bg-emerald-200 font-bold text-emerald-900' : 'bg-white text-slate-400'}`}>75–99: 30%</div>
            <div className={`p-1 rounded ${wallet?.totalCoins >= 100 ? 'bg-emerald-200 font-bold text-emerald-900' : 'bg-white text-slate-400'}`}>100+: 40%</div>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-medium">
            Core Business Rule: Maximum Green Coin Discount is 40% (Minimum payable is always at least 60% of bill, unless partner offers an independent special promotion).
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center space-x-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'submit'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Submit Proof for Rewards</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'directory'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Partner Directory & Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'history'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Reward Submission History</span>
        </button>
      </div>

      {/* Notices */}
      {submissionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{submissionNotice}</span>
          </div>
          <button onClick={() => setSubmissionNotice(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {submissionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{submissionError}</span>
          </div>
          <button onClick={() => setSubmissionError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TAB 1: SUBMIT PROOF (Unified Option 1 & Option 2) */}
      {activeTab === 'submit' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-lg space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Green Reward Proof Submission</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your activity below and submit verification evidence to the SAFAR Authority Desk.
            </p>
          </div>

          {/* Switch between Option 1 (Eco Vehicle), Option 2 (Partner Visit), Option 3 (Tourist Places) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setSubmissionOption('ECO')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                submissionOption === 'ECO'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Option 1 — Eco-Friendly Travel</span>
            </button>

            <button
              onClick={() => setSubmissionOption('PARTNER')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                submissionOption === 'PARTNER'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Option 2 — SAFAR Partner Visit</span>
            </button>

            <button
              onClick={() => setSubmissionOption('TOURIST')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                submissionOption === 'TOURIST'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Option 3 — Tourist Places Photo</span>
            </button>
          </div>

          {/* ================= OPTION 1: ECO-VEHICLE FORM ================= */}
          {submissionOption === 'ECO' && (
            <form onSubmit={handleSubmitEco} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900">
                  <strong>How it works:</strong> Travel via E-Rickshaw, E-Auto, Electric Cab, or Electric Bus. Pay the normal journey fare, then upload proof of your journey or vehicle. Authority verifies and awards Green Coins directly into your Green Wallet!
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Eco-Friendly Vehicle Type</label>
                  <select
                    value={ecoForm.vehicleType}
                    onChange={(e) => setEcoForm({ ...ecoForm, vehicleType: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="E-Rickshaw">🛺 E-Rickshaw (+1 Green Coin)</option>
                    <option value="E-Auto">🛺 E-Auto (+1 Green Coin)</option>
                    <option value="Electric Cab">⚡ Electric Cab (+2 Green Coins)</option>
                    <option value="Electric Bus">🚌 Electric Bus (+1 Green Coin)</option>
                    <option value="Other EV">🌱 Other Approved EV (+1 Green Coin)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., UP-42-ER-8812"
                    value={ecoForm.vehicleNumber}
                    onChange={(e) => setEcoForm({ ...ecoForm, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fare Paid for Journey (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 150"
                    value={ecoForm.farePaid}
                    onChange={(e) => setEcoForm({ ...ecoForm, farePaid: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Important: Normal fare is paid. Green Coins are awarded to your wallet upon verification.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tagged Authority Desk</label>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-blue-700 font-bold flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>S.A.F.A.R. Central Command Desk</span>
                  </div>
                </div>
              </div>

              {/* Photo Proof Upload & Presets */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Upload Photograph / Journey Proof
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50 flex flex-col items-center justify-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">Click to select photo from device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'ECO')}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 cursor-pointer"
                    />
                  </div>

                  {/* Preset Demo Photos */}
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Quick Demo Photos:</span>
                    {DEMO_PROOF_PRESETS_ECO.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setEcoForm((prev) => ({
                            ...prev,
                            proofImage: preset.url,
                            vehicleType: preset.vehicleType,
                            vehicleNumber: preset.vehicleNumber,
                            farePaid: preset.fare
                          }));
                        }}
                        className="w-full text-left p-1.5 rounded-lg text-[11px] font-semibold bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 truncate transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {ecoForm.proofImage && (
                  <div className="mt-2 flex items-center space-x-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <img src={ecoForm.proofImage} alt="Selected Proof" className="w-16 h-12 rounded-lg object-cover" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-800 block">Photograph Attached</span>
                      <span className="text-[10px] text-emerald-600">SHA-256 hash will be computed for duplicate check</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Eco-Travel for Authority Verification</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= OPTION 2: PARTNER VISIT FORM ================= */}
          {submissionOption === 'PARTNER' && (
            <form onSubmit={handleSubmitPartner} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-indigo-900">
                  <strong>How it works:</strong> Visit an official SAFAR certified hotel, cafe, or restaurant. Complete all <strong>4 mandatory tags</strong> (Place/Hotel Name, SAFAR Authority Desk, City, State) first — then upload your visit photograph. All 4 tags are strictly required before photo upload is enabled.
                </div>
              </div>

              {/* Partner Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select SAFAR Partner Establishment <span className="text-red-500">*</span></label>
                <select
                  value={partnerForm.partnerId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const pObj = partners.find((p) => p.id === pid);
                    const city = pObj?.location || '';
                    let state = 'Uttar Pradesh';
                    if (city === 'Guwahati') state = 'Assam';
                    else if (city === 'Katra' || city === 'Jammu') state = 'Jammu & Kashmir';
                    setPartnerForm((prev) => ({
                      ...prev,
                      partnerId: pid,
                      city: city || prev.city,
                      state: state || prev.state,
                      taggedPlaceName: Boolean(pid)
                    }));
                  }}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location} · {p.type}) {p.isSpecialEco ? '🌿 (+2 Coins)' : '🌱 (+1 Coin)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* ─── 4 MANDATORY TAGS SECTION ─── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-dashed border-red-300 space-y-3.5">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-xs font-black text-red-800 uppercase tracking-wide">4 Mandatory Tags — All Required Before Photo Upload</span>
                </div>

                {/* Tag 1: Place/Hotel Name (confirm from selection) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">🏨 Tag 1 — Confirm Place / Hotel Name <span className="text-red-500">*</span></label>
                  <label className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${partnerForm.taggedPlaceName ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-slate-300 hover:border-indigo-300'}`}>
                    <input
                      type="checkbox"
                      checked={partnerForm.taggedPlaceName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, taggedPlaceName: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-indigo-800 truncate">
                      ✓ Tag: @{selectedPartnerObj?.name || 'Select a partner above'}
                    </span>
                    {partnerForm.taggedPlaceName && <span className="ml-auto text-[10px] text-green-700 font-black shrink-0">✅ Tagged</span>}
                  </label>
                </div>

                {/* Tag 2: SAFAR Authority Desk */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">🛡️ Tag 2 — SAFAR Authority Desk <span className="text-red-500">*</span></label>
                  <label className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${partnerForm.taggedAuthorityDesk ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-300 hover:border-blue-300'}`}>
                    <input
                      type="checkbox"
                      checked={partnerForm.taggedAuthorityDesk}
                      onChange={(e) => setPartnerForm({ ...partnerForm, taggedAuthorityDesk: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-blue-800">✓ Tag: @SAFAR Central Command Authority Desk</span>
                    {partnerForm.taggedAuthorityDesk && <span className="ml-auto text-[10px] text-green-700 font-black shrink-0">✅ Tagged</span>}
                  </label>
                </div>

                {/* Tag 3 & 4: City + State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">🏙️ Tag 3 — City <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Ayodhya, Varanasi"
                      value={partnerForm.city}
                      onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-none transition-colors ${
                        partnerForm.city.trim().length >= 2 ? 'border-green-400 bg-green-50 focus:ring-2 focus:ring-green-400' : 'border-slate-300 bg-white focus:ring-2 focus:ring-indigo-400'
                      }`}
                    />
                    {partnerForm.city.trim().length >= 2 && <span className="text-[10px] text-green-700 font-bold mt-0.5 block">✅ City tagged</span>}
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">🗺️ Tag 4 — State <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Uttar Pradesh"
                      value={partnerForm.state}
                      onChange={(e) => setPartnerForm({ ...partnerForm, state: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-none transition-colors ${
                        partnerForm.state.trim().length >= 2 ? 'border-green-400 bg-green-50 focus:ring-2 focus:ring-green-400' : 'border-slate-300 bg-white focus:ring-2 focus:ring-indigo-400'
                      }`}
                    />
                    {partnerForm.state.trim().length >= 2 && <span className="text-[10px] text-green-700 font-bold mt-0.5 block">✅ State tagged</span>}
                  </div>
                </div>

                {/* 4-tag completion indicator */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '🏨 Place/Hotel', done: Boolean(partnerForm.partnerId && partnerForm.taggedPlaceName) },
                    { label: '🛡️ Authority Desk', done: partnerForm.taggedAuthorityDesk },
                    { label: '🏙️ City', done: partnerForm.city.trim().length >= 2 },
                    { label: '🗺️ State', done: partnerForm.state.trim().length >= 2 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-bold transition-all ${
                        item.done ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      <span>{item.done ? '✅' : '⬜'}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload - strictly disabled until all 4 tags complete */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-slate-700">
                    Upload Visit Photograph / Dine-in Proof <span className="text-red-500">*</span>
                  </label>
                  {!isPartnerFormComplete && (
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                      🔒 Complete all 4 tags above first
                    </span>
                  )}
                  {isPartnerFormComplete && (
                    <span className="text-[10px] font-black text-green-700 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full">
                      🔓 Photo upload unlocked!
                    </span>
                  )}
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-opacity ${!isPartnerFormComplete ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                  <div className={`sm:col-span-2 border-2 border-dashed rounded-2xl p-4 text-center transition-colors bg-slate-50 flex flex-col items-center justify-center space-y-2 ${
                    isPartnerFormComplete ? 'border-indigo-400 hover:border-indigo-600 cursor-pointer' : 'border-slate-200 cursor-not-allowed'
                  }`}>
                    <Upload className={`w-6 h-6 ${isPartnerFormComplete ? 'text-indigo-500' : 'text-slate-300'}`} />
                    <span className="text-xs text-slate-600 font-medium">
                      {isPartnerFormComplete ? 'Click to select photo from device' : '🔒 Fill all 4 tags to unlock upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!isPartnerFormComplete}
                      onChange={(e) => handleFileUpload(e, 'PARTNER')}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-800 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Preset Demo Photos */}
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Quick Demo Visits:</span>
                    {DEMO_PROOF_PRESETS_PARTNER.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setPartnerForm((prev) => ({
                            ...prev,
                            partnerId: preset.partnerId,
                            city: preset.city,
                            state: preset.state,
                            proofImage: preset.url,
                            taggedAuthorityDesk: true,
                            taggedPlaceName: true
                          }));
                        }}
                        className="w-full text-left p-1.5 rounded-lg text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 truncate transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {partnerForm.proofImage && (
                  <div className="mt-2 flex items-center space-x-3 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                    <img src={partnerForm.proofImage} alt="Selected Proof" className="w-16 h-12 rounded-lg object-cover" />
                    <div className="text-xs">
                      <span className="font-bold text-indigo-800 block">Visit Photograph Attached ✅</span>
                      <span className="text-[10px] text-indigo-600">All 4 tags confirmed · Tagged with partner establishment, SAFAR Desk, City & State</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !isPartnerFormComplete || !partnerForm.proofImage}
                className={`w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  submitting || !isPartnerFormComplete || !partnerForm.proofImage
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
                }`}
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Partner Visit for Verification</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= OPTION 3: TOURIST PLACE PHOTO FORM ================= */}
          {submissionOption === 'TOURIST' && (
            <form onSubmit={handleSubmitTouristPlace} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-start space-x-2.5">
                <Camera className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-purple-900">
                  <strong>How it works:</strong> Post quality photos of famous tourist attractions, heritage sites, or temples. <strong>4 mandatory tags required</strong>: Place Name, @SAFAR Authority Desk, City, and State — all must be confirmed before photo upload is enabled. Once verified, Green Coins are awarded and your photo goes public!
                </div>
              </div>

              {/* Place Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tourist Place / Monument Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taj Mahal or Mahakaleshwar Temple"
                  value={touristPlaceForm.placeName}
                  onChange={(e) => setTouristPlaceForm({ ...touristPlaceForm, placeName: e.target.value })}
                  className={`w-full p-3 rounded-xl border font-bold focus:outline-none transition-colors ${
                    touristPlaceForm.placeName.trim().length >= 3 ? 'border-green-400 bg-green-50' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Place Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Place Category</label>
                <select
                  value={touristPlaceForm.placeCategory}
                  onChange={(e) => setTouristPlaceForm({ ...touristPlaceForm, placeCategory: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none"
                >
                  <option value="Heritage Site">🏛️ Heritage Site (+2 Green Coins)</option>
                  <option value="Religious Place">🛕 Religious Place / Temple (+2 Green Coins)</option>
                  <option value="Historical Monument">🏰 Historical Monument (+2 Green Coins)</option>
                  <option value="Scenic Viewpoint">🌄 Scenic Viewpoint / Ghat (+2 Green Coins)</option>
                  <option value="National Park / Wildlife">🌳 National Park / Eco Sanctuary (+2 Green Coins)</option>
                  <option value="Cultural Center">🎭 Cultural Landmark (+2 Green Coins)</option>
                </select>
              </div>

              {/* ─── 4 MANDATORY TAGS SECTION ─── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-purple-50 border-2 border-dashed border-red-300 space-y-3.5">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-xs font-black text-red-800 uppercase tracking-wide">4 Mandatory Tags — All Required Before Photo Upload</span>
                </div>

                {/* Tag 1: Place Name confirm */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">📍 Tag 1 — Place Name <span className="text-red-500">*</span></label>
                  <label className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                    touristPlaceForm.taggedPlaceName ? 'bg-purple-50 border-purple-400' : 'bg-white border-slate-300 hover:border-purple-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={touristPlaceForm.taggedPlaceName}
                      onChange={(e) => setTouristPlaceForm({ ...touristPlaceForm, taggedPlaceName: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      disabled={touristPlaceForm.placeName.trim().length < 3}
                    />
                    <span className="text-[11px] font-bold text-purple-800 truncate">
                      ✓ Tag: @{touristPlaceForm.placeName.trim() || 'Enter place name above first'}
                    </span>
                    {touristPlaceForm.taggedPlaceName && <span className="ml-auto text-[10px] text-green-700 font-black shrink-0">✅ Tagged</span>}
                  </label>
                  {touristPlaceForm.placeName.trim().length < 3 && <span className="text-[10px] text-slate-400 mt-0.5 block">Enter the place name above to enable this tag</span>}
                </div>

                {/* Tag 2: SAFAR Authority Desk */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">🛡️ Tag 2 — SAFAR Authority Desk <span className="text-red-500">*</span></label>
                  <label className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                    touristPlaceForm.taggedAuthorityDesk ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-300 hover:border-blue-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={touristPlaceForm.taggedAuthorityDesk}
                      onChange={(e) => setTouristPlaceForm({ ...touristPlaceForm, taggedAuthorityDesk: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-blue-800">✓ Tag: @SAFAR Central Command Authority Desk</span>
                    {touristPlaceForm.taggedAuthorityDesk && <span className="ml-auto text-[10px] text-green-700 font-black shrink-0">✅ Tagged</span>}
                  </label>
                </div>

                {/* Tag 3 & 4: City + State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">🏙️ Tag 3 — City <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Agra, Varanasi"
                      value={touristPlaceForm.city}
                      onChange={(e) => setTouristPlaceForm({ ...touristPlaceForm, city: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-none transition-colors ${
                        touristPlaceForm.city.trim().length >= 2 ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-white'
                      }`}
                    />
                    {touristPlaceForm.city.trim().length >= 2 && <span className="text-[10px] text-green-700 font-bold mt-0.5 block">✅ City tagged</span>}
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">🗺️ Tag 4 — State <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Uttar Pradesh"
                      value={touristPlaceForm.state}
                      onChange={(e) => setTouristPlaceForm({ ...touristPlaceForm, state: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium focus:outline-none transition-colors ${
                        touristPlaceForm.state.trim().length >= 2 ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-white'
                      }`}
                    />
                    {touristPlaceForm.state.trim().length >= 2 && <span className="text-[10px] text-green-700 font-bold mt-0.5 block">✅ State tagged</span>}
                  </div>
                </div>

                {/* 4-tag completion indicator */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: '📍 Place Name', done: touristPlaceForm.placeName.trim().length >= 3 && touristPlaceForm.taggedPlaceName },
                    { label: '🛡️ Authority Desk', done: touristPlaceForm.taggedAuthorityDesk },
                    { label: '🏙️ City', done: touristPlaceForm.city.trim().length >= 2 },
                    { label: '🗺️ State', done: touristPlaceForm.state.trim().length >= 2 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-1.5 rounded-lg flex items-center space-x-1 text-[10px] font-bold transition-all ${
                        item.done ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      <span>{item.done ? '✅' : '⬜'}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Upload - strictly disabled until all 4 tags complete */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <label className="font-bold text-slate-700">
                    Upload Tourist Place Photograph <span className="text-red-500">*</span>
                  </label>
                  {!isTouristFormComplete && (
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                      🔒 Complete all 4 tags above first
                    </span>
                  )}
                  {isTouristFormComplete && (
                    <span className="text-[10px] font-black text-green-700 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full">
                      🔓 Photo upload unlocked!
                    </span>
                  )}
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-opacity ${!isTouristFormComplete ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                  <div className={`sm:col-span-2 border-2 border-dashed rounded-2xl p-4 text-center transition-colors bg-slate-50 flex flex-col items-center justify-center space-y-2 ${
                    isTouristFormComplete ? 'border-purple-400 hover:border-purple-600 cursor-pointer' : 'border-slate-200 cursor-not-allowed'
                  }`}>
                    <Upload className={`w-6 h-6 ${isTouristFormComplete ? 'text-purple-500' : 'text-slate-300'}`} />
                    <span className="text-xs text-slate-600 font-medium">
                      {isTouristFormComplete ? 'Click to select tourist place photo from device' : '🔒 Fill all 4 tags to unlock upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!isTouristFormComplete}
                      onChange={(e) => handleFileUpload(e, 'TOURIST')}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-800 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Preset Demo Photos */}
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Quick Demo Places:</span>
                    {DEMO_PROOF_PRESETS_TOURIST.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setTouristPlaceForm((prev) => ({
                            ...prev,
                            placeName: preset.placeName,
                            city: preset.city,
                            state: preset.state,
                            placeCategory: preset.placeCategory,
                            proofImage: preset.url,
                            taggedAuthorityDesk: true,
                            taggedPlaceName: true,
                          }));
                        }}
                        className="w-full text-left p-1.5 rounded-lg text-[11px] font-semibold bg-white hover:bg-purple-50 hover:text-purple-800 border border-slate-200 truncate transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {touristPlaceForm.proofImage && (
                  <div className="mt-2 flex items-center space-x-3 p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                    <img src={touristPlaceForm.proofImage} alt="Selected Tourist Place" className="w-16 h-12 rounded-lg object-cover" />
                    <div className="text-xs">
                      <span className="font-bold text-purple-800 block">Tourist Location Photo Attached ✅</span>
                      <span className="text-[10px] text-purple-600">All 4 tags confirmed · Will appear in SAFAR Public Tourist Gallery upon approval</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Requirement Checklist */}
              {(!isTouristFormComplete || !touristPlaceForm.proofImage) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Required before submission:</strong>{' '}
                    {touristPlaceForm.placeName.trim().length < 3 ? '📍 Enter place name • ' : ''}
                    {!touristPlaceForm.taggedPlaceName ? '📍 Tag place name • ' : ''}
                    {!touristPlaceForm.taggedAuthorityDesk ? '🛡️ Tag Authority Desk • ' : ''}
                    {touristPlaceForm.city.trim().length < 2 ? '🏙️ Enter city • ' : ''}
                    {touristPlaceForm.state.trim().length < 2 ? '🗺️ Enter state • ' : ''}
                    {!touristPlaceForm.proofImage ? '📷 Upload photo' : ''}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !isTouristFormComplete || !touristPlaceForm.proofImage}
                className={`w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  submitting || !isTouristFormComplete || !touristPlaceForm.proofImage
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.99]'
                }`}
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Tourist Place Photo for Verification</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: PARTNER DIRECTORY & POLICIES */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Certified SAFAR Partner Network</h3>
              <p className="text-xs text-slate-500">Each partner configures its custom discount policy, strictly capped by SAFAR at 40% max.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <div 
                key={partner.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-black text-slate-900">{partner.name}</span>
                      </div>
                      <p className="text-xs text-slate-500">{partner.location} · {partner.type}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {partner.isSpecialEco ? '🌿 Eco Leader' : '🌱 Active'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {partner.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Visit Reward:</span>
                      <strong className="text-emerald-700">+{partner.rewardCoins || 1} Green Coin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Discount:</span>
                      <strong className="text-blue-700 font-mono">{partner.maximumDiscount || 40}%</strong>
                    </div>
                  </div>

                  {/* Configured Policy */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Green Coin Policy:
                    </span>
                    <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                      {(partner.discountPolicy || []).map((tier, idx) => (
                        <div key={idx} className="p-1 rounded bg-slate-100 flex justify-between">
                          <span>{tier.coins} coins</span>
                          <span className="font-bold text-emerald-700">{tier.discountPercent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">📞 {partner.contactPhone}</span>
                  <Link
                    to={`/partner-payment?partnerId=${partner.id}`}
                    className="py-1.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1"
                  >
                    <span>Pay Bill</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Your Activity & Verification History</h3>
                <p className="text-xs text-slate-500">View your uploaded journey proofs, partner visits, and public tourist place photos.</p>
              </div>

              {/* Filter Pills for the 3 Activities */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setHistoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    historyFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({history.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('ECO')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    historyFilter === 'ECO' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Eco Travel ({history.filter(h => h.activityType === 'ECO_VEHICLE').length})
                </button>
                <button
                  onClick={() => setHistoryFilter('PARTNER')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    historyFilter === 'PARTNER' ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Partner ({history.filter(h => h.activityType !== 'ECO_VEHICLE' && h.activityType !== 'TOURIST_PLACE').length})
                </button>
                <button
                  onClick={() => setHistoryFilter('TOURIST')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    historyFilter === 'TOURIST' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tourist Places ({history.filter(h => h.activityType === 'TOURIST_PLACE').length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Activity</th>
                    <th className="p-3.5">Detail</th>
                    <th className="p-3.5">Photo Proof</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Green Coins</th>
                    <th className="p-3.5">Authority Desk Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {history
                    .filter(item => {
                      if (historyFilter === 'ECO') return item.activityType === 'ECO_VEHICLE';
                      if (historyFilter === 'PARTNER') return item.activityType !== 'ECO_VEHICLE' && item.activityType !== 'TOURIST_PLACE';
                      if (historyFilter === 'TOURIST') return item.activityType === 'TOURIST_PLACE';
                      return true;
                    })
                    .length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        No submissions recorded for this category yet.
                      </td>
                    </tr>
                  ) : (
                    history
                      .filter(item => {
                        if (historyFilter === 'ECO') return item.activityType === 'ECO_VEHICLE';
                        if (historyFilter === 'PARTNER') return item.activityType !== 'ECO_VEHICLE' && item.activityType !== 'TOURIST_PLACE';
                        if (historyFilter === 'TOURIST') return item.activityType === 'TOURIST_PLACE';
                        return true;
                      })
                      .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-slate-500 font-mono">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold flex items-center space-x-1">
                            {item.activityType === 'ECO_VEHICLE' ? (
                              <>
                                <Car className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Eco: {item.vehicleType}</span>
                              </>
                            ) : item.activityType === 'TOURIST_PLACE' ? (
                              <>
                                <Camera className="w-3.5 h-3.5 text-purple-600" />
                                <span>Place: {item.placeCategory || 'Attraction'}</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{item.sourceCategory || 'Partner Visit'}</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium">
                          {item.activityType === 'TOURIST_PLACE' ? (
                            <div>
                              <span className="font-bold text-slate-900 block">{item.placeName}</span>
                              <span className="text-[10px] text-slate-500">{item.placeLocation || 'Tourist Destination'}</span>
                            </div>
                          ) : (
                            <span className="font-mono">{item.vehicleNumber || item.partnerName || '—'}</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {item.proofImage ? (
                            <div className="flex items-center space-x-1.5">
                              <img
                                src={item.proofImage}
                                alt="Proof"
                                onClick={() => setPreviewPhotoModal({
                                  image: item.proofImage,
                                  title: item.placeName || item.partnerName || item.vehicleType || 'Proof Photo',
                                  subtitle: item.placeLocation || item.vehicleNumber || item.activityType,
                                  isPublic: item.activityType === 'TOURIST_PLACE',
                                  category: item.placeCategory || item.sourceCategory
                                })}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs cursor-pointer hover:ring-2 hover:ring-purple-500 hover:scale-105 transition-all"
                              />
                              {item.activityType === 'TOURIST_PLACE' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-extrabold border border-purple-200 flex items-center space-x-0.5">
                                  <span>🌍</span>
                                  <span>Public</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">No image</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : item.status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-black text-emerald-700">
                          {item.coins > 0 ? `+${item.coins}` : '—'}
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {item.status === 'APPROVED' ? (
                            <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Verified by {item.verifiedBy || 'SAFAR Authority Desk'}</span>
                            </span>
                          ) : item.status === 'REJECTED' ? (
                            <span className="text-red-600 font-semibold">
                              Rejected: {item.rejectionReason}
                            </span>
                          ) : (
                            <span className="text-amber-700 italic">
                              Queued at SAFAR Command Desk
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Public Tourist Places Community Showcase */}
          <div className="rounded-3xl p-6 bg-slate-900 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white flex items-center space-x-2">
                    <span>Public Tourist Places Gallery</span>
                    <span className="text-[10px] uppercase font-bold bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                      Live Feed
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Photos uploaded in Option 3 are published to all tourists, viewers, and the SAFAR Authority Desk to inspire travelers across India.
                  </p>
                </div>
              </div>
            </div>

            {/* Deduplicated & validated public gallery items — strictly excludes failed or rejected uploads */}
            {(() => {
              const validPublicPhotos = (() => {
                const list = [...publicGallery];
                history.forEach(h => {
                  if (
                    h.activityType === 'TOURIST_PLACE' && 
                    h.proofImage && 
                    h.placeName && 
                    h.placeLocation && 
                    h.status !== 'REJECTED' && 
                    !list.some(item => item.id === h.id || (item.proofHash && item.proofHash === h.proofHash))
                  ) {
                    list.push(h);
                  }
                });
                return list.filter(item => item.status !== 'REJECTED' && item.proofImage && item.placeName);
              })();

              if (validPublicPhotos.length === 0) {
                return (
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                    <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">
                      No verified tourist place photos in the gallery yet. Use <strong>Option 3 — Tourist Places Photo</strong> to upload your first photo!
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Note: Photos must have full details and compulsory tags confirmed. Incomplete or failed uploads are never posted to the public gallery.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {validPublicPhotos.map(photoItem => (
                    <div
                      key={photoItem.id}
                      onClick={() => setPreviewPhotoModal({
                        image: photoItem.proofImage,
                        title: photoItem.placeName,
                        subtitle: photoItem.placeLocation,
                        isPublic: true,
                        category: photoItem.placeCategory
                      })}
                      className="group cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-purple-400/60 transition-all hover:scale-[1.02] shadow-md flex flex-col justify-between"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                        <img
                          src={photoItem.proofImage}
                          alt={photoItem.placeName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            photoItem.status === 'APPROVED' ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {photoItem.status}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-purple-300" />
                          <span>Public Gallery</span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <h5 className="font-black text-sm text-white truncate">{photoItem.placeName}</h5>
                          <span className="text-[10px] text-purple-300 font-medium shrink-0 ml-1">
                            {photoItem.placeCategory || 'Heritage'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{photoItem.placeLocation || 'India'}</span>
                        </p>
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                          <span>✓ Tag: SAFAR Desk</span>
                          <span className="font-mono text-emerald-400 font-bold">+{photoItem.coins || 2} Coins</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            )}
          </div>
            
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {previewPhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoModal(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 text-sm">{previewPhotoModal.title}</h4>
                <p className="text-xs text-slate-500">{previewPhotoModal.subtitle}</p>
              </div>
              <button
                onClick={() => setPreviewPhotoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 pt-0">
              <img
                src={previewPhotoModal.image}
                alt={previewPhotoModal.title}
                className="w-full max-h-[60vh] object-contain rounded-2xl bg-slate-100"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-slate-600">
                {previewPhotoModal.isPublic ? '🌍 Published to Public Tourist Discovery' : '🔒 Verified Private Verification Proof'}
              </span>
              <button
                onClick={() => setPreviewPhotoModal(null)}
                className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-900 text-white text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ PAY AT PARTNER — PAYMENT METHOD SELECTION MODAL ══════════ */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Indian tricolor ribbon */}
              <div className="h-1.5 w-full absolute top-0 left-0 rounded-t-3xl bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

              {/* Close */}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>

              {/* Header */}
              <div className="pt-3 space-y-0.5">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Choose Payment Method</h2>
                </div>
                <p className="text-xs text-slate-500">Your SAFAR Green Coin discount is applied automatically at checkout</p>
              </div>

              {/* Green Coin Balance */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-700 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide block">Your Green Coins</span>
                    <span className="text-lg font-black text-emerald-900 font-mono">{wallet?.totalCoins || 27} coins</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Discount Tier</span>
                  <span className="text-2xl font-black text-blue-700 font-mono">{wallet?.availableDiscountTier || 5}% OFF</span>
                </div>
              </div>

              {/* Payment Method Grid */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Select your payment app or method:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {PAYMENT_METHODS.map((method) => (
                    <motion.button
                      key={method.id}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className="p-3.5 rounded-2xl border-2 text-left transition-all relative"
                      style={{
                        borderColor: selectedPaymentMethod === method.id ? '#10b981' : '#e2e8f0',
                        background: selectedPaymentMethod === method.id ? method.bg : '#f9fafb',
                        boxShadow: selectedPaymentMethod === method.id ? '0 4px 16px rgba(16,185,129,0.15)' : 'none'
                      }}
                    >
                      {selectedPaymentMethod === method.id && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                      )}
                      <div className="text-2xl mb-1.5">{method.emoji}</div>
                      <div className="text-xs font-black leading-tight" style={{ color: method.color }}>{method.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">{method.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Discount info on selection */}
              <AnimatePresence>
                {selectedPaymentMethod && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold flex items-start space-x-2"
                  >
                    <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Your <strong className="text-emerald-800">{wallet?.availableDiscountTier || 5}% Green Coin discount</strong> will be automatically applied when you pay via <strong>{selectedPaymentMethod}</strong> through SAFAR.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Proceed Button */}
              <Link
                to={selectedPaymentMethod ? `/partner-payment?paymentMethod=${encodeURIComponent(selectedPaymentMethod)}` : '/partner-payment'}
                onClick={() => { if (selectedPaymentMethod) setShowPaymentModal(false); }}
                className={`block w-full py-4 rounded-2xl font-black text-sm text-center transition-all flex items-center justify-center space-x-2 ${
                  selectedPaymentMethod
                    ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{selectedPaymentMethod ? `Proceed to Pay · ${selectedPaymentMethod}` : 'Select a payment method above'}</span>
                {selectedPaymentMethod && <ArrowRight className="w-4 h-4" />}
              </Link>

              <p className="text-center text-[10px] text-slate-400">
                🔒 Secured by SAFAR · Official verified settlement gateway
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
