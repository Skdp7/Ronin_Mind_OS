
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
  Home, Tent, Timer, Wallet, Zap as ZapIcon, Sparkles, Smartphone, Hourglass, User
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
    const buildabilityIndex = 0.15; // 0.15 mq/mq
    const buildableSqm = Math.floor(sizeSqm * buildabilityIndex);
    
    const constructionCostPerSqm = 1800; 
    capex = buildableSqm * constructionCostPerSqm;
    
    const marketValuePerSqm = 2900; 
    const totalMarketValue = buildableSqm * marketValuePerSqm;
    annualRevenue = totalMarketValue; 
    
    let cumulative = 0;
    for(let i = 1; i <= 5; i++) {
      let net = 0;
      if (i === 1) { net = -capex * 0.4; } 
      else if (i === 2) { net = -capex * 0.6; } 
      else if (i === 3) { net = totalMarketValue; } 
      else { net = 0; }
      
      cumulative += net;
      cashFlow.push({ year: `Y${i}`, net: Math.round(cumulative), cash: Math.round(net) });
    }
    const profit = totalMarketValue - capex;
    const roi = ((profit / capex) * 100).toFixed(1);
    
    return { 
      mainMetric: buildableSqm, 
      metricLabel: label1, 
      capex: Math.round(capex), 
      annualRevenue: Math.round(totalMarketValue), 
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

// --- GENERAZIONE FILE REALI (EXPORT) ---

const generateAndDownloadCSV = (report: AnalysisReport, financialData: any) => {
  const rows = [
    ["TERRENINVENDITA.AI - REPORT TECNICO"],
    ["Data Generazione", new Date().toLocaleDateString()],
    ["Indirizzo", report.address],
    ["Coordinate", `${report.coordinates.lat}, ${report.coordinates.lng}`],
    [],
    ["DATI AMBIENTALI"],
    ["Altitudine", `${report.data.morphology.elevation} m`],
    ["Pendenza", `${report.data.morphology.slope}%`],
    ["Rischio Sismico", `Zona ${report.data.risks.seismicZone}`],
    ["Rischio Idrogeologico", `Classe ${report.data.risks.floodHazard}`],
    [],
    ["BUSINESS PLAN"],
    ["Scenario", "Analisi Finanziaria"],
    ["CAPEX (Investimento)", `€ ${financialData.capex}`],
    ["Ricavi Annuali Stimati", `€ ${financialData.annualRevenue}`],
    ["ROI", `${financialData.roi}%`],
    ["Payback Period", financialData.paybackYear]
  ];

  let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(";")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Analisi_Terreno_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateAndDownloadDXF = (sizeSqm: number = 5000) => {
  // Calcola il lato di un quadrato equivalente
  const side = Math.sqrt(sizeSqm);
  const half = side / 2;
  
  // Semplice DXF Header e entità POLYLINE (quadrato)
  const dxfContent = `0
SECTION
2
HEADER
0
ENDSEC
0
SECTION
2
ENTITIES
0
POLYLINE
8
PERIMETRO_TERRENO
66
1
10
0.0
20
0.0
30
0.0
70
1
0
VERTEX
8
PERIMETRO_TERRENO
10
-${half}
20
-${half}
30
0.0
0
VERTEX
8
PERIMETRO_TERRENO
10
${half}
20
-${half}
30
0.0
0
VERTEX
8
PERIMETRO_TERRENO
10
${half}
20
${half}
30
0.0
0
VERTEX
8
PERIMETRO_TERRENO
10
-${half}
20
${half}
30
0.0
0
SEQEND
0
ENDSEC
0
EOF`;

  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Planimetria_Terreno_Cad.dxf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateAndDownloadReport = (report: AnalysisReport) => {
  const content = `
TERRENINVENDITA.AI - REPORT TECNICO DI PRE-FATTIBILITÀ
======================================================
ID Report: ${report.id}
Data: ${new Date().toLocaleDateString()}

LOCALIZZAZIONE
--------------
Indirizzo: ${report.address}
Coordinate GPS: ${report.coordinates.lat}, ${report.coordinates.lng}

ANALISI VINCOLISTICA E RISCHI (SIMULAZIONE)
-------------------------------------------
1. Rischio Sismico (INGV): Zona ${report.data.risks.seismicZone}
   Note: La zona sismica richiede adeguamento strutturale secondo NTC 2018.

2. Rischio Idrogeologico (PAI): Classe ${report.data.risks.floodHazard}
   Note: Classe P1 indica pericolosità moderata. Verificare norme di attuazione regionali.

3. Vincolo Paesaggistico (PPTR):
   Stato: Assente (Verifica preliminare automatica).

SINTESI AI GENERATIVA
---------------------
${report.aiSummary}

DISCLAIMER LEGALE
-----------------
Il presente documento è un report tecnico preliminare generato da algoritmi di intelligenza artificiale basati su open data.
NON costituisce certificazione legale, urbanistica o geologica. 
Per atti di compravendita o permessi di costruire è obbligatorio il parere di un tecnico abilitato (Geometra, Ingegnere, Geologo).

Generato da terreninvendita.ai
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Report_Tecnico_Preliminare.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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

const ValuePropositionSection = () => {
  return (
    <div className="py-32 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.05),transparent_40%)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            Il Vecchio Metodo <span className="text-gray-500 text-2xl align-middle mx-2">VS</span> <span className="text-primary-500">L'Innovazione AI</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Abbiamo digitalizzato il processo di due diligence immobiliare. Risparmia il 98% dei costi e il 99% del tempo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT: OLD METHOD (Analog/Dim) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-900 to-red-800 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-dark-900/80 border border-red-900/30 p-8 rounded-2xl backdrop-blur-sm">
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <Hourglass className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">30 Giorni</h3>
                    <p className="text-red-400 text-sm font-mono">LENTO & COSTOSO</p>
                  </div>
                </div>
                <span className="bg-red-900/30 text-red-400 px-3 py-1 rounded text-xs font-bold border border-red-900/50">METODO TRADIZIONALE</span>
              </div>

              {/* Speed Bar - Slow */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                  <span>TEMPO DI ESECUZIONE</span>
                  <span>30%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[30%] bg-red-500/50 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Cost List */}
              <div className="space-y-4 font-mono text-sm">
                {[
                  { label: "Geometra (Visure)", price: "€ 350" },
                  { label: "Relazione Geologica", price: "€ 800" },
                  { label: "Studio Fattibilità Arch.", price: "€ 1.500" },
                  { label: "Business Plan", price: "€ 600" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5 text-gray-400">
                    <span>{item.label}</span>
                    <span className="text-white">{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Costo Totale Stimato</span>
                  <span className="text-4xl font-bold text-red-500 font-display">€ 3.250</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: NEW METHOD (Digital/Green/Glowing) */}
          <div className="relative group transform hover:-translate-y-2 transition-transform duration-500">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl blur opacity-40 group-hover:opacity-60 animate-pulse transition duration-1000"></div>
            
            <div className="relative bg-black border border-primary-500/50 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/20 rounded-lg border border-primary-500/30">
                    <ZapIcon className="w-8 h-8 text-primary-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white font-display">12 Secondi</h3>
                    <p className="text-primary-400 text-sm font-mono tracking-wide">AI REAL-TIME ANALYSIS</p>
                  </div>
                </div>
                <span className="bg-primary-500 text-black px-3 py-1 rounded text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)]">TERRENINVENDITA.AI</span>
              </div>

               {/* Speed Bar - Fast */}
               <div className="mb-8">
                <div className="flex justify-between text-xs text-primary-400 mb-2 font-mono">
                  <span>VELOCITÀ DI ESECUZIONE</span>
                  <span className="animate-pulse">100%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary-500 shadow-[0_0_10px_#22c55e] animate-[scan_1s_ease-in-out_infinite] w-full"></div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 font-mono text-sm">
                {[
                  "Dati Catastali & Urbanistici",
                  "Analisi Geologica AI",
                  "Export CAD Tecnico",
                  "Business Plan Bancabile"
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-primary-500/5 rounded border border-primary-500/20 text-white group/item hover:bg-primary-500/10 transition-colors cursor-default">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary-500" />
                      <span>{item}</span>
                    </div>
                    <span className="text-primary-400 text-xs font-bold uppercase">Incluso</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-primary-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
                <div className="flex justify-between items-end">
                  <span className="text-primary-400 text-xs uppercase tracking-wider">Costo Report Premium</span>
                  <span className="text-5xl font-bold text-primary-500 font-display drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">€ 49</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Floating Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
                { icon: Wallet, title: "Risparmio del 98%", desc: "Elimina i costi fissi di consulenza preliminare. Paga solo per i terreni che meritano davvero." },
                { icon: Eye, title: "Valore Nascosto", desc: "L'AI identifica potenziali di business (Agrivoltaico, Glamping) invisibili ad occhio nudo." },
                { icon: FileText, title: "Export Ready", desc: "Scarica file pronti per l'uso (DXF, CSV) da inviare direttamente al tuo architetto o banca." }
            ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-colors text-center group">
                    <div className="inline-flex p-4 rounded-2xl bg-white/5 text-primary-500 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary-500/10 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        <item.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

const FeaturedSection = () => {
  const [listings, setListings] = useState(MOCK_FEATURED_LISTINGS_FALLBACK);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Load from DB on mount
  useEffect(() => {
    const loadData = async () => {
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase!.from('listings').select('*').eq('is_premium', true).limit(4);
                if (!error && data && data.length > 0) {
                    // Map DB to UI format
                    const mapped = data.map((item: any) => ({
                        id: item.id,
                        location: item.location,
                        price: item.price,
                        area: item.size_sqm,
                        type: item.type,
                        status: 'In vendita',
                        img: item.image_url,
                        priceLabel: `€ ${item.price.toLocaleString()}`
                    }));
                    setListings(mapped);
                }
            } catch (e) {
                console.error("Error loading featured", e);
            }
        } else {
            // Local storage fallback
             const saved = localStorage.getItem('featured_listings');
             if (saved) setListings(JSON.parse(saved));
        }
    };
    loadData();
  }, []);

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = listings.map(l => l.id === id ? { ...l, [field]: value } : l);
    setListings(updated);
    localStorage.setItem('featured_listings', JSON.stringify(updated));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate(id, 'img', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetDb = () => {
    localStorage.removeItem('featured_listings');
    localStorage.removeItem('listings');
    window.location.reload();
  };

  return (
    <div className="py-16 bg-dark-900 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Vuoi mostrare qui la tua proprietà?
            </h2>
            <p className="text-gray-400">
              I terreni migliori d'Italia scelti dall'AI. Dai visibilità al tuo lotto o esplora le opportunità.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Admin Toggle */}
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-4 py-2 rounded-lg border text-xs font-mono transition-all ${isAdminMode ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
            >
              {isAdminMode ? 'Admin Mode ON' : 'Admin Mode'}
            </button>

            {/* Main CTA */}
            <button className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-primary-500/20">
              Pubblica il tuo annuncio <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {listings.map((item) => (
            <div key={item.id} className="group relative bg-dark-800 rounded-xl overflow-hidden border border-white/5 hover:border-primary-500/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
              
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.location} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {item.status}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 left-4">
                   {isAdminMode ? (
                      <input 
                        type="text" 
                        value={item.priceLabel}
                        onChange={(e) => handleUpdate(item.id, 'priceLabel', e.target.value)}
                        className="bg-primary-500 text-white font-bold px-3 py-1 rounded shadow-lg w-32 text-sm"
                      />
                   ) : (
                      <span className="bg-primary-500 text-white font-bold px-3 py-1 rounded shadow-lg text-sm">
                        {item.priceLabel}
                      </span>
                   )}
                </div>

                {/* Admin Upload Overlay */}
                {isAdminMode && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(item.id, e)} accept="image/*" />
                    <Upload className="text-white w-8 h-8" />
                  </label>
                )}
              </div>

              {/* Info */}
              <div className="p-4 relative">
                 {isAdminMode ? (
                    <input 
                      type="text" 
                      value={item.location}
                      onChange={(e) => handleUpdate(item.id, 'location', e.target.value)}
                      className="bg-transparent border-b border-white/20 text-white font-bold w-full mb-1"
                    />
                 ) : (
                    <h3 className="text-white font-bold text-lg mb-1">{item.location}</h3>
                 )}
                
                <div className="flex justify-between items-center text-xs text-gray-400 mt-3 pt-3 border-t border-white/5">
                  <div>
                    <span className="block text-gray-600 uppercase tracking-wider text-[10px]">Area</span>
                    <span className="text-gray-300">{item.area} m²</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-600 uppercase tracking-wider text-[10px]">Tipo</span>
                    <span className="text-gray-300 capitalize">{item.type}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Dual Choice - Publish Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Option 1: Public */}
            <div className="relative group p-8 rounded-2xl bg-gradient-to-br from-dark-800 to-black border border-white/5 hover:border-primary-500/30 transition-all cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Globe className="w-32 h-32 text-primary-500" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mb-6 text-primary-500 group-hover:scale-110 transition-transform">
                        <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Listing Pubblico</h3>
                    <p className="text-gray-400 mb-6">
                        Massima visibilità. Il tuo terreno viene indicizzato su Google, condiviso sui social e mostrato a migliaia di investitori.
                    </p>
                    <span className="text-primary-500 font-bold flex items-center gap-2 text-sm group-hover:translate-x-2 transition-transform">
                        Inizia ora <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>

            {/* Option 2: Private / Off-Market */}
            <div className="relative group p-8 rounded-2xl bg-gradient-to-br from-dark-800 to-black border border-white/5 hover:border-accent-500/30 transition-all cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lock className="w-32 h-32 text-accent-500" />
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-accent-500/10 flex items-center justify-center mb-6 text-accent-500 group-hover:scale-110 transition-transform">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Off-Market Privato</h3>
                    <p className="text-gray-400 mb-6">
                        Discrezione totale. Il terreno è visibile solo a investitori qualificati con NDA firmato. Nessuna foto pubblica.
                    </p>
                    <span className="text-accent-500 font-bold flex items-center gap-2 text-sm group-hover:translate-x-2 transition-transform">
                        Richiedi accesso <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>

        </div>
        
        {isAdminMode && (
            <div className="mt-8 text-center">
                <button onClick={resetDb} className="text-red-500 text-xs hover:underline">Reset Database Locale</button>
            </div>
        )}

      </div>
    </div>
  );
};

// --- PAGES ---

const HomePage = ({ onStartAnalysis }: { onStartAnalysis: () => void }) => (
  <div className="min-h-screen pt-20">
    {/* Hero Section */}
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text */}
          <div className="text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-primary-400 text-sm font-medium animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>La prima AI per il Land Banking</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight">
              Decodifica il valore <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                del tuo terreno
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-xl leading-relaxed">
              Ottieni un'analisi scientifica istantanea su edificabilità, rischio idrogeologico e potenziale fotovoltaico.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStartAnalysis}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-lg transition-all shadow-[0_0_30px_-10px_rgba(34,197,94,0.6)] hover:shadow-[0_0_50px_-10px_rgba(34,197,94,0.8)] hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Analizza Gratis con AI
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-medium text-lg backdrop-blur-md transition-all flex items-center justify-center gap-2 group">
                Esplora Marketplace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column: Widget */}
          <div className="hidden lg:block">
            <SearchWidget onSearch={() => {}} />
          </div>
        </div>

        {/* Stats Bar - Bottom HUD */}
        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {[
                { label: "Dataset Analizzati", val: "45 TB+" },
                { label: "Terreni Mappati", val: "12.5 K" },
                { label: "Precisione AI", val: "98.9%" },
                { label: "Investitori Attivi", val: "3.2 K" }
              ].map((stat, i) => (
                <div key={i} className="py-6 text-center group cursor-default hover:bg-white/5 transition-colors relative overflow-hidden">
                  <div className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-primary-400 transition-colors">{stat.val}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Featured Listings & Publishing */}
    <FeaturedSection />

    {/* Value Proposition Comparison */}
    <ValuePropositionSection />

  </div>
);

const AnalysisPage = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<AnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState<'address' | 'cadastral' | 'gps'>('address');
  
  // State for Premium/Financial features
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [financialData, setFinancialData] = useState<any>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('solar');

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const searchAddress = address.trim() || "Roma, Piazza del Colosseo";

    setLoading(true);
    setProgress(0);
    setResult(null);
    setIsPremiumUnlocked(false); // Reset premium state on new scan

    const phases = [
      "Inizializzazione satelliti Copernicus...",
      "Scansione altimetrica DEM (Digital Elevation Model)...",
      "Analisi climatica ERA5 (1990-2024)...",
      "Verifica vincoli idrogeologici PAI...",
      "Calcolo irraggiamento solare PVGIS...",
      "Generazione report AI..."
    ];

    // Simulation loop
    for (let i = 0; i < phases.length; i++) {
      setScanStep(phases[i]);
      await new Promise(r => setTimeout(r, 800));
      setProgress((prev) => prev + (100 / phases.length));
    }

    try {
      // 1. Get Coordinates
      const coords = await getCoordinates(searchAddress);
      const lat = coords?.lat || 41.9028;
      const lng = coords?.lng || 12.4964;
      const displayName = coords?.display_name || searchAddress;

      // 2. Get Real Data
      const elevation = await getRealElevation(lat, lng);
      // const weather = await getRealWeatherHistory(lat, lng); // Not used in main view yet but fetched

      // 3. Construct Detailed Data
      const detailedData: DetailedAnalysisData = {
        morphology: {
          elevation: elevation,
          slope: Math.floor(Math.random() * 15), // Still simulated for now
          exposure: 'Sud-Est',
          terrainType: 'Seminativo',
        },
        solar: {
          irradiance: 1450 + Math.floor(Math.random() * 200), // kWh/m2
          sunHours: 2600,
          pvPotential: 'Alto',
          shadingLoss: 2
        },
        wind: {
          speedAvg: 4.5,
          directionDominant: 'NW',
          gustPeak: 12
        },
        geology: {
          soilType: 'Argilloso-Limoso',
          permeability: 'Media',
          loadBearing: '2.5',
          clcClass: '211 - Seminativi'
        },
        risks: {
          seismicZone: '2',
          floodHazard: 'P1',
          landslideRisk: 'Assente'
        },
        context: {
          urbanDensity: 'Bassa',
          nearestRoad: 450,
          noiseLevel: 35,
          accessQuality: 8
        }
      };

      // 4. Call AI for Summary
      const aiResponse = await generateLandAnalysisSummary(displayName, detailedData);

      // 5. Create Final Report Object
      const mockReport: AnalysisReport = {
        id: `REP-${Math.floor(Math.random() * 10000)}`,
        address: displayName,
        coordinates: { lat, lng },
        scores: {
          agriculture: 85,
          construction: 60,
          solar: 92,
          environmental: 78,
          total: 82
        },
        data: detailedData,
        aiSummary: aiResponse.summary,
        recommendations: aiResponse.recommendations,
        generatedAt: new Date()
      };

      setResult(mockReport);
      
      // 6. Calculate Financials (Locked initially)
      const financials = calculateFinancials(detailedData.solar.irradiance, 5000, 'solar'); // Default to solar
      setFinancialData(financials);

    } catch (error) {
        console.error("Scan failed", error);
        // Fallback to avoid UI freeze
        setResult({
            id: 'ERR-001',
            address: searchAddress,
            coordinates: { lat: 41.9, lng: 12.5 },
            scores: { agriculture: 50, construction: 50, solar: 50, environmental: 50, total: 50 },
            data: {
                morphology: { elevation: 100, slope: 5, exposure: 'S', terrainType: 'Misto' },
                solar: { irradiance: 1300, sunHours: 2000, pvPotential: 'Medio', shadingLoss: 5 },
                wind: { speedAvg: 3, directionDominant: 'N', gustPeak: 10 },
                geology: { soilType: 'Misto', permeability: 'Media', loadBearing: '2', clcClass: 'N/A' },
                risks: { seismicZone: '2', floodHazard: 'P2', landslideRisk: 'Assente' },
                context: { urbanDensity: 'Media', nearestRoad: 100, noiseLevel: 40, accessQuality: 6 }
            },
            aiSummary: "Errore nella connessione ai servizi. Dati simulati.",
            recommendations: ["Riprovare la scansione"],
            generatedAt: new Date()
        });
    } finally {
      setLoading(false);
    }
  };

  // Handle Scenario Change
  const handleScenarioChange = (scenario: ScenarioType) => {
    setSelectedScenario(scenario);
    if (result) {
        // Recalculate based on new scenario
        const financials = calculateFinancials(result.data.solar.irradiance, 5000, scenario);
        setFinancialData(financials);
    }
  };

  // Unlock Premium
  const handleUnlock = () => {
     setLoading(true);
     setTimeout(() => {
         setLoading(false);
         setIsPremiumUnlocked(true);
     }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {!result && !loading && (
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Analisi Terreno <span className="text-primary-500">AI-Powered</span>
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Inserisci i dati del tuo terreno. I nostri algoritmi incroceranno dati satellitari, geologici e climatici per generare un report professionale.
          </p>

          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            {/* Input Tabs */}
            <div className="flex gap-4 mb-6 border-b border-white/5 pb-2">
              <button 
                onClick={() => setActiveTab('address')}
                className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'address' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400 hover:text-white'}`}
              >
                Indirizzo
              </button>
              <button 
                 onClick={() => setActiveTab('cadastral')}
                 className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'cadastral' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400 hover:text-white'}`}
              >
                Dati Catastali
              </button>
              <button 
                 onClick={() => setActiveTab('gps')}
                 className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'gps' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400 hover:text-white'}`}
              >
                Coordinate GPS
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 relative">
               {/* Glow Effect blocker fixed with pointer-events-none */}
              <div className="absolute -inset-1 bg-primary-500/20 blur-xl rounded-lg opacity-50 pointer-events-none"></div>
              
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={activeTab === 'address' ? "Es. Via Appia Antica 120, Roma" : activeTab === 'cadastral' ? "Comune, Foglio, Particella" : "Latitudine, Longitudine"}
                className="flex-1 bg-dark-950 border border-white/10 rounded-lg px-4 py-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none relative z-10"
              />
              <button
                onClick={(e) => handleScan(e)}
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-500/25 active:scale-95 relative z-10 cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                Avvia Scansione Live
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-left flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Dati protetti e anonimizzati. Analisi basata su Copernicus DEM e OpenMeteo APIs.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <Hexagon className="absolute inset-0 m-auto text-primary-500 w-12 h-12 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{scanStep}</h3>
          <p className="text-primary-400 font-mono">{Math.round(progress)}% Completato</p>
          <div className="w-full bg-white/5 h-2 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-primary-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="animate-fade-in">
          {/* Header Result */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary-400 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-mono">ANALISI COMPLETATA</span>
              </div>
              <h2 className="text-3xl font-bold text-white">{result.address}</h2>
              <p className="text-gray-500 text-sm">GPS: {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => generateAndDownloadReport(result)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Printer className="w-4 h-4" /> Report PDF
                </button>
              <button 
                onClick={() => { setResult(null); setAddress(''); }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Nuova Analisi
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Col 1: AI Summary & Score */}
            <div className="lg:col-span-1 space-y-6">
              {/* Total Score Card */}
              <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Hexagon className="w-24 h-24 text-primary-500" />
                </div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Punteggio AI</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-6xl font-display font-bold text-white">{result.scores.total}</span>
                  <span className="text-xl text-gray-500 mb-2">/100</span>
                </div>
                <p className="text-sm text-gray-400">Eccellente potenziale di sviluppo</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Agricolo</span>
                    <span className="text-white font-bold">{result.scores.agriculture}/100</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${result.scores.agriculture}%` }}></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fotovoltaico</span>
                    <span className="text-white font-bold">{result.scores.solar}/100</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${result.scores.solar}%` }}></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Edificabile</span>
                    <span className="text-white font-bold">{result.scores.construction}/100</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${result.scores.construction}%` }}></div>
                  </div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="bg-gradient-to-br from-primary-900/20 to-dark-900 border border-primary-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-primary-400">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">AI Insight</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {result.aiSummary}
                </p>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-400 bg-black/20 p-2 rounded">
                      <CheckCircle className="w-3 h-3 text-primary-500 mt-0.5" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2 & 3: Technical Data */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Morphology */}
              <div className="bg-dark-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <Mountain className="w-4 h-4" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">Morfologia</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Altitudine</div>
                      <div className="text-xl font-bold text-white">{result.data.morphology.elevation}m</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Pendenza</div>
                      <div className="text-xl font-bold text-white">{result.data.morphology.slope}%</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Esposizione</div>
                      <div className="text-xl font-bold text-white">{result.data.morphology.exposure}</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl">
                      <div className="text-xs text-gray-500 mb-1">Suolo</div>
                      <div className="text-xl font-bold text-white truncate">{result.data.geology.soilType}</div>
                   </div>
                </div>
              </div>

              {/* Solar Analysis */}
              <div className="bg-dark-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <Sun className="w-4 h-4" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">Analisi Solare</h3>
                </div>
                <div className="h-32 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SOLAR_DATA}>
                      <defs>
                        <linearGradient id="colorSun" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="#eab308" fillOpacity={1} fill="url(#colorSun)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Irraggiamento</div>
                    <div className="text-white font-bold">{result.data.solar.irradiance} kWh/m²</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-xs">Potenziale PV</div>
                    <div className="text-yellow-500 font-bold">{result.data.solar.pvPotential}</div>
                  </div>
                </div>
              </div>

              {/* Risk Map */}
              <div className="bg-dark-900 border border-white/10 rounded-2xl p-6">
                 <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">Mappa Rischi</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-sm text-gray-300">Sismico (INGV)</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${result.data.risks.seismicZone === '1' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      Zona {result.data.risks.seismicZone}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-sm text-gray-300">Idrogeologico</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${result.data.risks.floodHazard !== 'Assente' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {result.data.risks.floodHazard}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-sm text-gray-300">Frane (PAI)</span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-400">
                      {result.data.risks.landslideRisk}
                    </span>
                  </div>
                </div>
              </div>

               {/* Climate */}
               <div className="bg-dark-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <Droplets className="w-4 h-4" />
                  <h3 className="font-bold uppercase text-sm tracking-wider">Microclima</h3>
                </div>
                <div className="h-32 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TEMP_DATA}>
                      <Bar dataKey="rain" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                 <div className="flex justify-between items-center text-sm mt-4">
                  <div>
                    <div className="text-gray-500 text-xs">Vento Medio</div>
                    <div className="text-white font-bold">{result.data.wind.speedAvg} m/s</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-xs">Direzione</div>
                    <div className="text-blue-400 font-bold">{result.data.wind.directionDominant}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================
              SEZIONE PREMIUM (Business Plan & Export) - GREEN THEME
          ============================================================ */}
          <div className="border-t border-white/10 pt-12 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-white font-display flex items-center gap-2">
                        <Zap className="text-primary-500" /> Strategia & Finanza
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">Sblocca il potenziale economico nascosto del tuo terreno.</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0 bg-dark-900 p-1 rounded-lg border border-white/10">
                    {/* Scenario Selector */}
                    <button 
                        onClick={() => handleScenarioChange('solar')}
                        className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors ${selectedScenario === 'solar' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Sun className="w-3 h-3" /> Agri-Voltaico
                    </button>
                    <button 
                         onClick={() => handleScenarioChange('glamping')}
                         className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors ${selectedScenario === 'glamping' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Tent className="w-3 h-3" /> Glamping
                    </button>
                    <button 
                         onClick={() => handleScenarioChange('construction')}
                         className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors ${selectedScenario === 'construction' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Building className="w-3 h-3" /> Residenziale
                    </button>
                </div>
            </div>

            {/* NEW: Check Vincolistico (Visual) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Vincolo Idrogeologico (PAI)", status: "Verificato", color: "text-green-500", bg: "bg-green-500/10", icon: Droplets },
                    { label: "Vincolo Paesaggistico (PPTR)", status: "Attenzione", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Eye },
                    { label: "Destinazione Urbanistica", status: "Compatibile", color: "text-green-500", bg: "bg-green-500/10", icon: Building }
                ].map((check, idx) => (
                    <div key={idx} className="bg-dark-900 border border-white/5 p-4 rounded-xl flex items-center justify-between relative overflow-hidden">
                         {/* Blurring if locked */}
                        {!isPremiumUnlocked && <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-[2px] z-10"></div>}
                        
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${check.bg}`}>
                                <check.icon className={`w-5 h-5 ${check.color}`} />
                            </div>
                            <span className="text-sm text-gray-300 font-medium">{check.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${check.color}`}>{check.status}</span>
                    </div>
                ))}
            </div>

            <div className="relative bg-dark-900 border border-primary-500/20 rounded-2xl p-8 overflow-hidden">
                
                {/* PAYWALL OVERLAY */}
                {!isPremiumUnlocked && (
                    <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-6">
                        <Lock className="w-12 h-12 text-primary-500 mb-4" />
                        <h4 className="text-2xl font-bold text-white mb-2">Report Premium Locked</h4>
                        <p className="text-gray-300 mb-6 max-w-md">
                            Accedi al Business Plan completo ({selectedScenario === 'solar' ? 'Agri-Voltaico' : selectedScenario === 'glamping' ? 'Turistico' : 'Immobiliare'}), 
                            scarica i file DXF per il tuo architetto e visualizza l'analisi dei vincoli.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <div className="flex-1 bg-dark-800 border border-primary-500 rounded-xl p-4 cursor-pointer hover:bg-dark-700 transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-primary-500 text-black text-[10px] font-bold px-2 py-0.5">BEST VALUE</div>
                                <div className="font-bold text-white">Pro Plan</div>
                                <div className="text-primary-500 font-display text-2xl font-bold mt-1">€ 49</div>
                                <button 
                                    onClick={handleUnlock} 
                                    className="mt-4 w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded font-bold text-sm transition-colors"
                                >
                                    Sblocca Report
                                </button>
                            </div>
                            <div className="flex-1 bg-dark-800 border border-white/10 rounded-xl p-4 opacity-75 cursor-not-allowed">
                                <div className="font-bold text-gray-400">Enterprise</div>
                                <div className="text-white font-display text-2xl font-bold mt-1">Custom</div>
                                <div className="mt-4 text-xs text-gray-500 py-2">Contattaci per API</div>
                            </div>
                        </div>
                        <button 
                            onClick={handleUnlock} 
                            className="mt-6 text-gray-400 text-sm hover:text-white underline"
                        >
                            Vedi Esempio (Demo Mode)
                        </button>
                    </div>
                )}

                {/* CONTENT (Blurred if locked) */}
                <div className={!isPremiumUnlocked ? 'blur-sm opacity-50 select-none' : ''}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left: Key Metrics */}
                        <div className="space-y-6">
                             <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                                <div className="text-sm text-primary-400 mb-1">ROI Stimato (20 Anni)</div>
                                <div className="text-4xl font-bold text-white font-display">{financialData?.roi}%</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">CAPEX (Investimento)</div>
                                    <div className="text-lg font-bold text-white">€ {financialData?.capex.toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">Payback Period</div>
                                    <div className="text-lg font-bold text-white">{financialData?.paybackYear}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">{financialData?.metricLabel}</div>
                                    <div className="text-lg font-bold text-white">{financialData?.mainMetric}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">{selectedScenario === 'construction' ? 'Valore Asset' : 'Ricavi Annuali'}</div>
                                    <div className="text-lg font-bold text-white text-green-400">€ {financialData?.annualRevenue.toLocaleString()}</div>
                                </div>
                            </div>
                            
                            <div className="pt-4">
                                <h5 className="text-white font-bold mb-4 text-sm">Download Tecnici</h5>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => generateAndDownloadDXF(5000)}
                                        className="w-full flex items-center justify-between p-3 bg-dark-800 hover:bg-dark-700 border border-white/10 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-900/30 p-2 rounded text-blue-400"><FileSpreadsheet className="w-4 h-4" /></div>
                                            <div className="text-left">
                                                <div className="text-sm text-white font-medium">Planimetria DXF (CAD)</div>
                                                <div className="text-xs text-gray-500">Vettoriale scala 1:1</div>
                                            </div>
                                        </div>
                                        <Download className="w-4 h-4 text-gray-500 group-hover:text-white" />
                                    </button>
                                    <button 
                                        onClick={() => generateAndDownloadCSV(result, financialData)}
                                        className="w-full flex items-center justify-between p-3 bg-dark-800 hover:bg-dark-700 border border-white/10 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-900/30 p-2 rounded text-green-400"><FileText className="w-4 h-4" /></div>
                                            <div className="text-left">
                                                <div className="text-sm text-white font-medium">Business Plan (CSV)</div>
                                                <div className="text-xs text-gray-500">Excel Ready</div>
                                            </div>
                                        </div>
                                        <Download className="w-4 h-4 text-gray-500 group-hover:text-white" />
                                    </button>
                                     <button 
                                        onClick={() => generateAndDownloadReport(result)}
                                        className="w-full flex items-center justify-between p-3 bg-dark-800 hover:bg-dark-700 border border-white/10 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-yellow-900/30 p-2 rounded text-yellow-400"><ShieldCheck className="w-4 h-4" /></div>
                                            <div className="text-left">
                                                <div className="text-sm text-white font-medium">Report Tecnico PAI</div>
                                                <div className="text-xs text-gray-500">Verifica Rischi</div>
                                            </div>
                                        </div>
                                        <Download className="w-4 h-4 text-gray-500 group-hover:text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Charts */}
                        <div className="lg:col-span-2">
                            <div className="bg-dark-800 rounded-xl p-4 h-80 border border-white/5">
                                <h4 className="text-sm text-gray-400 mb-4">Cash Flow Proiettato (20 Anni)</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financialData?.cashFlow}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="year" stroke="#666" fontSize={10} />
                                        <YAxis stroke="#666" fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                                            labelStyle={{ color: '#888' }}
                                        />
                                        <Bar dataKey="net" fill="#22c55e" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const MarketplacePage = () => {
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  
  // Form State
  const [newListing, setNewListing] = useState({
    title: '',
    price: '',
    location: '',
    type: 'Agricolo',
    size: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
     const fetchListings = async () => {
         if (isSupabaseConfigured()) {
             const { data, error } = await supabase!.from('listings').select('*').order('created_at', { ascending: false });
             if (!error && data) {
                 const mapped: LandListing[] = data.map((l: any) => ({
                     id: l.id,
                     title: l.title,
                     price: l.price,
                     sizeSqm: l.size_sqm,
                     type: l.type as LandType,
                     location: l.location,
                     imageUrl: l.image_url,
                     description: l.description,
                     aiScore: l.ai_score || 85,
                     features: l.features || [],
                     isPremium: l.is_premium
                 }));
                 setListings(mapped);
             } else {
                 console.error(error);
                 setListings(MOCK_LISTINGS_FALLBACK);
             }
         } else {
             setListings(MOCK_LISTINGS_FALLBACK);
         }
         setLoading(false);
     };
     fetchListings();
  }, []);

  const handleSellSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      if (isSupabaseConfigured()) {
          const { data, error } = await supabase!.from('listings').insert([
              {
                  title: newListing.title,
                  price: parseFloat(newListing.price),
                  location: newListing.location,
                  type: newListing.type,
                  size_sqm: parseFloat(newListing.size),
                  description: newListing.description,
                  image_url: `https://image.pollinations.ai/prompt/land%20${newListing.location}%20${newListing.type}?width=800&height=600&nologo=true`, // Auto-generate image for now
                  ai_score: Math.floor(Math.random() * 20) + 80 // Mock AI score
              }
          ]).select();

          if (!error && data) {
              setListings(prev => [
                  {
                     id: data[0].id,
                     title: data[0].title,
                     price: data[0].price,
                     sizeSqm: data[0].size_sqm,
                     type: data[0].type,
                     location: data[0].location,
                     imageUrl: data[0].image_url,
                     description: data[0].description,
                     aiScore: data[0].ai_score,
                     features: [],
                     isPremium: false
                  },
                  ...prev
              ]);
              setShowSellModal(false);
          } else {
              alert("Errore nel salvataggio: " + error?.message);
          }
      } else {
          alert("Modalità Demo: Il database non è collegato. Il terreno non verrà salvato.");
          setShowSellModal(false);
      }
      setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">Marketplace Terreni</h1>
          <p className="text-gray-400 mt-1">
             {loading ? 'Caricamento...' : isSupabaseConfigured() ? `${listings.length} Terreni verificati AI` : 'Modalità Demo (Database Disconnesso)'}
          </p>
        </div>
        <button 
            onClick={() => setShowSellModal(true)}
            className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> Vendi il tuo terreno
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-xl p-4 mb-8 flex gap-4 overflow-x-auto">
         <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 text-sm whitespace-nowrap">
            <Filter className="w-4 h-4" /> Tutti i filtri
         </button>
         <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 text-sm whitespace-nowrap">Edificabili</button>
         <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 text-sm whitespace-nowrap">Agricoli</button>
         <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 text-sm whitespace-nowrap">Industriali</button>
         <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 text-sm whitespace-nowrap">Alta Rendita</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((land) => (
          <div key={land.id} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all group shadow-2xl">
            <div className="relative h-56">
              <img src={land.imageUrl} alt={land.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                {land.type}
              </div>
              {land.isPremium && (
                <div className="absolute top-3 right-3 bg-primary-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Premium
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white flex items-center gap-1">
                 <MapPin className="w-3 h-3 text-gray-400" /> {land.location}
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="text-xl font-bold text-white line-clamp-1">{land.title}</h3>
                 <div className="text-primary-400 font-bold whitespace-nowrap">€ {land.price.toLocaleString()}</div>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{land.description}</p>
              
              <div className="flex gap-4 text-sm text-gray-300 mb-4 border-t border-white/5 pt-3">
                <div>
                    <span className="block text-xs text-gray-500 uppercase">Superficie</span>
                    {land.sizeSqm.toLocaleString()} m²
                </div>
                <div>
                    <span className="block text-xs text-gray-500 uppercase">Score AI</span>
                    <span className="text-green-400 font-bold">{land.aiScore}/100</span>
                </div>
              </div>

              <button className="w-full bg-white/5 hover:bg-primary-600 hover:text-white text-gray-300 py-3 rounded-lg text-sm font-bold transition-all border border-white/10 hover:border-primary-500">
                Vedi Dettagli AI
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sell Modal */}
      {showSellModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
                  <button 
                    onClick={() => setShowSellModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                      <X className="w-6 h-6" />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-white mb-6 font-display">Metti in vendita</h2>
                  
                  <form onSubmit={handleSellSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1 uppercase">Titolo Annuncio</label>
                          <input 
                            required
                            type="text" 
                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-primary-500 outline-none"
                            placeholder="Es. Terreno edificabile vista mare"
                            value={newListing.title}
                            onChange={e => setNewListing({...newListing, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase">Prezzo (€)</label>
                            <input 
                                required
                                type="number" 
                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-primary-500 outline-none"
                                placeholder="100000"
                                value={newListing.price}
                                onChange={e => setNewListing({...newListing, price: e.target.value})}
                            />
                          </div>
                           <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase">Mq</label>
                            <input 
                                required
                                type="number" 
                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-primary-500 outline-none"
                                placeholder="5000"
                                value={newListing.size}
                                onChange={e => setNewListing({...newListing, size: e.target.value})}
                            />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase">Località</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-primary-500 outline-none"
                                placeholder="Comune (Prov)"
                                value={newListing.location}
                                onChange={e => setNewListing({...newListing, location: e.target.value})}
                            />
                         </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase">Tipo</label>
                            <select 
                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-primary-500 outline-none"
                                value={newListing.type}
                                onChange={e => setNewListing({...newListing, type: e.target.value})}
                            >
                                <option>Agricolo</option>
                                <option>Edificabile</option>
                                <option>Industriale</option>
                            </select>
                         </div>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1 uppercase">Descrizione</label>
                          <textarea 
                            required
                            rows={3}
                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-primary-500 outline-none resize-none"
                            placeholder="Descrivi il terreno..."
                            value={newListing.description}
                            onChange={e => setNewListing({...newListing, description: e.target.value})}
                          />
                      </div>
                      
                      <button 
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded transition-colors mt-2 disabled:opacity-50"
                      >
                          {isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica Ora'}
                      </button>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(WORDPRESS_API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        // Transform WordPress data to our schema
        const mappedPosts: BlogPost[] = data.map((post: any) => {
             // Try to get the featured media URL safely
             let imgUrl = 'https://picsum.photos/800/400?random=' + post.id;
             if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0].source_url) {
                 imgUrl = post._embedded['wp:featuredmedia'][0].source_url;
             }

             return {
                id: post.id.toString(),
                title: post.title.rendered,
                excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 100) + '...',
                category: 'News', // WordPress categories are complex to fetch, simplified for demo
                readTime: '3 min',
                imageUrl: imgUrl,
                date: new Date(post.date).toLocaleDateString()
             };
        });
        
        setPosts(mappedPosts);
      } catch (error) {
        console.warn("Could not fetch WordPress posts (likely CORS or invalid URL). Using Mock Data.");
        setPosts(MOCK_BLOG);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white font-display mb-4">Blog Tecnico & Normativo</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Rimani aggiornato sulle ultime normative catastali, incentivi agricoli e tecnologie di costruzione.
        </p>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1,2,3].map(i => (
                 <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse"></div>
             ))}
         </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all group cursor-pointer">
                <div className="h-48 overflow-hidden">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex gap-3 text-xs font-medium mb-3">
                    <span className="text-primary-400">{post.category}</span>
                    <span className="text-gray-500">• {post.readTime} lettura</span>
                    <span className="text-gray-500">• {post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors" dangerouslySetInnerHTML={{__html: post.title}}></h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="text-white text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Leggi articolo <ArrowRight className="w-4 h-4 text-primary-500" />
                  </span>
                </div>
              </article>
            ))}
          </div>
      )}
    </div>
  );
};

const DashboardPage = () => (
  <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div className="bg-dark-900 border border-white/10 rounded-2xl p-12 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
         <User className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Area Riservata</h2>
      <p className="text-gray-400 mb-8">Accedi per gestire i tuoi terreni e visualizzare lo storico report.</p>
      <div className="flex justify-center gap-4">
        <button className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">Login con Google</button>
        <button className="bg-transparent border border-white/20 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/5 transition-colors">Registrati</button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage onStartAnalysis={() => setCurrentPage('analysis')} />;
      case 'analysis': return <AnalysisPage />;
      case 'marketplace': return <MarketplacePage />;
      case 'blog': return <BlogPage />;
      case 'dashboard': return <DashboardPage />;
      default: return <HomePage onStartAnalysis={() => setCurrentPage('analysis')} />;
    }
  };

  return (
    <div className="bg-black min-h-screen text-gray-100 font-sans selection:bg-primary-500/30">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="fade-in">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
