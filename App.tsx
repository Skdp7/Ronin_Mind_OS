
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { 
  ArrowRight, MapPin, Activity, Sun, Wind, Zap, Layers, 
  ShieldCheck, TrendingUp, CheckCircle, BarChart3, Lock, Unlock,
  Search, Filter, Upload, Hexagon, FileText, AlertTriangle,
  Droplets, Mountain, Navigation, Download, Printer, Loader2,
  ChevronDown, Building, Database, Cpu, Globe, Clock, Plus,
  Eye, EyeOff, Edit, Save, X, Coins, FileSpreadsheet, LandPlot, Scale,
  Home, Tent
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { generateLandAnalysisSummary, generateListingDescription } from './services/geminiService';
import { LandListing, AnalysisReport, LandType, BlogPost, DetailedAnalysisData } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

// --- CONFIGURAZIONE BLOG ---
const WORDPRESS_API_URL = 'https://blog.terreninvendita.ai/wp-json/wp/v2/posts?per_page=6&_embed';

// --- MOCK DATA CONSTANTS (FALLBACK) ---
const MOCK_LISTINGS_FALLBACK: LandListing[] = [
  {
    id: '1',
    title: 'Terreno Edificabile Panoramico',
    price: 145000,
    sizeSqm: 2500,
    type: LandType.BUILDABLE,
    location: 'Toscana, Chianti',
    imageUrl: 'https://image.pollinations.ai/prompt/tuscany%20vineyard%20sunny%20hills%20cinematic%204k?width=800&height=600&nologo=true',
    description: 'Splendido lotto con vista vigneti, esposizione sud perfetta per fotovoltaico. Analisi geologica eccellente.',
    aiScore: 92,
    features: ['Vista', 'Accesso Strada', 'Acqua', 'Elettricità'],
    isPremium: true
  },
  {
    id: '2',
    title: 'Uliveto Produttivo Bio',
    price: 85000,
    sizeSqm: 15000,
    type: LandType.AGRICULTURAL,
    location: 'Puglia, Ostuni',
    imageUrl: 'https://image.pollinations.ai/prompt/puglia%20olive%20trees%20ancient%20dry%20stone%20wall%20sunny?width=800&height=600&nologo=true',
    description: 'Terreno agricolo pianeggiante con 200 ulivi secolari. Analisi del suolo perfetta per biologico.',
    aiScore: 88,
    features: ['Ulivi', 'Pozzo', 'Pianeggiante']
  },
  {
    id: '3',
    title: 'Area Industriale ZES',
    price: 450000,
    sizeSqm: 5000,
    type: LandType.INDUSTRIAL,
    location: 'Campania, Napoli',
    imageUrl: 'https://image.pollinations.ai/prompt/industrial%20land%20modern%20logistics%20hub%20sunset%20architectural?width=800&height=600&nologo=true',
    description: 'Lotto industriale in zona economica speciale. Logistica avanzata e connessioni fibra.',
    aiScore: 75,
    features: ['ZES', 'Fibra', 'Autostrada']
  }
];

const MOCK_FEATURED_LISTINGS_FALLBACK = [
  {
    id: 'f1',
    location: 'San Lorenzo (RC)',
    price: 60000,
    area: '60.000',
    type: 'seminativo',
    status: 'In vendita',
    img: 'https://image.pollinations.ai/prompt/calabria%20hills%20green%20landscape%20agriculture?width=800&height=600&nologo=true',
    priceLabel: '€ 60.000'
  },
  {
    id: 'f2',
    location: 'Perugia (PG)',
    price: 0,
    area: '90.000',
    type: 'residenziale',
    status: 'In vendita',
    img: 'https://image.pollinations.ai/prompt/umbria%20countryside%20medieval%20view%20sunset?width=800&height=600&nologo=true',
    priceLabel: 'tratt. riservata'
  },
  {
    id: 'f3',
    location: 'Roma (RM)',
    price: 990000,
    area: '4.364',
    type: 'residenziale',
    status: 'In vendita',
    img: 'https://image.pollinations.ai/prompt/rome%20suburbs%20green%20land%20buildable%20luxury?width=800&height=600&nologo=true',
    priceLabel: '€ 990.000'
  },
  {
    id: 'f4',
    location: 'Trevi (PG)',
    price: 98000,
    area: '1.880',
    type: 'residenziale',
    status: 'In vendita',
    img: 'https://image.pollinations.ai/prompt/trevi%20italy%20olive%20grove%20hillside?width=800&height=600&nologo=true',
    priceLabel: '€ 98.000'
  }
];

const MOCK_BLOG: BlogPost[] = [
  {
    id: '1',
    title: 'Benvenuto su terreninvendita.ai',
    excerpt: 'Il tuo blog non è ancora attivo su Hostinger. Appena installerai WordPress su blog.terreninvendita.ai, i tuoi articoli appariranno qui automaticamente.',
    category: 'System',
    readTime: '1 min',
    imageUrl: 'https://image.pollinations.ai/prompt/futuristic%20digital%20landscape%20blue%20neon?width=800&height=400&nologo=true',
    date: new Date().toLocaleDateString()
  },
  {
    id: '2',
    title: 'Fotovoltaico nei Terreni Agricoli: Le nuove norme 2025',
    excerpt: 'Analisi del decreto agri-voltaico e come massimizzare la rendita del tuo terreno.',
    category: 'Energia',
    readTime: '5 min',
    imageUrl: 'https://picsum.photos/800/400?random=4',
    date: '12 Maggio 2025'
  },
  {
    id: '3',
    title: 'Indici di Edificabilità: Come cambiano con il Piano Casa',
    excerpt: 'Guida completa per capire quanto puoi costruire sul tuo lotto.',
    category: 'Normativa',
    readTime: '8 min',
    imageUrl: 'https://picsum.photos/800/400?random=5',
    date: '08 Maggio 2025'
  }
];

const SOLAR_DATA = [
  { name: '06:00', val: 10 }, { name: '08:00', val: 45 },
  { name: '10:00', val: 80 }, { name: '12:00', val: 100 },
  { name: '14:00', val: 85 }, { name: '16:00', val: 50 },
  { name: '18:00', val: 15 },
];

const TEMP_DATA = [
  { name: 'Gen', temp: 12, rain: 45 },
  { name: 'Feb', temp: 13, rain: 40 },
  { name: 'Mar', temp: 16, rain: 35 },
  { name: 'Apr', temp: 19, rain: 30 },
  { name: 'Mag', temp: 23, rain: 20 },
  { name: 'Giu', temp: 27, rain: 10 },
  { name: 'Lug', temp: 30, rain: 5 },
  { name: 'Ago', temp: 30, rain: 10 },
  { name: 'Set', temp: 25, rain: 25 },
  { name: 'Ott', temp: 20, rain: 40 },
  { name: 'Nov', temp: 16, rain: 55 },
  { name: 'Dic', temp: 13, rain: 50 },
];

// --- FINANCIAL & MATH HELPERS ---

type ScenarioType = 'solar' | 'glamping' | 'construction';

// Funzione per calcolare il business plan simulato
const calculateFinancials = (irradiance: number, sizeSqm: number = 5000, scenario: ScenarioType = 'solar') => {
  
  let capex = 0;
  let annualRevenue = 0;
  let label1 = '';
  let label2 = '';
  const cashFlow = [];

  if (scenario === 'solar') {
    // SCENARIO: AGRI-VOLTAICO
    label1 = 'Potenza (kWp)';
    label2 = 'Ricavo Energia';
    const usableArea = sizeSqm * 0.4;
    const systemSizeKw = Math.floor(usableArea / 6); 
    const annualProductionKwh = systemSizeKw * (irradiance / 1000) * 1200; 
    capex = systemSizeKw * 1100; 
    const energyPrice = 0.09; 
    annualRevenue = annualProductionKwh * energyPrice;
    const opex = capex * 0.02;
    let cumulative = -capex;
    for(let i = 1; i <= 20; i++) {
      const yearlyProd = annualProductionKwh * (1 - (i * 0.005));
      const yearlyRev = yearlyProd * energyPrice;
      const net = yearlyRev - opex;
      cumulative += net;
      cashFlow.push({ year: `Y${i}`, net: Math.round(cumulative), cash: Math.round(net) });
    }
    const roi = ((cumulative / capex) * 100).toFixed(1);
    const paybackYear = cashFlow.find(c => c.net > 0)?.year || 'N/A';
    return { mainMetric: systemSizeKw, metricLabel: label1, capex: Math.round(capex), annualRevenue: Math.round(annualRevenue), roi, paybackYear, cashFlow };

  } else if (scenario === 'glamping') {
    // SCENARIO: GLAMPING / TURISMO
    label1 = 'Unità (Tende)';
    label2 = 'Fatturato Booking';
    const units = Math.floor(sizeSqm / 1000); // 1 tenda ogni 1000mq per privacy
    const occupancyRate = 0.45; // 45% occupazione annua
    const pricePerNight = 120;
    const revenuePerUnit = pricePerNight * 365 * occupancyRate;
    
    capex = units * 35000; // Costo allestimento unità + servizi
    annualRevenue = units * revenuePerUnit;
    const opex = annualRevenue * 0.40; // 40% costi gestione (pulizie, marketing)
    let cumulative = -capex;
    for(let i = 1; i <= 20; i++) {
      const yearlyRev = annualRevenue * (1 + (i * 0.02)); // Inflazione prezzi 2%
      const net = yearlyRev - opex;
      cumulative += net;
      cashFlow.push({ year: `Y${i}`, net: Math.round(cumulative), cash: Math.round(net) });
    }
    const roi = ((cumulative / capex) * 100).toFixed(1);
    const paybackYear = cashFlow.find(c => c.net > 0)?.year || 'N/A';
    return { mainMetric: units, metricLabel: label1, capex: Math.round(capex), annualRevenue: Math.round(annualRevenue), roi, paybackYear, cashFlow };

  } else {
    // SCENARIO: COSTRUZIONE RESIDENZIALE
    label1 = 'Sup. Edificabile (mq)';
    label2 = 'Valore Immobile';
    
    // Assumiamo un indice di edificabilità medio-basso se non specificato (es. agricolo residenziale o espansione)
    // In un'app reale questo verrebbe dai dati urbanistici
    const buildabilityIndex = 0.15; // 0.15 mq/mq
    const buildableSqm = Math.floor(sizeSqm * buildabilityIndex);
    
    const constructionCostPerSqm = 1800; // Costo costruzione qualità media
    capex = buildableSqm * constructionCostPerSqm; // Costo totale operazione
    
    const marketValuePerSqm = 2900; // Valore vendita finito
    const totalMarketValue = buildableSqm * marketValuePerSqm;
    annualRevenue = totalMarketValue; // Qui inteso come Exit Value
    
    // Cashflow per costruzione è diverso: Uscita Y1-Y2, Entrata Y3 (Vendita)
    let cumulative = 0;
    for(let i = 1; i <= 5; i++) {
      let net = 0;
      if (i === 1) { net = -capex * 0.4; } // Acquisto + Progetto
      else if (i === 2) { net = -capex * 0.6; } // Costruzione
      else if (i === 3) { net = totalMarketValue; } // Vendita
      else { net = 0; }
      
      cumulative += net;
      cashFlow.push({ year: `Y${i}`, net: Math.round(cumulative), cash: Math.round(net) });
    }
     // ROI Sviluppatore
    const profit = totalMarketValue - capex;
    const roi = ((profit / capex) * 100).toFixed(1);
    
    return { 
      mainMetric: buildableSqm, 
      metricLabel: label1, 
      capex: Math.round(capex), 
      annualRevenue: Math.round(totalMarketValue), // Mostra valore finale
      roi, 
      paybackYear: 'Y3', 
      cashFlow 
    };
  }
};


// --- REAL API HELPERS ---

async function getCoordinates(address: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}

async function getRealElevation(lat: number, lng: number): Promise<number> {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
    const data = await response.json();
    return data.elevation?.[0] || 0;
  } catch (error) {
    console.error("Error fetching elevation:", error);
    return 0;
  }
}

async function getRealWeatherHistory(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,precipitation_sum&past_days=92&forecast_days=0`
    );
    const data = await response.json();
    
    if (!data.daily) return [];
    
    const result = [];
    const len = data.daily.time.length;
    const step = Math.floor(len / 12) || 1;
    
    for (let i = 0; i < len; i += step) {
       result.push({
         name: new Date(data.daily.time[i]).toLocaleDateString('it-IT', { month: 'short' }),
         temp: data.daily.temperature_2m_max[i] || 0,
         rain: data.daily.precipitation_sum[i] || 0
       });
    }
    return result.slice(0, 12);
  } catch (error) {
    console.error("Error fetching weather:", error);
    return [];
  }
}


// --- COMPONENTS ---

const SearchWidget = ({ onSearch }: { onSearch: () => void }) => {
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');
  const [radius, setRadius] = useState(50);

  return (
    <div className="w-full max-w-md mx-auto lg:ml-auto relative z-20 animate-float">
      {/* Tabs - Floating above */}
      <div className="flex space-x-1 mb-2">
        <button 
          onClick={() => setActiveTab('sale')}
          className={`px-6 py-2 rounded-t-lg text-sm font-medium transition-all ${
            activeTab === 'sale' 
              ? 'bg-white text-black' 
              : 'bg-black/40 text-gray-400 hover:text-white backdrop-blur-md'
          }`}
        >
          In vendita
        </button>
        <button 
          onClick={() => setActiveTab('rent')}
          className={`px-6 py-2 rounded-t-lg text-sm font-medium transition-all ${
            activeTab === 'rent' 
              ? 'bg-white text-black' 
              : 'bg-black/40 text-gray-400 hover:text-white backdrop-blur-md'
          }`}
        >
          In affitto
        </button>
      </div>

      {/* Main Card */}
      <div className="glass-card p-6 md:p-8 rounded-b-2xl rounded-tr-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
        <h3 className="text-2xl font-display font-bold text-white mb-6">Trova il tuo terreno</h3>
        
        <div className="space-y-5">
          {/* Location Input */}
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Città o CAP (es. Milano)" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>

          {/* Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-gray-400">
              <span>Km 5</span>
              <span className="text-primary-400 font-bold">Km {radius}</span>
              <span>Km 200</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="200" 
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:accent-primary-400"
            />
          </div>

          {/* Dropdowns */}
          <div className="space-y-3">
            <div className="relative">
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-300 appearance-none focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer hover:bg-white/10 transition-colors">
                <option>Tipologia terreno</option>
                <option>Edificabile</option>
                <option>Agricolo</option>
                <option>Industriale</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-300 appearance-none focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer hover:bg-white/10 transition-colors">
                <option>Superficie minima</option>
                <option>1.000 m²</option>
                <option>5.000 m²</option>
                <option>10.000 m²</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-300 appearance-none focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer hover:bg-white/10 transition-colors">
                <option>Prezzo massimo</option>
                <option>€ 50.000</option>
                <option>€ 150.000</option>
                <option>€ 500.000</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={onSearch}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.7)] flex justify-center items-center gap-2 active:scale-95 mt-2"
          >
            <Search className="w-5 h-5" />
            CERCA
          </button>
        </div>
      </div>
    </div>
  );
};

const HeroSection = ({ onAnalyzeClick, onMarketplaceClick }: { onAnalyzeClick: () => void, onMarketplaceClick: () => void }) => (
  <div className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-10 lg:pt-20 lg:pb-20">
    {/* Background */}
    <div className="absolute inset-0 z-0">
      <img src="https://picsum.photos/1920/1080?blur=4&grayscale" className="w-full h-full object-cover opacity-20" alt="Background" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/10 via-black to-black"></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
        
        {/* Left Column: Text & Main CTA */}
        <div className="text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-float mx-auto lg:mx-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span className="text-sm text-gray-300 font-mono">AI Engine v3.0 Online</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-display tracking-tight leading-tight">
            Decodifica il <br className="hidden md:block"/>valore 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-500 animate-glow block mt-2">
              Scientifico della Terra
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Analisi geologica, climatica ed urbanistica istantanea potenziata dall'IA.
            Scopri il vero potenziale del tuo terreno prima di vendere o comprare.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
            <button 
              onClick={onAnalyzeClick}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-medium text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Activity className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
              Analisi AI
            </button>
            <button 
              onClick={onMarketplaceClick}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium text-lg transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-3 cursor-pointer group"
            >
               Esplora Market
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Column: Search Widget */}
        <div className="order-1 lg:order-2 w-full">
          <SearchWidget onSearch={onMarketplaceClick} />
        </div>

      </div>

      {/* CENTERED STATS HUD */}
      <div className="relative mt-8 w-full max-w-6xl mx-auto">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
           {[
             { label: 'Dataset Europei', val: '45TB+', icon: Database },
             { label: 'Terreni Analizzati', val: '12k+', icon: Globe },
             { label: 'Motore AI', val: 'Gen v3.5', icon: Cpu },
             { label: 'Tempo Scansione', val: '< 3.2s', icon: Clock },
           ].map((stat, i) => (
             <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all duration-500 group hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(34,197,94,0.15)] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <stat.icon className="w-6 h-6 text-gray-600 mb-3 group-hover:text-primary-500 transition-colors duration-300" />
                
                <div className="text-3xl md:text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 group-hover:from-white group-hover:to-primary-400 transition-all duration-300">
                  {stat.val}
                </div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-medium mt-2 group-hover:text-primary-400/80 transition-colors">
                  {stat.label}
                </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  </div>
);

const FeaturedSection = () => {
  const [listings, setListings] = useState(MOCK_FEATURED_LISTINGS_FALLBACK);
  const [adminMode, setAdminMode] = useState(false);

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setListings(prev => prev.map(item => 
            item.id === id ? { ...item, img: ev.target!.result as string } : item
          ));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleTextChange = (id: string, field: 'location' | 'priceLabel', val: string) => {
     setListings(prev => prev.map(item => 
       item.id === id ? { ...item, [field]: val } : item
     ));
  };

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Vuoi mostrare qui la tua proprietà?
          </h2>
          <p className="text-gray-400 max-w-2xl">
            I terreni migliori d'Italia scelti dall'AI. Dai visibilità al tuo lotto o esplora le opportunità.
          </p>
        </div>
        <div className="flex items-center gap-4">
             <button 
              onClick={() => setAdminMode(!adminMode)}
              className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all ${adminMode ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
             >
               {adminMode ? 'ADMIN MODE ON' : 'Admin Mode'}
             </button>
            <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95">
              Pubblica il tuo annuncio <Plus className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Featured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {listings.map((item) => (
          <div key={item.id} className="group relative bg-[#1a1a1d] rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            
            {/* Image & Badge */}
            <div className="h-48 relative overflow-hidden bg-black">
               {adminMode && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                     <label className="cursor-pointer flex flex-col items-center text-white">
                       <Upload className="w-6 h-6 mb-1" />
                       <span className="text-xs">Carica Foto</span>
                       <input type="file" className="hidden" onChange={(e) => handleImageChange(item.id, e)} accept="image/*" />
                     </label>
                  </div>
               )}
              <img src={item.img} alt={item.location} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 text-xs font-medium text-white rounded border border-white/10">
                {item.status}
              </div>
              
              {adminMode ? (
                 <input 
                   value={item.priceLabel} 
                   onChange={(e) => handleTextChange(item.id, 'priceLabel', e.target.value)}
                   className="absolute bottom-3 left-3 px-2 py-1 text-sm font-bold text-white bg-orange-500 rounded shadow-lg w-24 border-none outline-none"
                 />
              ) : (
                <div className={`absolute bottom-3 left-3 px-3 py-1 text-sm font-bold text-white rounded shadow-lg ${item.priceLabel.includes('riservata') ? 'bg-orange-500' : 'bg-orange-500'}`}>
                  {item.priceLabel}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 bg-[#0E151C]">
              {adminMode ? (
                <input 
                   value={item.location} 
                   onChange={(e) => handleTextChange(item.id, 'location', e.target.value)}
                   className="w-full bg-transparent text-white font-medium mb-1 border-b border-white/20 focus:border-primary-500 outline-none"
                 />
              ) : (
                <h3 className="text-white font-medium mb-1 truncate" title={item.location}>{item.location}</h3>
              )}
              <p className="text-gray-500 text-xs mb-4 truncate">{item.location}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Area</div>
                  <div className="text-white font-mono text-sm">{item.area} m²</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Tipo</div>
                  <div className="text-white font-mono text-sm">{item.type}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dual Choice Publishing */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Public Option */}
        <div className="relative group overflow-hidden rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-blue-900/20 to-transparent hover:bg-blue-900/30 transition-all cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Globe className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pubblica Annuncio Pubblico</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Massima visibilità sul marketplace. Raggiungi migliaia di investitori e costruttori ogni giorno. Indicizzazione SEO inclusa.
            </p>
            <span className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all">
              Inizia Listing Pubblico <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Private Option */}
        <div className="relative group overflow-hidden rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-zinc-800/40 to-transparent hover:bg-zinc-800/60 transition-all cursor-pointer">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Lock className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-gray-400">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Listing Privato (Off-Market)</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Vendita riservata visibile solo a investitori verificati "Tier-1". Proteggi la tua privacy e negozia con discrezione.
            </p>
            <span className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
              Richiedi Accesso Privato <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketplacePage = () => {
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  
  // Form State
  const [newListing, setNewListing] = useState({
    title: '', price: '', location: '', size: '', type: 'Agricolo', description: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
      setLoading(true);
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          if (data) {
            const mappedListings: LandListing[] = data.map(item => ({
                id: item.id.toString(),
                title: item.title,
                price: item.price,
                sizeSqm: item.size_sqm,
                type: item.type as LandType,
                location: item.location,
                imageUrl: item.image_url || 'https://picsum.photos/800/600',
                description: item.description,
                aiScore: item.ai_score || 80,
                features: item.features || [],
                isPremium: item.is_premium
            }));
            setListings(mappedListings);
          }
        } catch (err) {
          console.error("Supabase Error:", err);
          setListings(MOCK_LISTINGS_FALLBACK);
        }
      } else {
        setListings(MOCK_LISTINGS_FALLBACK);
      }
      setLoading(false);
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured() || !supabase) {
      alert("Database non configurato. Impossibile salvare.");
      return;
    }

    try {
      const { error } = await supabase
        .from('listings')
        .insert([{
           title: newListing.title,
           price: parseFloat(newListing.price),
           location: newListing.location,
           size_sqm: parseFloat(newListing.size),
           type: newListing.type,
           description: newListing.description,
           image_url: `https://image.pollinations.ai/prompt/${encodeURIComponent(newListing.type + ' land ' + newListing.location)}?width=800&height=600&nologo=true`,
           ai_score: Math.floor(Math.random() * 20) + 70,
           features: ['Nuovo Inserimento', 'Verificato']
        }]);

      if (error) throw error;

      alert("Terreno pubblicato con successo!");
      setShowSellModal(false);
      fetchListings(); // Refresh list
      // Reset form
      setNewListing({ title: '', price: '', location: '', size: '', type: 'Agricolo', description: '' });

    } catch (err) {
      console.error("Error inserting:", err);
      alert("Errore durante la pubblicazione.");
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 bg-[#050505]">
      {showSellModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-[#1a1a1d] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative">
              <button onClick={() => setShowSellModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
              
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white font-display">Pubblica Nuovo Terreno</h3>
              </div>
              
              <form onSubmit={handleSellSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Titolo Annuncio</label>
                  <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" 
                    value={newListing.title} onChange={e => setNewListing({...newListing, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs text-gray-400 mb-1">Prezzo (€)</label>
                      <input required type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" 
                        value={newListing.price} onChange={e => setNewListing({...newListing, price: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs text-gray-400 mb-1">Mq</label>
                      <input required type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" 
                        value={newListing.size} onChange={e => setNewListing({...newListing, size: e.target.value})} />
                   </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Località</label>
                  <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white" 
                    value={newListing.location} onChange={e => setNewListing({...newListing, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tipologia</label>
                  <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white"
                     value={newListing.type} onChange={e => setNewListing({...newListing, type: e.target.value})}>
                     <option>Agricolo</option>
                     <option>Edificabile</option>
                     <option>Industriale</option>
                     <option>Boschivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Descrizione</label>
                  <textarea className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white h-24" 
                    value={newListing.description} onChange={e => setNewListing({...newListing, description: e.target.value})} />
                </div>
                
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl mt-4">
                   Pubblica Ora
                </button>
              </form>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Marketplace Terreni</h1>
            <p className="text-gray-400">Esplora terreni certificati con AI Score ambientale.</p>
             {!isSupabaseConfigured() && (
               <span className="text-xs text-amber-500 mt-1 inline-block border border-amber-500/30 px-2 py-1 rounded bg-amber-500/10">Demo Mode (Database Disconnesso)</span>
             )}
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10"><Filter className="w-5 h-5"/></button>
            <button 
              onClick={() => setShowSellModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Vendi il tuo terreno
            </button>
          </div>
        </div>

        {/* Filters Bar (Simplified) */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['Tutti', 'Edificabili', 'Agricoli', 'Boschivi', 'Industriali'].map((f, i) => (
            <button key={i} className={`px-4 py-2 rounded-full text-sm border transition-all ${i === 0 ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
           <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((land) => (
              <div key={land.id} className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={land.imageUrl} alt={land.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-1">
                    <Activity className="w-3 h-3 text-primary-500" />
                    AI Score {land.aiScore}
                  </div>
                  {land.isPremium && (
                    <div className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-black flex items-center gap-1">
                      Premium
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-medium text-primary-400 uppercase tracking-wider">{land.type}</div>
                    <div className="text-lg font-bold text-white">€ {land.price.toLocaleString()}</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-display">{land.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{land.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {land.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/5">{f}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {land.location}</div>
                    <div className="flex items-center gap-1"><Layers className="w-4 h-4" /> {land.sizeSqm} m²</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(WORDPRESS_API_URL);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        
        const mappedPosts: BlogPost[] = data.map((p: any) => ({
          id: p.id.toString(),
          title: p.title.rendered,
          excerpt: p.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 120) + '...',
          category: 'News',
          readTime: '5 min',
          imageUrl: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://picsum.photos/800/600?random=' + p.id,
          date: new Date(p.date).toLocaleDateString('it-IT')
        }));
        
        if (mappedPosts.length > 0) {
            setPosts(mappedPosts);
        } else {
            setPosts(MOCK_BLOG);
        }
      } catch (err) {
        console.warn("Errore caricamento blog (uso mock):", err);
        setPosts(MOCK_BLOG);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
             <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Journal Tecnico
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Approfondimenti su normativa, tecnologia agrivoltaica e mercato fondiario.
                Direttamente dal nostro network di esperti.
            </p>
        </div>
       
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1,2].map(i => (
                   <div key={i} className="animate-pulse">
                      <div className="bg-white/5 rounded-2xl h-64 mb-4"></div>
                      <div className="h-4 bg-white/5 rounded w-1/4 mb-2"></div>
                      <div className="h-8 bg-white/5 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-white/5 rounded w-full"></div>
                   </div>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
                <article key={post.id} className="group cursor-pointer flex flex-col h-full glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-primary-500/30 transition-all hover:-translate-y-1">
                    <div className="h-48 overflow-hidden relative">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1 text-white text-xs rounded-full font-medium border border-white/10">
                        {post.category}
                    </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span>{post.readTime} read</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2" dangerouslySetInnerHTML={{__html: post.title}}></h2>
                    <p className="text-gray-400 leading-relaxed text-sm line-clamp-3 mb-6" dangerouslySetInnerHTML={{__html: post.excerpt}}></p>
                    
                    <div className="mt-auto flex items-center text-primary-500 font-medium text-sm gap-2 group-hover:gap-4 transition-all">
                        Leggi articolo <ArrowRight className="w-4 h-4" />
                    </div>
                    </div>
                </article>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

const AnalysisPage = () => {
  const [step, setStep] = useState<'input' | 'scanning' | 'result'>('input');
  const [inputType, setInputType] = useState<'address' | 'gps' | 'cadastral'>('address');
  const [inputValue, setInputValue] = useState('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [weatherChartData, setWeatherChartData] = useState<any[]>([]);
  
  // Premium State
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [financialData, setFinancialData] = useState<any>(null);
  const [scenario, setScenario] = useState<ScenarioType>('solar');

  const scanPhases = [
    "Connessione a OpenStreetMap Geocoding...",
    "Analisi Open-Meteo Climate Reanalysis...",
    "Rilevamento Altimetria Satellitare...",
    "Calcolo irraggiamento solare...",
    "Sintesi AI Generativa..."
  ];

  const handleScan = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const searchTerm = inputValue || "Roma, Italia";
    
    setStep('scanning');
    setScanPhase(0);

    let lat = 41.9028;
    let lng = 12.4964;
    let formattedAddress = searchTerm;
    let realElevation = 50;
    let estimatedIrradiance = 1300;

    try {
      setScanPhase(0);
      try {
        if (inputType === 'address' || inputType === 'cadastral') {
          const coords = await getCoordinates(searchTerm);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
            formattedAddress = coords.display_name;
          }
        } else if (inputType === 'gps') {
          const parts = searchTerm.split(',');
          if (parts.length === 2) {
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
          }
        }
      } catch (err) {
        console.warn("Geocoding failed");
      }
      await new Promise(r => setTimeout(r, 800));

      setScanPhase(1);
      try {
        const realWeather = await getRealWeatherHistory(lat, lng);
        if (realWeather && realWeather.length > 0) {
            setWeatherChartData(realWeather);
        } else {
            setWeatherChartData(TEMP_DATA);
        }
      } catch (err) {
        setWeatherChartData(TEMP_DATA);
      }
      await new Promise(r => setTimeout(r, 800));

      setScanPhase(2);
      try {
        const elev = await getRealElevation(lat, lng);
        if (elev) realElevation = elev;
      } catch (err) {}
      await new Promise(r => setTimeout(r, 800));

      setScanPhase(3);
      await new Promise(r => setTimeout(r, 600));
      estimatedIrradiance = Math.floor(1200 + (1000 * (1 - Math.abs(lat - 45) / 90)));
      
      // Initial Financials (Solar default)
      const financials = calculateFinancials(estimatedIrradiance, 10000, 'solar'); 
      setFinancialData(financials);

      setScanPhase(4);

      const mockDetailedData: DetailedAnalysisData = {
        morphology: {
          elevation: realElevation,
          slope: Math.floor(Math.random() * 15) + 2, 
          exposure: 'Sud-Ovest', 
          terrainType: realElevation > 600 ? 'Montano' : realElevation > 300 ? 'Collinare' : 'Pianeggiante'
        },
        solar: {
          irradiance: estimatedIrradiance,
          sunHours: 2500,
          pvPotential: estimatedIrradiance > 1500 ? 'Eccellente' : 'Medio',
          shadingLoss: 3
        },
        wind: {
          speedAvg: 4.2,
          directionDominant: 'NW',
          gustPeak: 11
        },
        geology: {
          soilType: 'Argilloso-Limoso',
          permeability: 'Media',
          loadBearing: 'Standard',
          clcClass: 'Sistemi colturali e particellari complessi'
        },
        risks: {
          seismicZone: '2', 
          floodHazard: 'P1', 
          landslideRisk: 'R1'
        },
        context: {
          urbanDensity: 'Media',
          nearestRoad: 100,
          noiseLevel: 45,
          accessQuality: 7
        }
      };

      const mockReport: AnalysisReport = {
        id: Date.now().toString(),
        address: formattedAddress,
        coordinates: { lat, lng },
        scores: {
          agriculture: 85,
          construction: 70,
          solar: 90,
          environmental: 82,
          total: 84
        },
        data: mockDetailedData,
        aiSummary: '',
        recommendations: [],
        generatedAt: new Date()
      };

      setAiLoading(true);
      const aiResult = await generateLandAnalysisSummary(formattedAddress, mockDetailedData);
      mockReport.aiSummary = aiResult.summary;
      mockReport.recommendations = aiResult.recommendations;
      setAiLoading(false);

      setReport(mockReport);
      setStep('result');

    } catch (error) {
      setStep('result'); 
    }
  };

  // Recalculate when scenario changes
  useEffect(() => {
    if (report && report.data.solar.irradiance) {
       const financials = calculateFinancials(report.data.solar.irradiance, 10000, scenario);
       setFinancialData(financials);
    }
  }, [scenario, report]);


  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => {
       setIsPremiumUnlocked(true);
       setUnlocking(false);
    }, 2000);
  };

  const handleDownloadPDF = () => {
    setShowPdfModal(true);
    setTimeout(() => {
      setShowPdfModal(false);
      alert("PDF scaricato con successo! (Simulazione)");
    }, 3000);
  };

  if (step === 'input') {
    return (
      <div className="min-h-screen pt-32 px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-8 md:p-12 border border-primary-500/30 shadow-[0_0_50px_-20px_rgba(34,197,94,0.2)]">
            <div className="flex justify-center mb-8">
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                {[
                  { id: 'address', icon: MapPin, label: 'Indirizzo' },
                  { id: 'cadastral', icon: FileText, label: 'Catasto' },
                  { id: 'gps', icon: Navigation, label: 'GPS' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInputType(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                      inputType === tab.id 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <h2 className="text-3xl font-display font-bold text-white text-center mb-2">Analisi Scientifica Terreno</h2>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Il sistema interrogherà <span className="text-primary-400">Open-Meteo, OSM & Gemini AI</span> in tempo reale.
            </p>
            
            <div className="space-y-4 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 pointer-events-none"></div>
              
              <div className="relative z-10">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    inputType === 'address' ? "Es: Via Napoli, Roma" :
                    inputType === 'cadastral' ? "Es: Foglio 12, Particella 450" :
                    "Es: 41.9028, 12.4964"
                  }
                  className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-6 py-5 text-white text-lg placeholder:text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-inner"
                />
              </div>
              
              <button 
                onClick={handleScan}
                className="relative z-10 w-full bg-white text-black hover:bg-gray-100 font-bold py-5 rounded-xl transition-all flex justify-center items-center gap-3 text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer active:scale-95 z-10"
              >
                <Activity className="w-6 h-6 text-primary-600" />
                Avvia Scansione Live
              </button>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-gray-500 font-mono uppercase tracking-wider text-center">
              <span className="flex justify-center items-center gap-1"><Layers className="w-3 h-3" /> Open Elevation</span>
              <span className="flex justify-center items-center gap-1"><Sun className="w-3 h-3" /> Solar Calc</span>
              <span className="flex justify-center items-center gap-1"><Wind className="w-3 h-3" /> Open-Meteo API</span>
              <span className="flex justify-center items-center gap-1"><MapPin className="w-3 h-3" /> Nominatim GPS</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'scanning') {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 bg-[#050505]">
        <div className="w-full max-w-md">
           <div className="relative w-64 h-64 mx-auto mb-12">
             <div className="absolute inset-0 border border-primary-900/50 rounded-full"></div>
             <div className="absolute inset-[15%] border border-primary-900/50 rounded-full"></div>
             <div className="absolute inset-[30%] border border-primary-900/50 rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent -translate-y-1/2 -translate-x-1/2 animate-spin origin-center opacity-50"></div>
             <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,197,94,0.1)_360deg)] animate-spin rounded-full"></div>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:20px_20px] rounded-full opacity-20"></div>
           </div>

           <div className="space-y-6">
             <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary-500 transition-all duration-500 ease-out shadow-[0_0_10px_#22c55e]"
                 style={{ width: `${((scanPhase + 1) / scanPhases.length) * 100}%` }}
               ></div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-xl font-mono font-bold text-white tracking-widest uppercase animate-pulse">
                   Analisi in corso
                </h3>
                <p className="text-primary-400 font-mono text-sm h-6">
                  {'>'} {scanPhases[scanPhase]}
                </p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 bg-[#050505] relative">
      {showPdfModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#111] border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Generazione PDF...</h3>
            <p className="text-gray-400 text-sm mb-4">Sto componendo il report vettoriale ad alta risoluzione con i dati reali appena scaricati.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-xs font-mono uppercase border border-primary-500/30">Live Data Verified</span>
              <span className="text-gray-500 text-xs">{new Date().toLocaleDateString()}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-1 max-w-2xl truncate">{report?.address}</h2>
            <div className="flex gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {report?.coordinates.lat.toFixed(5)}, {report?.coordinates.lng.toFixed(5)}</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Catasto: Dati Simulati</span>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => window.print()}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 p-3 rounded-xl transition-all"
             >
               <Printer className="w-5 h-5" />
             </button>
             <button 
              onClick={handleDownloadPDF}
              className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] flex items-center gap-2"
             >
               <Download className="w-5 h-5" />
               Scarica Report
             </button>
          </div>
        </div>

        {/* AI Summary & Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card p-8 rounded-2xl border-l-4 border-primary-500 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-primary-500 fill-primary-500/20" />
                Sintesi Esecutiva AI
              </h3>
              {aiLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 leading-relaxed mb-6 text-lg font-light">
                    {report?.aiSummary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report?.recommendations.map((rec, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary-400 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> {rec}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/10 to-transparent pointer-events-none"></div>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center relative">
            <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-4">Potential Score</h4>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" stroke="#22c55e" strokeWidth="8" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * (report?.scores.total || 0) / 100)} 
                  className="drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-5xl font-bold text-white block">{report?.scores.total}</span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <div className="text-center">
                <div className="text-xs text-gray-500">Agricolo</div>
                <div className="text-white font-bold">{report?.scores.agriculture}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Edilizio</div>
                <div className="text-white font-bold">{report?.scores.construction}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Morphology */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-primary-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
              <Mountain className="w-4 h-4" /> Morfologia
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end pb-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Altitudine</span>
                <span className="text-white font-mono text-lg">{report?.data.morphology.elevation.toFixed(1)} <span className="text-xs text-gray-500">m</span></span>
              </div>
              <div className="flex justify-between items-end pb-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Pendenza</span>
                <span className="text-white font-mono text-lg">{report?.data.morphology.slope}<span className="text-xs text-gray-500">%</span></span>
              </div>
              <div className="flex justify-between items-end pb-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">Esposizione</span>
                <span className="text-white font-mono text-lg">{report?.data.morphology.exposure}</span>
              </div>
            </div>
          </div>

          {/* Solar */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-yellow-500 text-sm font-bold uppercase mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4" /> Solare PVGIS
            </h4>
            <div className="h-24 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SOLAR_DATA}>
                  <Area type="monotone" dataKey="val" stroke="#eab308" fill="#eab308" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Irraggiamento</span>
              <span className="text-white font-bold">{report?.data.solar.irradiance} <span className="text-xs font-normal">kWh/m²</span></span>
            </div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div className="bg-yellow-500 h-1.5 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>

          {/* Wind */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-blue-400 text-sm font-bold uppercase mb-4 flex items-center gap-2">
              <Wind className="w-4 h-4" /> Eolico
            </h4>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{report?.data.wind.speedAvg}</div>
                <div className="text-[10px] text-gray-500">m/s Avg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{report?.data.wind.gustPeak}</div>
                <div className="text-[10px] text-gray-500">m/s Gust</div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400 bg-white/5 rounded-lg py-2">
              Dominante: <span className="text-white font-bold">{report?.data.wind.directionDominant}</span>
            </div>
          </div>

          {/* Geology */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
             <h4 className="text-amber-600 text-sm font-bold uppercase mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Geologia
            </h4>
            <div className="space-y-3">
               <div className="bg-white/5 p-3 rounded-lg">
                 <div className="text-xs text-gray-500 mb-1">Tipo Suolo</div>
                 <div className="text-white font-medium">{report?.data.geology.soilType}</div>
               </div>
               <div className="bg-white/5 p-3 rounded-lg">
                 <div className="text-xs text-gray-500 mb-1">Permeabilità</div>
                 <div className="text-white font-medium">{report?.data.geology.permeability}</div>
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 CLC: {report?.data.geology.clcClass}
               </div>
            </div>
          </div>
        </div>

        {/* Risk & Climate Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h4 className="text-red-500 text-sm font-bold uppercase mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Fattori di Rischio
            </h4>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                 <span className="text-gray-300 text-sm">Sismico (INGV)</span>
                 <span className="font-bold text-red-400">Zona {report?.data.risks.seismicZone}</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                 <span className="text-gray-300 text-sm">Idrogeologico (PAI)</span>
                 <span className="font-bold text-orange-400">Classe {report?.data.risks.floodHazard}</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                 <span className="text-gray-300 text-sm">Frana</span>
                 <span className="font-bold text-yellow-400">{report?.data.risks.landslideRisk}</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
             <h4 className="text-white text-sm font-bold uppercase mb-6 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" /> Analisi Climatica Reale (Open-Meteo)
            </h4>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherChartData.length > 0 ? weatherChartData : TEMP_DATA}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" tick={{fontSize: 12}} />
                    <YAxis stroke="#4b5563" tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTemp)" name="Temp Max (°C)" />
                    <Area type="monotone" dataKey="rain" stroke="#22c55e" fillOpacity={1} fill="url(#colorRain)" name="Pioggia (mm)" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* PREMIUM SECTION (Business Plan & Exports) */}
        <div className="relative overflow-hidden rounded-3xl border border-primary-500/30 bg-gradient-to-b from-primary-900/10 to-black mt-16">
           {!isPremiumUnlocked && (
              <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center text-center p-6">
                 <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mb-6 border border-primary-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <Lock className="w-10 h-10 text-primary-500" />
                 </div>
                 <h3 className="text-3xl font-display font-bold text-white mb-4">Business Plan & Strategia</h3>
                 <p className="text-gray-300 max-w-md mb-8">
                    Sblocca l'analisi finanziaria completa per Energy, Turismo o Edilizia.
                    Scarica i file DXF per il tuo architetto.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleUnlock}
                      className="bg-primary-500 hover:bg-primary-600 text-black font-bold px-8 py-4 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:scale-105"
                      disabled={unlocking}
                    >
                      {unlocking ? <Loader2 className="w-5 h-5 animate-spin"/> : <Unlock className="w-5 h-5" />}
                      {unlocking ? "Sblocco in corso..." : "Sblocca Report Pro - €49"}
                    </button>
                    <button 
                      onClick={handleUnlock}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-medium transition-colors"
                    >
                       Vedi Esempio
                    </button>
                 </div>
              </div>
           )}

           <div className={`p-8 lg:p-12 ${!isPremiumUnlocked ? 'opacity-30 pointer-events-none' : ''}`}>
               
               {/* HEADER PREMIUM */}
               <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 border-b border-white/10 pb-6">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <Coins className="w-8 h-8 text-primary-500" />
                          <h2 className="text-3xl font-bold text-white font-display">Business Plan & ROI</h2>
                      </div>
                      <p className="text-gray-400 text-sm">Scegli lo scenario di sviluppo per il tuo terreno:</p>
                  </div>
                  
                  {/* SCENARIO SELECTOR */}
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                      <button 
                         onClick={() => setScenario('solar')}
                         className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${scenario === 'solar' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                      >
                         <Sun className="w-4 h-4" /> Agri-Voltaico
                      </button>
                      <button 
                         onClick={() => setScenario('glamping')}
                         className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${scenario === 'glamping' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                      >
                         <Tent className="w-4 h-4" /> Glamping
                      </button>
                      <button 
                         onClick={() => setScenario('construction')}
                         className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${scenario === 'construction' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                      >
                         <Home className="w-4 h-4" /> Residenziale
                      </button>
                  </div>
               </div>
               
               {/* NEW SECTION: CHECK VINCOLISTICO */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between">
                      <div>
                         <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vincolo Paesaggistico</div>
                         <div className="text-white font-bold text-lg">Assente (PPTR)</div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between">
                      <div>
                         <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vincolo Idrogeologico</div>
                         <div className="text-white font-bold text-lg">Classe P1 (Basso)</div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between">
                      <div>
                         <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Indice Edificabilità</div>
                         <div className="text-white font-bold text-lg">
                            {scenario === 'construction' ? '0.15 mq/mq' : '0.03 mc/mq'}
                         </div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  {/* Financial KPIs */}
                  <div className="space-y-4">
                     <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">ROI Stimato</div>
                        <div className="text-3xl font-bold text-primary-500">{financialData?.roi}%</div>
                        <div className="text-xs text-gray-500 mt-2">Ritorno investimento</div>
                     </div>
                     <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">{financialData?.metricLabel}</div>
                        <div className="text-3xl font-bold text-white">{financialData?.mainMetric}</div>
                        <div className="text-xs text-gray-500 mt-2">Capacità massima</div>
                     </div>
                     <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">
                           {scenario === 'construction' ? 'Valore Vendita (Exit)' : 'Revenue Annuale'}
                        </div>
                        <div className="text-3xl font-bold text-white">€ {financialData?.annualRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-2">
                           {scenario === 'construction' ? 'Stima immobile finito' : 'Fatturato stimato / anno'}
                        </div>
                     </div>
                  </div>

                  {/* Cash Flow Chart */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
                     <h4 className="text-white font-bold mb-6 flex items-center justify-between">
                        <span>Analisi Cash Flow {scenario === 'construction' ? '(5 Anni Sviluppo)' : '(20 Anni Esercizio)'}</span>
                        <span className="text-xs font-normal text-gray-500">CAPEX Iniziale: € -{financialData?.capex.toLocaleString()}</span>
                     </h4>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={financialData?.cashFlow}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                              <XAxis dataKey="year" stroke="#4b5563" tick={{fontSize: 10}} />
                              <YAxis stroke="#4b5563" tick={{fontSize: 10}} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                                cursor={{fill: 'transparent'}}
                              />
                              <Bar dataKey="net" name="Netto Cumulativo" radius={[4, 4, 0, 0]}>
                                {financialData?.cashFlow.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.net > 0 ? '#22c55e' : '#ef4444'} />
                                ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>
               
               {/* Downloads */}
               <div className="border-t border-white/10 pt-8">
                  <h3 className="text-white font-bold mb-6">Export Tecnico & Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <button className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl group transition-all hover:border-primary-500/30">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400">
                              <FileSpreadsheet className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <div className="text-white font-medium">Export CSV Dati</div>
                              <div className="text-xs text-gray-500">Excel / Numbers</div>
                           </div>
                        </div>
                        <Download className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                     </button>

                     <button className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl group transition-all hover:border-primary-500/30">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400">
                              <Layers className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <div className="text-white font-medium">File DXF (CAD)</div>
                              <div className="text-xs text-gray-500">Planimetria vettoriale</div>
                           </div>
                        </div>
                        <Download className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                     </button>

                     <button className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl group transition-all hover:border-primary-500/30">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400">
                              <ShieldCheck className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <div className="text-white font-medium">Certificato PAI</div>
                              <div className="text-xs text-gray-500">Analisi idrogeologica</div>
                           </div>
                        </div>
                        <Download className="w-5 h-5 text-gray-500 group-hover:text-primary-500" />
                     </button>
                  </div>
               </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="min-h-screen pt-24 px-4 pb-20 bg-[#050505]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                JD
              </div>
              <div>
                <h3 className="text-white font-bold">John Doe</h3>
                <p className="text-xs text-gray-400">Investitore Pro</p>
              </div>
            </div>
            <nav className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-white/10 text-white font-medium border-l-2 border-primary-500">Dashboard</button>
              <button className="w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">I miei Terreni</button>
              <button className="w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Report Salvati</button>
              <button className="w-full text-left px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Impostazioni</button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Terreni in Vendita</div>
              <div className="text-3xl font-bold text-white">3</div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Report Generati</div>
              <div className="text-3xl font-bold text-white">12</div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Lead Ricevuti</div>
              <div className="text-3xl font-bold text-white">28</div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="font-bold text-white">Attività Recente</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 uppercase text-xs font-medium text-gray-300">
                  <tr>
                    <th className="px-6 py-4">Attività</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Stato</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[1, 2, 3].map((row) => (
                    <tr key={row} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Analisi Terreno #234{row}</td>
                      <td className="px-6 py-4">12 Maggio 2025</td>
                      <td className="px-6 py-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs border border-green-500/20">Completato</span></td>
                      <td className="px-6 py-4"><button className="text-primary-400 hover:underline">Vedi PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [page, setPage] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setPage(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newPage: string) => {
    window.location.hash = newPage;
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-slate-50 font-sans selection:bg-primary-500/30">
      <Navbar currentPage={page} setCurrentPage={navigate} />
      
      <main>
        {page === 'home' && (
          <>
            <HeroSection onAnalyzeClick={() => navigate('analysis')} onMarketplaceClick={() => navigate('marketplace')} />
            <FeaturedSection />
          </>
        )}
        {page === 'analysis' && <AnalysisPage />}
        {page === 'marketplace' && <MarketplacePage />}
        {page === 'dashboard' && <DashboardPage />}
        {page === 'blog' && <BlogPage />}
      </main>

      <Footer />
    </div>
  );
};

export default App;
