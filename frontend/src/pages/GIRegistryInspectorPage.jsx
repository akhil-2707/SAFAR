import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  ExternalLink,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  QrCode,
  FileText,
  MapPin,
  Calendar,
  Lock,
  Layers,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Info,
  Building,
  Scale,
  RefreshCw,
  HeartHandshake
} from 'lucide-react';

// Comprehensive dataset for Official GI Records registered under GI Act 1999
const GI_REGISTRY_DATABASE = {
  '19': {
    applicationNumber: 19,
    certificateNumber: 22,
    giTagNumber: 'GI-IN-0019',
    craftName: 'Pochampally Ikat',
    officialTitle: 'Pochampally Ikat (Textiles & Handicrafts)',
    goodsClass: 'Class 24 (Textiles & Textile Goods) & Class 25 (Clothing)',
    state: 'Telangana',
    region: 'Bhoodan Pochampally, Yadadri Bhuvanagiri & Nalgonda Districts',
    filingDate: '12/04/2004',
    registrationDate: '31/12/2004',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '30/12/2034 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: "Pochampally Handloom Weavers' Cooperative Society Ltd. & Directorate of Handlooms & Textiles, Govt. of Telangana",
    registeredAddress: 'Weavers Colony, Bhoodan Pochampally, Yadadri Bhuvanagiri District, Telangana - 508284',
    leadArtisan: 'B. Narayana (National Master Weaver)',
    phoneContact: '+91 8685 244221',
    artisanUpiVpa: 'pochampally.ikat@upi',
    heritageYears: 85,
    authorizedUsersCount: '1,240+ Certified Guild Weavers',
    specification: 'Traditional double-ikat resist tie-and-dye weaving on pure mulberry silk (20/22 denier) or 100s combed high-twist cotton yarn. Warp and weft yarns are grouped, mapped with geometrical graph coordinates, and individually tied with water-repellent rubber bands before hand-dip vat dyeing.',
    technicalParameters: [
      { label: 'Weft & Warp Tie-Dye', value: 'Double-Ikat Geometric Precision' },
      { label: 'Fiber Composition', value: '100% Pure Mulberry Silk / Combed Cotton' },
      { label: 'Loom Technology', value: 'Traditional Manual Pit Loom with Wooden Shuttle' },
      { label: 'Dye Standard', value: 'Azo-Free Non-Bleeding Vat Reactive Pigments' }
    ],
    authenticityMarkers: [
      'Slight characteristic hazy feathered contour at pattern intersections confirming true manual resist dyeing',
      'Completely reversible design with identical color density on face and reverse sides',
      'Authentic selvage wave confirming manual shuttle stroke without powerloom needle marks',
      'High tensile wet strength exceeding BIS handloom grade-1 benchmarks'
    ],
    counterfeitMarkers: [
      'Screen printed or digital pigment printing on flat woven synthetic polyester blend',
      'White or distinctly faded reverse side indicating surface roller print',
      'Absence of yarn tie-dye bleed zones along geometrical edges',
      'Melt residue and acrid chemical odor under hand flame thread test'
    ],
    officialFairPriceRange: '₹2,100 – ₹2,900',
    typicalMarketScamPrice: 8000,
    fairBasePrice: 2300,
    blockchainHash: '5190b28490a182048bca910284e019284ba910284901823904810239481023a1',
    blockIndex: 408,
    image: '/images/pochampally-ikat.jpg'
  },
  '46': {
    applicationNumber: 46,
    certificateNumber: 87,
    giTagNumber: 'GI-IN-0046',
    craftName: 'Kashmir Pashmina',
    officialTitle: 'Kashmir Pashmina & Kani Shawls (Handloom)',
    goodsClass: 'Class 24 (Textiles and Textile Goods)',
    state: 'Jammu & Kashmir',
    region: 'Srinagar (Shehr-e-Khaas), Budgam & Ganderbal Districts',
    filingDate: '09/12/2005',
    registrationDate: '08/09/2008',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '08/12/2035 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: 'Tahafuz Artisans Cooperative Society Ltd. & Directorate of Handicrafts, Govt. of Jammu & Kashmir',
    registeredAddress: 'Craft Development Institute Complex, Baghi Ali Mardan Khan, Nowshera, Srinagar - 190011',
    leadArtisan: 'Ghulam Mohammad (7th Generation Pashmina Master)',
    phoneContact: '+91 194 2452891',
    artisanUpiVpa: 'tahafuz.pashmina@upi',
    heritageYears: 180,
    authorizedUsersCount: '4,850+ Registered Spinners & Weavers',
    specification: '100% pure raw wool obtained from the underbelly fleece of Capra Hircus (Changthangi goat) mountain livestock living above 14,000 feet in Ladakh. Must be hand-spun on wooden charkha (Yender) and hand-woven on traditional pit loom.',
    technicalParameters: [
      { label: 'Fiber Diameter', value: '12.5 – 15.0 Microns (Pure Changthangi Pashm)' },
      { label: 'Spinning Method', value: 'Manual Wooden Charkha (Yender)' },
      { label: 'Weaving Technique', value: 'Traditional Wooden Pit Loom with Diamond/Chashm-e-Bulbul Weave' },
      { label: 'Synthetic Blend Cap', value: '0.0% (Zero Viscose / Nylon / Polyester)' }
    ],
    authenticityMarkers: [
      'Microscopic fiber scale pattern showing 6 to 8 serrations per 100 micrometers under 500x magnification',
      'Irregular thread cross-section affirming manual hand-spinning rather than mechanical extrusion',
      'Natural raw fringed borders without heat-fused nylon hemming',
      'Thermal retention ratio exceeding 0.88 W/m·K with featherweight drape'
    ],
    counterfeitMarkers: [
      'Chemical luster and electrostatic cling characteristic of synthetic viscose or acrylic',
      'Powerloom uniform gauge with zero spinner variation',
      'Hard bead residue upon burn test instead of crisp natural keratin ash',
      'Machine overlocked or glued edge hems'
    ],
    officialFairPriceRange: '₹4,500 – ₹5,800',
    typicalMarketScamPrice: 18000,
    fairBasePrice: 4800,
    blockchainHash: 'a7c9f823e41b9d05e2193cb49a218f0851e479a32c45e89d1b0129cf7491b412',
    blockIndex: 401,
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80'
  },
  '23': {
    applicationNumber: 23,
    certificateNumber: 34,
    giTagNumber: 'GI-IN-0023',
    craftName: 'Banaras Brocades and Sarees',
    officialTitle: 'Banaras Brocades & Handloom Silk Sarees',
    goodsClass: 'Class 24 (Textiles) & Class 25 (Clothing)',
    state: 'Uttar Pradesh',
    region: 'Varanasi (Chowk, Sarai Mohana, Lohta, Kotwa) & contiguous districts',
    filingDate: '18/07/2007',
    registrationDate: '04/09/2009',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '17/07/2037 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: 'Human Welfare Association & Banaras Bunkar Samiti, Varanasi',
    registeredAddress: 'Bunkar Seva Kendra, Weaver Colony, Sarai Mohana, Varanasi - 221007',
    leadArtisan: 'Smt. Radha Devi (Master Naksha Weaver)',
    phoneContact: '+91 542 2214309',
    artisanUpiVpa: 'radha.banarasibunkar@upi',
    heritageYears: 95,
    authorizedUsersCount: '6,200+ Verified Handloom Artisans',
    specification: 'Handloom weaving using pure mulberry silk yarn (20/22 denier) warp and weft, combined with authentic gold and electroplated pure silver zari threads. Incorporates classical Mughal bootis, Amru, and Kinkhwab motifs.',
    technicalParameters: [
      { label: 'Zari Purity Standard', value: 'Pure Silver Electroplated Core Wire with Gold Sheen' },
      { label: 'Silk Denier', value: '20/22 Filature Degummed Pure Mulberry Silk' },
      { label: 'Loom Structure', value: 'Jacquard Pit-Loom with Traditional Wooden Naksha' },
      { label: 'Labor Requirement', value: '18 to 30 Days of Dedicated Weaver Labor' }
    ],
    authenticityMarkers: [
      'Exposed reverse float threads showing manual weaver knot junctions',
      'Certified silver core wire that passes nitric acid chemical swab test without turning black',
      'Natural organic sericin crisp drape without chemical starch stiffeners',
      'Distinctive selvedge pin-hole density along handloom guide rails'
    ],
    counterfeitMarkers: [
      'Commercial Surat powerloom synthetic Lurex plastic metallic yarn',
      'Totally uniform mechanical machine weave back without hand-cut float tails',
      'Artificial chemical gloss under fluorescent shop lighting',
      'Synthetic melt smell under needle burn testing'
    ],
    officialFairPriceRange: '₹3,200 – ₹4,200',
    typicalMarketScamPrice: 14000,
    fairBasePrice: 3500,
    blockchainHash: '8b3f19c4d21e87a5509cbf201e74a81923d45efb0198c214ea71b29a8341cc71',
    blockIndex: 402,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
  },
  '418': {
    applicationNumber: 418,
    certificateNumber: 201,
    giTagNumber: 'GI-IN-0418',
    craftName: 'Moradabad Metal Craft',
    officialTitle: 'Moradabad Hand-Chiseled Brassware & Temple Lamps',
    goodsClass: 'Class 6 (Common Metals & Their Alloys) & Class 14 (Metal Artware)',
    state: 'Uttar Pradesh',
    region: 'Moradabad (Peetal Nagari), Uttar Pradesh',
    filingDate: '12/10/2012',
    registrationDate: '26/03/2014',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '11/10/2032 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: 'Moradabad Brass Art Ware Manufacturers & Exporters Association',
    registeredAddress: 'Artisan Cluster, Bartan Bazaar, Moradabad - 244001',
    leadArtisan: 'Iqbal Ahmad Ansari (Master Chaser & Engraver)',
    phoneContact: '+91 591 2490182',
    artisanUpiVpa: 'iqbal.moradabadbrass@upi',
    heritageYears: 65,
    authorizedUsersCount: '3,100+ Guild Metalworkers',
    specification: 'Solid virgin bell-metal brass alloy (60% Copper : 40% Zinc) sand cast by manual foundrymen, followed by Kalamkari fine chisel engraving done completely by hand using tempered steel chisels and light wooden mallets.',
    technicalParameters: [
      { label: 'Alloy Composition', value: 'Virgin Copper (60%) : Pure Zinc (40%)' },
      { label: 'Casting Process', value: 'Indigenous Green Sand Mold Foundry' },
      { label: 'Finishing Technique', value: 'Kalamkari Hand Chisel Stippling & Beeswax Buffing' },
      { label: 'Heavy Metal Safety', value: 'Lead-Free & Cadmium-Free Certified' }
    ],
    authenticityMarkers: [
      'Micro-chisel marks exhibiting artisan strike variation and stroke depth',
      'Solid virgin sand-cast core with resonant acoustic ring like a sacred temple bell',
      'Natural hand buffing without harmful chemical electro-clearing lacquer',
      'Absence of automated die-cast machine seam lines'
    ],
    counterfeitMarkers: [
      'Die-cast zinc or iron alloy core with micro-thin electroplated brass flash',
      'Dull thud acoustic tone indicating porous recycled scrap metal',
      'Laser-etched or acid-washed flat decorative pattern lacking physical relief',
      'Peeling or blistering metallic surface coat after alcohol wipe'
    ],
    officialFairPriceRange: '₹950 – ₹1,350',
    typicalMarketScamPrice: 4500,
    fairBasePrice: 1100,
    blockchainHash: '94e21a88b502c31ff718a2098bca4412e87901fb215a77cc0194b1509fa812bc',
    blockIndex: 403,
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&auto=format&fit=crop&q=80'
  },
  '55': {
    applicationNumber: 55,
    certificateNumber: 88,
    giTagNumber: 'GI-IN-0055',
    craftName: 'Muga Silk of Assam',
    officialTitle: 'Muga & Eri Wild Silk Weaves of Assam',
    goodsClass: 'Class 24 (Textiles & Textile Goods) & Class 25 (Clothing)',
    state: 'Assam',
    region: 'Sualkuchi (Silk Village of Assam), Kamrup Rural & Brahmaputra Valley',
    filingDate: '20/07/2006',
    registrationDate: '20/11/2007',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '19/07/2036 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: 'Assam Science Technology & Environment Council (ASTEC) & Sualkuchi Guild',
    registeredAddress: 'Silk Weaver Federation Complex, Sualkuchi, Kamrup Rural, Assam - 781103',
    leadArtisan: 'Dipali Kalita (Assam State Awardee)',
    phoneContact: '+91 361 2830214',
    artisanUpiVpa: 'sualkuchi.mugasari@upi',
    heritageYears: 120,
    authorizedUsersCount: '2,800+ Wild Silk Reelers & Weavers',
    specification: 'Naturally golden wild silk harvested exclusively from Antheraea assamensis silkworms endemic strictly to the Brahmaputra Valley. Notable for its natural golden sheen which intensifies with every washing.',
    technicalParameters: [
      { label: 'Silkworm Species', value: 'Antheraea assamensis (Endemic Wild Silk)' },
      { label: 'Natural Color', value: 'Unaltered Golden Amber / Rich Honey Luster' },
      { label: 'UV Resistance', value: 'Blocks 85% UVA & UVB Rays Naturally' },
      { label: 'Durability', value: 'Outlasts 50+ Years (Traditional Heirloom Standard)' }
    ],
    authenticityMarkers: [
      'Natural honey-gold shimmer that glistens without any artificial dyes or bleaches',
      'Distinctive wild cocoon protein aroma under steam press',
      'Increases gloss and softness following lukewarm water washing',
      'Tested 100% natural sericin-fibroin dual filament cross-section'
    ],
    counterfeitMarkers: [
      'Chemical artificial yellow dye on commercial white mulberry or spun tasar silk',
      'Bleeds color when soaked in warm water with mild detergent',
      'Dull synthetic sheen from rayon blending',
      'Brittle fiber degradation under direct sunlight'
    ],
    officialFairPriceRange: '₹2,800 – ₹3,600',
    typicalMarketScamPrice: 12000,
    fairBasePrice: 3000,
    blockchainHash: 'f48201a9b472e38c119da08471bb5290a12e89fc347209aa4b7190dcf1a20831',
    blockIndex: 404,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
  },
  '36': {
    applicationNumber: 36,
    certificateNumber: 51,
    giTagNumber: 'GI-IN-0036',
    craftName: 'Blue Pottery of Jaipur',
    officialTitle: 'Traditional Clay-Free Jaipur Blue Pottery',
    goodsClass: 'Class 21 (Household Ceramics, Pottery & Glassware)',
    state: 'Rajasthan',
    region: 'Jaipur (Heritage Pink City), Kotputli & Sanganer Districts',
    filingDate: '15/09/2005',
    registrationDate: '26/03/2008',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '14/09/2035 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: 'Rajasthan Small Industries Corporation (RAJSIKO) & Jaipur Blue Pottery Guild',
    registeredAddress: 'Kripal Kumbh, B-18, Shiv Marg, Bani Park, Jaipur - 302016',
    leadArtisan: 'Mohan Prajapati (Senior Heritage Potter)',
    phoneContact: '+91 141 2201389',
    artisanUpiVpa: 'kripalkumbh.jaipur@upi',
    heritageYears: 75,
    authorizedUsersCount: '890+ Registered Studio Potters',
    specification: 'Formed without clay using ground quartz stone powder, Fuller’s earth (Multani Mitti), glass frit, natural plant gum (Katira Gond), and water. Fired once at a gentle 800°C–850°C and decorated with cobalt oxide and copper sulfate mineral pigments.',
    technicalParameters: [
      { label: 'Raw Dough Base', value: '100% Clay-Free Ground Quartz & Fuller’s Earth' },
      { label: 'Primary Pigments', value: 'Cobalt Blue Oxide & Natural Copper Sulfate' },
      { label: 'Firing Cycle', value: 'Single Low-Temperature Firing (800°C – 850°C)' },
      { label: 'Glaze Standard', value: 'Non-Toxic Leadless Borax Glass Glaze' }
    ],
    authenticityMarkers: [
      'Clay-free semi-vitrified quartz dough structure with natural microscopic micro-bubbles',
      'Hand-painted mineral brush variations with subtle cobalt gradient brushwork',
      'Low-temperature wood kiln glaze micro-crazing pattern',
      'Distinctive cool acoustic clink and porous unglazed biscuit foot rim'
    ],
    counterfeitMarkers: [
      'Commercial terracotta red clay core covered with blue enamel spray paint',
      'Screen printed or decal transfer pattern with pixelated digital dot matrix',
      'Synthetic high-gloss polyurethane plastic coating',
      'Slip-cast uniform thin wall without manual dough-press density'
    ],
    officialFairPriceRange: '₹650 – ₹950',
    typicalMarketScamPrice: 3500,
    fairBasePrice: 750,
    blockchainHash: 'c198a245d890b31ef902187aa409b615e478201cf10283aa79d2019488a01f72',
    blockIndex: 405,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80'
  },
  '49': {
    applicationNumber: 49,
    certificateNumber: 67,
    giTagNumber: 'GI-IN-0049',
    craftName: 'Channapatna Toys & Dolls',
    officialTitle: 'Channapatna Organic Lacquer Turned Wooden Toys',
    goodsClass: 'Class 28 (Games, Toys & Playthings)',
    state: 'Karnataka',
    region: 'Channapatna (Gombegala Ooru / Toy Town), Ramanagara District',
    filingDate: '12/10/2005',
    registrationDate: '06/06/2006',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '11/10/2035 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: 'Channapatna Crafts Park Artisans Guild & KSTDC',
    registeredAddress: 'Channapatna Craft Park, Bangalore-Mysore Highway, Ramanagara - 562160',
    leadArtisan: 'Syed Khaleel (State Master Craftsman)',
    phoneContact: '+91 80 27251842',
    artisanUpiVpa: 'channapatna.toys@upi',
    heritageYears: 200,
    authorizedUsersCount: '1,750+ Lathe Turners & Lacquerers',
    specification: 'Precision turned on wood lathes using sustainably harvested Wrightia Tinctoria (Ivory Wood / Aale Mara). Polished exclusively on the lathe with natural organic vegetable lacquer colored with turmeric, kumkum, indigo, and acacia resin.',
    technicalParameters: [
      { label: 'Timber Species', value: 'Wrightia Tinctoria (Ivory Wood - Soft & Grainless)' },
      { label: 'Polishing Substance', value: '100% Organic Purified Vegetable Shellac' },
      { label: 'Natural Coloring', value: 'Turmeric (Yellow), Indigo (Blue), Vermilion (Red)' },
      { label: 'Infant Safety', value: 'EN71 & IS 9873 Non-Toxic Certified for Toddlers' }
    ],
    authenticityMarkers: [
      'Lathe-buffed talipot palm leaf friction sheen with zero chemical clear coat',
      'Child-safe natural organic vegetable lac without toxic phthalates or heavy metals',
      'Warm natural wooden touch with smooth non-splinter rounded contours',
      'Natural seasonal wood expansion marks confirming solid wood turning'
    ],
    counterfeitMarkers: [
      'Heavy-metal lead enamel or industrial spray varnish emitting toxic solvent odor',
      'Compressed MDF or sawdust core glued with synthetic formaldehyde resins',
      'Injection-molded hollow plastic body with fake printed wood rings',
      'Sharp molding parting lines'
    ],
    officialFairPriceRange: '₹450 – ₹650',
    typicalMarketScamPrice: 2200,
    fairBasePrice: 500,
    blockchainHash: 'd38291a82b39c04918e9a21804f981023a8901be24501a9cbf18201a4e12089a',
    blockIndex: 406,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80'
  },
  '138': {
    applicationNumber: 138,
    certificateNumber: 112,
    giTagNumber: 'GI-IN-0138',
    craftName: 'Salem Silk',
    officialTitle: 'Salem Pure Venpattu White Mulberry Silk Dhotis',
    goodsClass: 'Class 24 (Textiles & Textile Goods) & Class 25 (Clothing)',
    state: 'Tamil Nadu',
    region: 'Salem (Silk Capital of Tamil Nadu), Dadagapatty & Ammapet',
    filingDate: '14/11/2008',
    registrationDate: '28/01/2010',
    validityStatus: 'REGISTERED & ACTIVE',
    validUpto: '13/11/2038 (Renewed)',
    priorityCountry: 'India',
    registeredProprietor: 'Salem Silk Handloom Weavers Cooperative Production Society Ltd.',
    registeredAddress: 'Handloom Society Complex, Trichy Main Road, Dadagapatty, Salem - 636006',
    leadArtisan: 'K. Subramanian (Veteran Society Weaver)',
    phoneContact: '+91 427 2267819',
    artisanUpiVpa: 'salemsilk.society@upi',
    heritageYears: 110,
    authorizedUsersCount: '2,400+ Pit Loom Handloom Guild Weavers',
    specification: 'Handloom woven on pit-looms using 100% pure high-twist unbleached natural white mulberry raw silk. Distinguished by traditional solid temple borders (Korvai technique) and high GSM fabric weight.',
    technicalParameters: [
      { label: 'Silk Grade', value: 'High Twist Natural White Mulberry Venpattu (GSM 110+)' },
      { label: 'Border Technique', value: 'Traditional Korvai Three-Shuttle Interlocking' },
      { label: 'Weaving Mechanism', value: 'Manual Pit-Loom with Traditional Reed Setup' },
      { label: 'Bleach Policy', value: '100% Unbleached Natural Cream White Lustre' }
    ],
    authenticityMarkers: [
      'Heavyweight supple drape with natural lustrous cream pearl sheen',
      'Solid temple border interlocking showing manual weaver joinery',
      'Silk Mark Organization of India testing compliance',
      'Crisp texture that maintains shape during long temple ceremonies'
    ],
    counterfeitMarkers: [
      'Chemically bleached polyester yarn or synthetic art-silk blend',
      'Printed false temple borders without hand-interlocked weave structure',
      'Static electricity spark under friction test',
      'Rapid puckering and melting under iron testing'
    ],
    officialFairPriceRange: '₹2,400 – ₹3,200',
    typicalMarketScamPrice: 9500,
    fairBasePrice: 2600,
    blockchainHash: '72a19b0481ef02a819c4b281048a9102bca8190284e910283bca910249f81023',
    blockIndex: 407,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80'
  }
};

export default function GIRegistryInspectorPage() {
  const { appId } = useParams();
  const navigate = useNavigate();

  // Normalize lookup key
  const requestedId = (appId || '19').replace(/[^0-9]/g, '') || '19';
  const [currentAppId, setCurrentAppId] = useState(
    GI_REGISTRY_DATABASE[requestedId] ? requestedId : '19'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [qrModal, setQrModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (appId) {
      const clean = appId.replace(/[^0-9]/g, '');
      if (GI_REGISTRY_DATABASE[clean]) {
        setCurrentAppId(clean);
      }
    }
  }, [appId]);

  const record = GI_REGISTRY_DATABASE[currentAppId] || GI_REGISTRY_DATABASE['19'];

  const handlePrint = () => {
    window.print();
  };

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 5000);
    }, 900);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toLowerCase();
    
    // Check if query matches any app number or name
    const foundEntry = Object.entries(GI_REGISTRY_DATABASE).find(([id, data]) => {
      return (
        id === query ||
        data.giTagNumber.toLowerCase().includes(query) ||
        data.craftName.toLowerCase().includes(query) ||
        data.state.toLowerCase().includes(query)
      );
    });

    if (foundEntry) {
      setCurrentAppId(foundEntry[0]);
      navigate(`/gi-registry/${foundEntry[0]}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 font-sans pb-24 print:bg-white print:p-0 print:m-0">
      
      {/* Official Government of India Header Banner */}
      <header className="bg-white border-b border-slate-200/90 shadow-sm print:hidden">
        {/* Tricolor National Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]" />
          <div className="h-full w-1/3 bg-white border-y border-slate-200" />
          <div className="h-full w-1/3 bg-[#138808]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Emblem & Portal Identity */}
          <div className="flex items-center space-x-3.5">
            {/* Ashoka Stambh Lion Capital Representation */}
            <div className="w-12 h-14 bg-gradient-to-b from-amber-50 to-amber-100/60 rounded-xl border border-amber-300/80 flex flex-col items-center justify-center p-1 shadow-sm shrink-0">
              <Scale className="w-6 h-6 text-amber-800" />
              <span className="text-[8px] font-black text-amber-900 tracking-tighter uppercase mt-0.5">सत्यमेव जयते</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Geographical Indications Registry
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  DPIIT Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Office of the Controller General of Patents, Designs & Trade Marks · Ministry of Commerce & Industry, Govt. of India
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <Link
              to="/artisans"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SAFAR Hub</span>
            </Link>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-all flex items-center space-x-1.5 border border-indigo-200 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Print Official Record</span>
            </button>
          </div>
        </div>

        {/* Live Application Switcher Sub-bar */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
              <span className="font-extrabold text-slate-500 text-[11px] uppercase shrink-0 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>GI Registry Applications:</span>
              </span>
              {Object.entries(GI_REGISTRY_DATABASE).map(([id, item]) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentAppId(id);
                    navigate(`/gi-registry/${id}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 transition-all cursor-pointer ${
                    currentAppId === id
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  App #{id} ({item.craftName.split(' ')[0]})
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72 shrink-0">
              <input
                type="text"
                placeholder="Search App #, GI Tag, or Craft..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>
          </div>
        </div>
      </header>

      {/* Main Official Document Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Verification Success Toast */}
        <AnimatePresence>
          {verificationSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500 text-white shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center space-x-2 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>
                  Official Registry Hash Validated against Controller General Registry and SAFAR SHA-256 Provenance Ledger.
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-600 px-2 py-0.5 rounded">STATUS: IMMUTABLE</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Official Certificate / Registry Gazette Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden relative print:border-none print:shadow-none">
          
          {/* Subtle Security Document Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center select-none overflow-hidden">
            <span className="text-[120px] font-black uppercase text-slate-900 rotate-[-25deg] tracking-widest leading-none">
              IP INDIA · DPIIT · GOVT OF INDIA
            </span>
          </div>

          {/* Certificate Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/50 border-b border-amber-200/80">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              
              {/* Emblem & Authority Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-20 rounded-2xl bg-white border-2 border-amber-300 shadow-md flex flex-col items-center justify-center p-1.5 shrink-0">
                  <Scale className="w-8 h-8 text-amber-700" />
                  <span className="text-[9px] font-black text-amber-900 mt-1">सत्यमेव जयते</span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-black text-amber-900 uppercase tracking-widest">
                    GOVERNMENT OF INDIA · MINISTRY OF COMMERCE & INDUSTRY
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    GEOGRAPHICAL INDICATIONS REGISTRY
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    Department for Promotion of Industry and Internal Trade (DPIIT) · Intellectual Property India
                  </p>
                </div>
              </div>

              {/* Legal Status Stamp */}
              <div className="flex flex-col items-center sm:items-end space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black tracking-wider uppercase shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{record.validityStatus}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  GI Certificate No. {record.certificateNumber}
                </span>
                <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Protected under GI Act 1999
                </span>
              </div>
            </div>
          </div>

          {/* Primary Record Metadata Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Title & Classification Box */}
            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                  Registered Geographical Indication Name
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {record.officialTitle}
                </h2>
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{record.region} ({record.state})</span>
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                <span className="text-[11px] font-mono font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-sm">
                  Tag: {record.giTagNumber}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Application #{record.applicationNumber}
                </span>
                <span className="text-[10px] font-extrabold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {record.goodsClass}
                </span>
              </div>
            </div>

            {/* Official Gazette Details Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Left Column: Filing & Registration Specifics */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Statutory Registry Information</span>
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Application Number:</span>
                    <span className="font-mono font-bold text-slate-900">{record.applicationNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Certificate Number:</span>
                    <span className="font-mono font-bold text-slate-900">{record.certificateNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Filing Date:</span>
                    <span className="font-mono font-bold text-slate-900">{record.filingDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Date of Registration:</span>
                    <span className="font-mono font-bold text-slate-900">{record.registrationDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Valid Upto:</span>
                    <span className="font-mono font-bold text-emerald-700">{record.validUpto}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Priority Country:</span>
                    <span className="font-bold text-slate-900">{record.priorityCountry}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Active Certified Artisans:</span>
                    <span className="font-bold text-purple-700">{record.authorizedUsersCount}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Registered Proprietor & Geographical Territory */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span>Registered Proprietor & Guild</span>
                </h3>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Proprietor Name:</span>
                    <span className="font-bold text-slate-900 leading-snug block mt-0.5">
                      {record.registeredProprietor}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Registered Office Address:</span>
                    <span className="font-medium text-slate-700 leading-relaxed block mt-0.5">
                      {record.registeredAddress}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Lead Master Artisan:</span>
                      <span className="font-extrabold text-slate-900">{record.leadArtisan}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Guild Heritage:</span>
                      <span className="font-extrabold text-purple-700">{record.heritageYears}+ Years</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Technical Specification & Authenticity Parameters */}
            <div className="p-5 sm:p-6 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-purple-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Statutory Standards & Material Specifications</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Laboratory Test Benchmarks
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {record.specification}
              </p>

              {/* Grid of parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {record.technicalParameters.map((param, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-purple-200/60 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">{param.label}</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">{param.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Scam Verification Indicators (Govt vs Counterfeit) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Authentic Indicators */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mandatory Authenticity Markers</span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  {record.authenticityMarkers.map((marker, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-black shrink-0">✓</span>
                      <span>{marker}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Counterfeit Markers */}
              <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-rose-900 font-extrabold text-xs uppercase">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Known Counterfeit / Powerloom Markers</span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  {record.counterfeitMarkers.map((marker, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-rose-600 font-black shrink-0">✗</span>
                      <span>{marker}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Anti-Middleman Price Protection & Blockchain Provenance */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    S.A.F.A.R. Cryptographic Provenance & Fair Trade Cap
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Block #{record.blockIndex} · Protocol 95% Direct Artisan Settlement
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Govt Certified Fair Price:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                    {record.officialFairPriceRange}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Middleman Tourist Markup:</span>
                  <span className="text-lg font-black text-rose-400 line-through font-mono mt-0.5 block">
                    ₹{record.typicalMarketScamPrice}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Artisan UPI Direct VPA:</span>
                  <span className="text-xs font-bold text-amber-300 font-mono mt-1 block truncate">
                    {record.artisanUpiVpa}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 font-mono text-[11px] text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-slate-500 font-bold mr-2">SHA-256 PROVENANCE:</span>
                  <span className="text-emerald-400">{record.blockchainHash}</span>
                </div>
                <button
                  onClick={handleRunVerification}
                  disabled={isVerifying}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-all shrink-0 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? 'Verifying Hash...' : 'Verify Cryptographic Seal'}</span>
                </button>
              </div>
            </div>

            {/* Official Statutory Legal Notice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700 font-bold block mb-1">
                Statutory Notice under Section 38 & 39 of The Geographical Indications of Goods Act, 1999:
              </strong>
              Any person falsely representing goods as possessing registered Geographical Indication #{record.giTagNumber} without being an Authorized User enrolled with the Registrar of Geographical Indications, Chennai, is liable for criminal prosecution resulting in forfeiture of goods and imprisonment for a term not less than six months.
            </div>

          </div>

          {/* Document Footer with Official Seals */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-3 text-slate-600">
              <div className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center font-serif font-black text-slate-400">
                SEAL
              </div>
              <div>
                <span className="font-extrabold text-slate-800 block">Registrar of Geographical Indications</span>
                <span className="text-[10px] text-slate-500">Government of India · Geographical Indications Registry, Chennai</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/partner-pay?category=artisan&partnerName=${encodeURIComponent(record.craftName)}&amount=${record.fairBasePrice}`}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Pay / Support Guild Direct</span>
              </Link>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-all flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
