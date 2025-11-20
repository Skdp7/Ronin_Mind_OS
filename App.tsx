
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { 
  ArrowRight, MapPin, Activity, Sun, Wind, Zap, Layers, 
  ShieldCheck, TrendingUp, CheckCircle, BarChart3, Lock, Unlock,
  Search, Filter, Upload, Hexagon, FileText, AlertTriangle,
  Droplets, Mountain, Navigation, Download, Printer, Loader2,
  ChevronDown, Building, Database, Cpu, Globe, Clock, Plus,
  Eye, EyeOff, Edit, Save, X, Coins, FileSpreadsheet, LandPlot, Scale,
  Home, Tent, Timer, Wallet, Zap as ZapIcon, Sparkles, Smartphone, Hourglass, User,
  Briefcase, HardHat, Sprout, Landmark, Warehouse, DollarSign, Mail, LogIn, LogOut,
  LayoutDashboard, Settings, PlusCircle, Chrome, Wand2, TreeDeciduous, Factory, Hammer
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
  const side = Math.sqrt(sizeSqm);
  const half = side / 2;
  
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

// 1. INTENT SEARCH BAR COMPONENT (REDESIGNED - PREMIUM)
const IntentSearchBar = ({ onNavigate }: { onNavigate: (mode: string) => void }) => {
  const [text, setText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [intentResult, setIntentResult] = useState<{category: string, icon: any, desc: string, action: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = [
    "Sono un costruttore...",
    "Voglio investire nel fotovoltaico...",
    "Cerco un terreno per costruire casa...",
    "Voglio vendere il mio terreno agricolo...",
    "Cerco opportunità di investimento..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    setShowSuggestions(true);

    // ADVANCED INTENT LOGIC MAPPING
    const lowerVal = val.toLowerCase();
    if (lowerVal.includes('costru') || lowerVal.includes('casa') || lowerVal.includes('villa')) {
        setIntentResult({ 
            category: 'Sviluppo Residenziale', 
            icon: Hammer, 
            desc: 'Analizza lotti edificabili per progetti residenziali.', 
            action: 'analysis' 
        });
    } else if (lowerVal.includes('vende') || lowerVal.includes('privato') || lowerVal.includes('propriet')) {
        setIntentResult({ 
            category: 'Vendi Proprietà', 
            icon: DollarSign, 
            desc: 'Ottieni una valutazione e connettiti con i fondi.', 
            action: 'sell' 
        });
    } else if (lowerVal.includes('invest') || lowerVal.includes('soldi') || lowerVal.includes('solare') || lowerVal.includes('reddito')) {
        setIntentResult({ 
            category: 'Investimento & Reddito', 
            icon: TrendingUp, 
            desc: 'Calcola ROI per Fotovoltaico, Glamping o Logistica.', 
            action: 'income' 
        });
    } else if (lowerVal.includes('agricol') || lowerVal.includes('bio') || lowerVal.includes('vigne')) {
        setIntentResult({ 
            category: 'Sviluppo Agricolo', 
            icon: Sprout, 
            desc: 'Analisi suolo e clima per colture ad alto valore.', 
            action: 'analysis' 
        });
    } else {
        setIntentResult(null);
    }
  };

  const executeAction = (mode: string) => {
      setShowSuggestions(false);
      setText('');
      onNavigate(mode);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-12 px-4 relative z-50">
       {/* MAIN SEARCH CONTAINER */}
       <div className="relative group">
          {/* Glow Effect Behind */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
          
          {/* Input Bar */}
          <div className="relative bg-black/60 backdrop-blur-xl rounded-full border border-white/10 flex items-center shadow-2xl h-16 transition-all focus-within:bg-black/80 focus-within:border-primary-500/50">
              
              {/* Animated Icon */}
              <div className="pl-6 pr-4 border-r border-white/5 h-8 flex items-center">
                 <Sparkles className="w-5 h-5 text-accent-500 animate-pulse" />
              </div>
              
              {/* Input Field */}
              <input 
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleInput}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent border-none text-white px-4 h-full focus:ring-0 outline-none text-lg placeholder:text-gray-400 font-medium"
                placeholder={text ? "" : placeholders[placeholderIndex]}
              />

              {/* Action Button */}
              <button className="mr-2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all flex items-center justify-center">
                  <Search className="w-5 h-5" />
              </button>
          </div>
       </div>

       {/* DROPDOWN SUGGESTIONS (Floating Glass) */}
       {showSuggestions && (
           <div className="absolute top-full left-0 right-0 mt-4 px-0 animate-slide-up origin-top z-50">
               <div className="bg-[#09090b] border border-white/10 rounded-2xl p-2 shadow-2xl ring-1 ring-white/5 overflow-hidden">
                   
                   {text.length > 0 && (
                       <div className="mb-2 px-2 pt-2">
                           <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Miglior Risultato</div>
                           {intentResult ? (
                               <div 
                                    onClick={() => executeAction(intentResult.action)}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-primary-900/20 border border-primary-500/20 cursor-pointer hover:bg-primary-900/40 transition-all group"
                                >
                                   <div className="bg-primary-500 p-3 rounded-lg text-black shadow-lg shadow-primary-500/20">
                                       <intentResult.icon className="w-6 h-6" />
                                   </div>
                                   <div className="flex-1">
                                       <div className="text-white font-bold text-lg group-hover:text-primary-400 transition-colors">{intentResult.category}</div>
                                       <div className="text-gray-300 text-sm">{intentResult.desc}</div>
                                   </div>
                                   <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                               </div>
                           ) : (
                               <div className="p-4 text-gray-400 italic text-sm flex items-center gap-2">
                                   <Loader2 className="w-4 h-4 animate-spin" /> Analisi intento in corso...
                               </div>
                           )}
                       </div>
                   )}

                   <div className="p-2">
                       <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 px-2">Esplora Rapido</div>
                       <div className="grid grid-cols-2 gap-2">
                           {[
                               {text: "Costruire Casa", icon: Home, action: 'analysis'},
                               {text: "Vendere Terreno", icon: DollarSign, action: 'sell'},
                               {text: "Investire Solare", icon: Sun, action: 'income'},
                               {text: "Agricoltura Bio", icon: Sprout, action: 'analysis'}
                           ].map((chip, i) => (
                               <button 
                                key={i}
                                onClick={() => executeAction(chip.action)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/80 border border-white/5 hover:border-white/20 transition-all text-left group"
                               >
                                   <chip.icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                   <span className="text-sm text-gray-200 group-hover:text-white font-medium">{chip.text}</span>
                               </button>
                           ))}
                       </div>
                   </div>

               </div>
           </div>
       )}
    </div>
  );
};


const SearchWidget = ({ onSearch }: { onSearch: (mode: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'income'>('buy');
  const [formData, setFormData] = useState({
    location: '',
    type: 'Agricolo',
    size: '',
    minPrice: '',
    maxPrice: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<{icon: any, text: string, subtext: string, color: string}[]>([]);

  // SUGGESTION ENGINE (REAL-TIME AI SIMULATION)
  useEffect(() => {
    const { location, type, size } = formData;
    
    // Only run suggestions for Sell/Income mode
    if (activeTab !== 'buy' && location.length > 2) {
      setIsAnalyzing(true);
      
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        const loc = location.toLowerCase();
        const sizeNum = parseFloat(size) || 0;
        
        // Geographic Logic
        const isSouth = loc.includes('puglia') || loc.includes('sicilia') || loc.includes('calabria') || loc.includes('basilicata') || loc.includes('sardegna');
        const isNorth = loc.includes('milano') || loc.includes('torino') || loc.includes('veneto') || loc.includes('lombardia') || loc.includes('emilia');
        const isCentral = loc.includes('toscana') || loc.includes('umbria') || loc.includes('lazio') || loc.includes('marche');

        let newSuggestions = [];

        if (activeTab === 'sell') {
           // SELL LOGIC
           if (type === 'Edificabile') {
              if(isNorth) newSuggestions.push({ icon: HardHat, text: "Richiesta Costruttori Alta", subtext: "35 cantieri attivi in zona. Vendita rapida.", color: 'text-blue-400' });
              newSuggestions.push({ icon: Briefcase, text: "Fondi Immobiliari", subtext: "Ricerca lotti > 1000mq per residenziale.", color: 'text-green-400' });
           } else if (type === 'Agricolo' && sizeNum > 10000) {
              newSuggestions.push({ icon: Sun, text: "Potenziale Agri-Voltaico", subtext: "Investitori energetici cercano > 1ha.", color: 'text-yellow-400' });
              newSuggestions.push({ icon: Globe, text: "Investitori Esteri", subtext: "Interesse per bio/vigneti.", color: 'text-purple-400' });
           } else {
              newSuggestions.push({ icon: TrendingUp, text: "Valutazione Immediata", subtext: "Prezzi zona stabili/in crescita.", color: 'text-primary-400' });
           }

        } else if (activeTab === 'income') {
           // INCOME LOGIC
           if ((isSouth || isCentral) && sizeNum > 5000) {
              newSuggestions.push({ icon: Sun, text: "Affitto Solare", subtext: "Rendita stimata €3.500/ha/anno.", color: 'text-yellow-400' });
           }
           if (type === 'Agricolo' && (isCentral || isSouth)) {
              newSuggestions.push({ icon: Tent, text: "Glamping & Turismo", subtext: "ROI 18% con tende lusso.", color: 'text-green-400' });
           }
           if (type === 'Industriale') {
              newSuggestions.push({ icon: Warehouse, text: "Logistica", subtext: "Affitto piazzali €15/mq.", color: 'text-blue-400' });
           }
           if (type === 'Edificabile') {
               newSuggestions.push({ icon: Building, text: "Permuta", subtext: "Scambia con appartamenti.", color: 'text-indigo-400' });
           }
        }
        
        // Default suggestion if none matched
        if(newSuggestions.length === 0) {
             newSuggestions.push({ icon: Sparkles, text: "Analisi Potenziale", subtext: "Completa i dati per il report.", color: 'text-gray-400' });
        }

        setSuggestions(newSuggestions);
      }, 600);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [formData, activeTab]);

  const updateField = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-xl mx-auto lg:ml-auto relative z-20 animate-float">
      
      {/* TABS */}
      <div className="flex space-x-1 mb-2 p-1 bg-black/40 backdrop-blur-md rounded-t-xl border border-white/5 w-fit">
        <button 
          onClick={() => { setActiveTab('buy'); setFormData({...formData, location: ''}); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wide ${
            activeTab === 'buy' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-3 h-3" /> Compra
        </button>
        <button 
          onClick={() => { setActiveTab('sell'); setFormData({...formData, location: ''}); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wide ${
            activeTab === 'sell' ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Coins className="w-3 h-3" /> Vendi
        </button>
        <button 
          onClick={() => { setActiveTab('income'); setFormData({...formData, location: ''}); }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wide ${
            activeTab === 'income' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3 h-3" /> Reddito
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="glass-card p-8 rounded-b-3xl rounded-tr-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-black/80 relative overflow-hidden ring-1 ring-white/5">
        
        <h3 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-2">
            {activeTab === 'buy' && "Trova il terreno perfetto"}
            {activeTab === 'sell' && <><span className="text-primary-500">Monetizza</span> la tua proprietà</>}
            {activeTab === 'income' && "Calcola rendita potenziale"}
        </h3>
        
        <div className="space-y-4">
          
          {/* LOCATION (SHARED) */}
          <div className="relative group">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Dove si trova il terreno?</label>
            <div className="relative">
                <input 
                type="text" 
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Città, CAP o Zona (es. Chianti)" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                />
                <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin text-primary-500" /> : <MapPin className="w-5 h-5" />}
                </div>
            </div>
          </div>

          {/* TYPE & SIZE (SHARED LAYOUT) */}
          <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Tipologia</label>
                 <div className="relative">
                    <select 
                        value={formData.type}
                        onChange={(e) => updateField('type', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                    >
                        <option className="bg-dark-900">Agricolo</option>
                        <option className="bg-dark-900">Edificabile</option>
                        <option className="bg-dark-900">Industriale</option>
                        <option className="bg-dark-900">Boschivo</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Superficie (mq)</label>
                 <div className="relative">
                    <input 
                        type="number" 
                        value={formData.size}
                        onChange={(e) => updateField('size', e.target.value)}
                        placeholder="Es. 5000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-gray-500 font-mono">MQ</span>
                 </div>
              </div>
          </div>

          {/* BUY MODE ONLY: PRICE RANGE */}
          {activeTab === 'buy' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div>
                     <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Prezzo Min</label>
                     <div className="relative">
                        <input 
                            type="number" 
                            placeholder="€ 0" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary-500" 
                            value={formData.minPrice}
                            onChange={(e) => updateField('minPrice', e.target.value)}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-bold">Prezzo Max</label>
                     <div className="relative">
                        <input 
                            type="number" 
                            placeholder="€ Max" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary-500" 
                            value={formData.maxPrice}
                            onChange={(e) => updateField('maxPrice', e.target.value)}
                        />
                     </div>
                  </div>
              </div>
          )}

          {/* SELL & INCOME: AI SUGGESTIONS */}
          {activeTab !== 'buy' && suggestions.length > 0 && (
              <div className="mt-4 space-y-2 animate-slide-up">
                  <div className="text-[10px] text-primary-500 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Suggerimenti AI Real-Time
                  </div>
                  {suggestions.map((s, idx) => (
                      <div key={idx} className="glass-panel border border-white/10 rounded-xl p-3 flex items-start gap-3 hover:bg-white/10 hover:border-primary-500/30 transition-all cursor-default shadow-lg">
                          <div className={`p-2 rounded-lg bg-black/40 border border-white/5 ${s.color}`}>
                              <s.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                              <div className={`text-sm font-bold ${s.color}`}>{s.text}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{s.subtext}</div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* ACTION BUTTON */}
          <button 
            onClick={() => onSearch(activeTab)}
            className={`w-full font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-3 active:scale-95 mt-4 shadow-xl uppercase tracking-wide text-sm ${
                activeTab === 'buy' ? 'bg-white text-black hover:bg-gray-200' :
                activeTab === 'sell' ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-500/20' :
                'bg-accent-600 text-white hover:bg-accent-500 shadow-accent-500/20'
            }`}
          >
            {activeTab === 'buy' ? 'CERCA TERRENI' : activeTab === 'sell' ? 'VALUTA E MONETIZZA' : 'CALCOLA RENDITA'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ValuePropositionSection = () => {
  return (
    <div className="py-32 bg-black relative overflow-hidden">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* OLD METHOD CARD - GLASS DARK */}
            <div className="glass-panel border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all duration-500 hover:shadow-xl hover:shadow-red-900/10">
                <div className="absolute top-0 right-0 bg-red-500/20 px-4 py-1 rounded-bl-xl text-red-400 text-xs font-bold font-mono tracking-wider">METODO TRADIZIONALE</div>
                
                {/* SPEED METER SLOW */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Hourglass className="w-6 h-6 text-red-500 animate-pulse" />
                        <h3 className="text-2xl font-bold text-white">30 Giorni</h3>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[5%]"></div>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                        <span className="text-gray-400">Geometra (Visure)</span>
                        <span className="font-mono text-white">€ 350</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                        <span className="text-gray-400">Relazione Geologica</span>
                        <span className="font-mono text-white">€ 800</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                        <span className="text-gray-400">Studio Fattibilità Arch.</span>
                        <span className="font-mono text-white">€ 1.500</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                        <span className="text-gray-400">Business Plan</span>
                        <span className="font-mono text-white">€ 600</span>
                    </div>
                </div>

                {/* TOTAL HUD */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center group-hover:bg-red-500/20 transition-all">
                        <div className="text-xs text-red-400 uppercase tracking-widest mb-1">Costo Totale Stimato</div>
                        <div className="text-4xl font-bold text-red-500 font-mono">€ 3.250</div>
                    </div>
                </div>
            </div>

            {/* NEW METHOD CARD - GLASS GREEN GLOW */}
            <div className="glass-panel border border-primary-500/30 p-8 rounded-3xl relative overflow-hidden group hover:border-primary-500/60 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(34,197,94,0.2)]">
                <div className="absolute top-0 right-0 bg-primary-500 px-4 py-1 rounded-bl-xl text-black text-xs font-bold font-mono tracking-wider">TERRENINVENDITA.AI</div>
                
                {/* SPEED METER FAST */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <ZapIcon className="w-6 h-6 text-primary-500 animate-bounce" />
                        <h3 className="text-2xl font-bold text-white">12 Secondi</h3>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary-500 w-full animate-scan"></div>
                        <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-r from-transparent to-primary-500 opacity-50 blur-sm"></div>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 group-hover:bg-primary-500/10 transition-all">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                            <span className="text-gray-200">Dati Catastali & Urbanistici</span>
                        </div>
                        <span className="font-bold text-white">Incluso</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 group-hover:bg-primary-500/10 transition-all">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                            <span className="text-gray-200">Analisi Geologica AI</span>
                        </div>
                        <span className="font-bold text-white">Incluso</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 group-hover:bg-primary-500/10 transition-all">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                            <span className="text-gray-200">Export CAD Tecnico</span>
                        </div>
                        <span className="font-bold text-white">Incluso</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 group-hover:bg-primary-500/10 transition-all">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                            <span className="text-gray-200">Business Plan Bancabile</span>
                        </div>
                        <span className="font-bold text-white">Incluso</span>
                    </div>
                </div>

                {/* TOTAL HUD */}
                <div className="mt-8 pt-6 border-t border-primary-500/20">
                    <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-6 text-center group-hover:bg-primary-500/20 transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-500/10 blur-xl animate-pulse"></div>
                        <div className="relative z-10">
                            <div className="text-xs text-primary-400 uppercase tracking-widest mb-1">Costo Report Premium</div>
                            <div className="text-5xl font-bold text-primary-500 font-mono">€ 49</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

const HeroSection = ({ onStartAnalysis }: { onStartAnalysis: (mode: string) => void }) => (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black z-10" />
      <img 
        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80" 
        alt="Land Landscape" 
        className="w-full h-full object-cover"
      />
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 animate-float">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-primary-100">La prima AI per il Land Banking</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
                  Decodifica il valore del tuo terreno.
                </h1>
                
                <p className="text-xl text-gray-300 mb-10 max-w-xl leading-relaxed font-light">
                  Ottieni un'analisi scientifica istantanea su edificabilità, rischio idrogeologico e potenziale fotovoltaico. Mettiti in contatto diretto con costruttori e fondi d'investimento.
                </p>
                
                {/* HUD Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: "Dataset Analizzati", val: "45TB+" },
                        { label: "Terreni Mappati", val: "12.5K" },
                        { label: "Precisione AI", val: "99.8%" },
                        { label: "Tempo Analisi", val: "0.2s" }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-3 rounded-xl text-center group hover:border-primary-500/30 transition-all cursor-default">
                            <div className="text-lg font-bold text-white font-display group-hover:text-primary-400 transition-colors">{stat.val}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* NEW INTENT SEARCH BAR */}
                <IntentSearchBar onNavigate={onStartAnalysis} />

            </div>

            {/* Right Widget */}
            <div className="mt-12 lg:mt-0">
                <SearchWidget onSearch={onStartAnalysis} />
            </div>
        </div>
    </div>
  </div>
);

const FeaturedSection = () => {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [listings, setListings] = useState(MOCK_FEATURED_LISTINGS_FALLBACK);

    // Load from DB on mount
    useEffect(() => {
        const saved = localStorage.getItem('featured_listings');
        if (saved) {
            setListings(JSON.parse(saved));
        }
    }, []);

    const handleImageUpload = (id: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            const updated = listings.map(l => l.id === id ? { ...l, img: base64 } : l);
            setListings(updated);
            localStorage.setItem('featured_listings', JSON.stringify(updated));
        };
        reader.readAsDataURL(file);
    };

    const updateField = (id: string, field: string, value: string | number) => {
        const updated = listings.map(l => l.id === id ? { ...l, [field]: value } : l);
        setListings(updated);
        localStorage.setItem('featured_listings', JSON.stringify(updated));
    };

    return (
        <div className="py-24 bg-dark-900 border-t border-white/5 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header with Admin Toggle */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white mb-2">Vuoi mostrare qui la tua proprietà?</h2>
                        <p className="text-gray-400">I terreni migliori d'Italia scelti dall'AI. Dai visibilità al tuo lotto o esplora le opportunità.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`px-3 py-1 rounded border text-xs font-mono transition-all ${isAdminMode ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/10 text-gray-500 hover:text-white'}`}
                        >
                            {isAdminMode ? 'Admin Mode ON' : 'Admin Mode'}
                        </button>

                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-primary-500 transition-all">
                                Pubblica il tuo annuncio <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {listings.map((item) => (
                        <div key={item.id} className="group relative bg-dark-800 rounded-2xl overflow-hidden border border-white/5 hover:border-primary-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
                            
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden cursor-pointer">
                                <img src={item.img} alt={item.location} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80"></div>
                                
                                {/* Status Badge */}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-white/10">
                                    {item.status}
                                </div>

                                {/* Admin Upload Overlay */}
                                {isAdminMode && (
                                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-8 h-8 text-white mb-2" />
                                        <span className="text-xs text-white font-mono">Change Photo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(item.id, e.target.files[0])} />
                                    </label>
                                )}
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 w-full p-4">
                                {/* Price Tag */}
                                <div className="inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-md mb-2 shadow-lg">
                                    {isAdminMode ? (
                                        <input 
                                            value={item.priceLabel} 
                                            onChange={(e) => updateField(item.id, 'priceLabel', e.target.value)}
                                            className="bg-transparent border-b border-white/50 outline-none w-24 text-white"
                                        />
                                    ) : item.priceLabel}
                                </div>

                                <h3 className="text-white font-bold text-lg mb-1 truncate">
                                    {isAdminMode ? (
                                        <input 
                                            value={item.location} 
                                            onChange={(e) => updateField(item.id, 'location', e.target.value)}
                                            className="bg-transparent border-b border-white/50 outline-none w-full"
                                        />
                                    ) : item.location}
                                </h3>

                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-xs text-gray-400 font-mono">
                                    <div>
                                        <span className="block text-gray-600 uppercase tracking-wider mb-0.5">Area:</span>
                                        <span className="text-white">{item.area} m²</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-gray-600 uppercase tracking-wider mb-0.5">Tipo:</span>
                                        <span className="text-white capitalize">{item.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Publishing Options Section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-primary-500/30 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Globe className="w-32 h-32 text-white" />
                        </div>
                        <div className="bg-primary-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-primary-400 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Listing Pubblico</h3>
                        <p className="text-gray-400 text-sm mb-6">Massimizza la visibilità pubblicando il tuo terreno sul marketplace globale. Ideale per vendite veloci.</p>
                        <div className="flex items-center text-primary-400 text-sm font-bold gap-2">
                            Inizia ora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-accent-500/30 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Lock className="w-32 h-32 text-white" />
                        </div>
                        <div className="bg-accent-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-accent-400 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Off-Market Privato</h3>
                        <p className="text-gray-400 text-sm mb-6">Vendi con discrezione. Il tuo terreno sarà visibile solo a investitori qualificati e fondi verificati.</p>
                        <div className="flex items-center text-accent-400 text-sm font-bold gap-2">
                            Accedi all'area riservata <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const AnalysisPage = ({ initialMode }: { initialMode?: string }) => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('solar');

  // Calculate financials when report is ready or scenario changes
  useEffect(() => {
    if (report) {
        const data = calculateFinancials(report.data.solar.irradiance, 5000, activeScenario);
        setFinancialData(data);
    }
  }, [report, activeScenario]);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const targetAddress = address.trim() || "Roma, Italia";
    setAddress(targetAddress);
    
    setStep(2);
    setIsScanning(true);
    setScanLog([]);

    const addToLog = (msg: string) => setScanLog(prev => [...prev, msg]);

    addToLog(`Inizializzazione satellite...`);
    await new Promise(r => setTimeout(r, 800));

    addToLog(`Geocoding indirizzo: ${targetAddress}`);
    const coords = await getCoordinates(targetAddress) || { lat: 41.9028, lng: 12.4964 }; 
    await new Promise(r => setTimeout(r, 800));
    
    addToLog(`Coordinate rilevate: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
    addToLog(`Scaricamento DEM (Digital Elevation Model)...`);
    const elevation = await getRealElevation(coords.lat, coords.lng);
    await new Promise(r => setTimeout(r, 1000));

    addToLog(`Analisi climatica ERA5 (Precipitazioni/Temp)...`);
    await getRealWeatherHistory(coords.lat, coords.lng); 
    await new Promise(r => setTimeout(r, 800));

    addToLog(`Elaborazione Gemini AI...`);
    
    const detailedData: DetailedAnalysisData = {
        morphology: {
            elevation: elevation,
            slope: Math.floor(Math.random() * 15),
            exposure: 'Sud-Est',
            terrainType: 'Misto/Argilloso'
        },
        solar: {
            irradiance: 1450 + Math.random() * 200,
            sunHours: 2400,
            pvPotential: 'Alto',
            shadingLoss: 2
        },
        wind: {
            speedAvg: 4.5,
            directionDominant: 'NW',
            gustPeak: 12
        },
        geology: {
            soilType: 'Limoso',
            permeability: 'Media',
            loadBearing: '2.5',
            clcClass: 'Seminativi'
        },
        risks: {
            seismicZone: '2',
            floodHazard: 'P1',
            landslideRisk: 'Assente'
        },
        context: {
            urbanDensity: 'Bassa',
            nearestRoad: 150,
            noiseLevel: 35,
            accessQuality: 8
        }
    };

    const aiResult = await generateLandAnalysisSummary(targetAddress, detailedData);

    setReport({
        id: `REP-${Date.now()}`,
        address: targetAddress,
        coordinates: coords,
        scores: {
            agriculture: 85,
            construction: 70,
            solar: 92,
            environmental: 88,
            total: 84
        },
        data: detailedData,
        aiSummary: aiResult.summary,
        recommendations: aiResult.recommendations,
        generatedAt: new Date()
    });

    setIsScanning(false);
    setStep(3);
  };

  const handleUnlock = () => {
      // Simulate payment
      const btn = document.getElementById('unlock-btn');
      if(btn) btn.textContent = 'Elaborazione pagamento...';
      setTimeout(() => {
          setIsPremiumUnlocked(true);
      }, 1500);
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {step === 1 && (
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl font-display font-bold text-white mb-6">
              Analisi Terreno <span className="text-primary-500">AI-Powered</span>
            </h1>
            <p className="text-gray-400 mb-12 text-lg">
              Inserisci l'indirizzo o le coordinate. I nostri algoritmi incroceranno dati satellitari, 
              geologici e urbanistici per fornirti un report scientifico in 30 secondi.
            </p>

            <div className="glass-panel p-8 rounded-2xl border border-white/10">
              <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                 <button className="text-primary-400 border-b-2 border-primary-500 pb-4 -mb-4 font-medium">Indirizzo</button>
                 <button className="text-gray-400 hover:text-white transition-colors">Particella Catastale</button>
                 <button className="text-gray-400 hover:text-white transition-colors">Coordinate GPS</button>
              </div>
              
              <form onSubmit={handleScan} className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Es: Via Roma 1, Siena"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10"
                >
                  Avvia Scansione Live
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-xl mx-auto text-center pt-12">
            <div className="relative w-64 h-64 mx-auto mb-12">
              <div className="absolute inset-0 rounded-full border-4 border-primary-900/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-primary-500/50 border-t-primary-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-primary-500/10 backdrop-blur-sm flex items-center justify-center">
                 <Hexagon className="w-16 h-16 text-primary-500 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-6">Analisi in corso...</h2>
            <div className="bg-black/50 rounded-xl p-6 font-mono text-sm text-left h-48 overflow-hidden border border-white/10 relative">
              {scanLog.map((log, i) => (
                <div key={i} className="text-primary-400 mb-2 flex items-center gap-2">
                   <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                   <CheckCircle className="w-3 h-3" /> 
                   {log}
                </div>
              ))}
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black to-transparent"></div>
            </div>
          </div>
        )}

        {step === 3 && report && financialData && (
          <div className="animate-fade-in">
             {/* HEADER */}
             <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-primary-500 mb-2">
                        <CheckCircle className="w-5 h-5" /> Analisi Completata
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white">{report.address}</h1>
                    <p className="text-gray-400 text-sm font-mono mt-1">
                        LAT: {report.coordinates.lat.toFixed(4)} • LNG: {report.coordinates.lng.toFixed(4)}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-bold text-white font-display">{report.scores.total}/100</div>
                    <div className="text-sm text-gray-400 uppercase tracking-widest">AI Score</div>
                </div>
             </div>

             {/* GRID LAYOUT */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                 
                 {/* LEFT COL - MAP & DATA */}
                 <div className="lg:col-span-2 space-y-8">
                     {/* AI SUMMARY */}
                     <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                         <div className="flex items-center gap-2 mb-4">
                             <Sparkles className="w-5 h-5 text-accent-500" />
                             <h3 className="font-bold text-white">Sintesi Gemini AI</h3>
                         </div>
                         <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                             {report.aiSummary}
                         </p>
                     </div>

                     {/* CHARTS ROW */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="glass-panel p-6 rounded-2xl border border-white/10">
                             <h4 className="text-gray-400 text-sm font-bold mb-4 uppercase">Morfologia</h4>
                             <div className="space-y-4">
                                 <div className="flex justify-between">
                                     <span className="text-gray-400">Altitudine</span>
                                     <span className="text-white font-mono">{report.data.morphology.elevation} m</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-gray-400">Pendenza</span>
                                     <span className="text-white font-mono">{report.data.morphology.slope}%</span>
                                 </div>
                                 <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
                                     <div className="bg-blue-500 h-full" style={{ width: `${report.data.morphology.slope * 2}%` }}></div>
                                 </div>
                             </div>
                         </div>

                         <div className="glass-panel p-6 rounded-2xl border border-white/10">
                             <h4 className="text-gray-400 text-sm font-bold mb-4 uppercase">Irraggiamento</h4>
                             <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={SOLAR_DATA}>
                                        <defs>
                                            <linearGradient id="colorSun" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="val" stroke="#fbbf24" fillOpacity={1} fill="url(#colorSun)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="text-center mt-2 text-xs text-gray-500">Curva Solare Media Giornaliera</div>
                         </div>
                     </div>
                 </div>

                 {/* RIGHT COL - SCORES & RECS */}
                 <div className="space-y-6">
                     <div className="glass-panel p-6 rounded-2xl border border-white/10">
                         <h3 className="font-bold text-white mb-6">Punteggi Settoriali</h3>
                         <div className="space-y-6">
                             <div>
                                 <div className="flex justify-between mb-2 text-sm">
                                     <span className="text-gray-300">Agricolo</span>
                                     <span className="text-white font-bold">{report.scores.agriculture}/100</span>
                                 </div>
                                 <div className="w-full bg-gray-800 h-2 rounded-full">
                                     <div className="bg-green-500 h-full rounded-full" style={{ width: `${report.scores.agriculture}%` }}></div>
                                 </div>
                             </div>
                             <div>
                                 <div className="flex justify-between mb-2 text-sm">
                                     <span className="text-gray-300">Edificabile</span>
                                     <span className="text-white font-bold">{report.scores.construction}/100</span>
                                 </div>
                                 <div className="w-full bg-gray-800 h-2 rounded-full">
                                     <div className="bg-blue-500 h-full rounded-full" style={{ width: `${report.scores.construction}%` }}></div>
                                 </div>
                             </div>
                             <div>
                                 <div className="flex justify-between mb-2 text-sm">
                                     <span className="text-gray-300">Fotovoltaico</span>
                                     <span className="text-white font-bold">{report.scores.solar}/100</span>
                                 </div>
                                 <div className="w-full bg-gray-800 h-2 rounded-full">
                                     <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${report.scores.solar}%` }}></div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="glass-panel p-6 rounded-2xl border border-white/10">
                         <h3 className="font-bold text-white mb-4">Raccomandazioni</h3>
                         <ul className="space-y-3">
                             {report.recommendations.map((rec, i) => (
                                 <li key={i} className="flex gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                     <TrendingUp className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                     {rec}
                                 </li>
                             ))}
                         </ul>
                     </div>
                 </div>
             </div>

             {/* PREMIUM SECTION - BUSINESS PLAN */}
             <div className="mt-20 relative">
                 {/* Header */}
                 <div className="flex items-center gap-3 mb-8">
                     <div className="bg-primary-500 w-1 h-8 rounded-full"></div>
                     <h2 className="text-2xl font-bold text-white">Strategia & Finanza</h2>
                     <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-bold rounded border border-primary-500/30">PRO PLAN</span>
                 </div>

                 {/* Constraints Check (Visual) */}
                 <div className="grid grid-cols-3 gap-4 mb-8">
                     {[
                         { label: "PAI Idrogeologico", status: "Verifica OK", color: "text-green-500", icon: CheckCircle },
                         { label: "Vincolo Paesaggistico", status: "Assente", color: "text-green-500", icon: CheckCircle },
                         { label: "Urbanistica (PRG)", status: "Verifica in corso", color: "text-yellow-500", icon: AlertTriangle }
                     ].map((item, i) => (
                        <div key={i} className={`glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-3 ${!isPremiumUnlocked ? 'blur-sm opacity-50' : ''}`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                            <div>
                                <div className="text-xs text-gray-500 uppercase">{item.label}</div>
                                <div className={`font-bold ${item.color}`}>{item.status}</div>
                            </div>
                        </div>
                     ))}
                 </div>

                 {/* Scenario Selector */}
                 <div className={`flex gap-4 mb-6 ${!isPremiumUnlocked ? 'blur-sm pointer-events-none' : ''}`}>
                     <button 
                        onClick={() => setActiveScenario('solar')}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${activeScenario === 'solar' ? 'bg-primary-600 border-primary-500 text-white' : 'bg-transparent border-white/20 text-gray-400'}`}
                     >
                         <Sun className="w-4 h-4" /> Agri-Voltaico
                     </button>
                     <button 
                        onClick={() => setActiveScenario('glamping')}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${activeScenario === 'glamping' ? 'bg-primary-600 border-primary-500 text-white' : 'bg-transparent border-white/20 text-gray-400'}`}
                     >
                         <Tent className="w-4 h-4" /> Glamping Green
                     </button>
                     <button 
                        onClick={() => setActiveScenario('construction')}
                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${activeScenario === 'construction' ? 'bg-primary-600 border-primary-500 text-white' : 'bg-transparent border-white/20 text-gray-400'}`}
                     >
                         <Building className="w-4 h-4" /> Residenziale
                     </button>
                 </div>

                 {/* Content Container */}
                 <div className="relative">
                     
                     {/* PAYWALL OVERLAY */}
                     {!isPremiumUnlocked && (
                         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl border border-white/10">
                             <div className="bg-black p-4 rounded-full border border-primary-500/50 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                 <Lock className="w-8 h-8 text-primary-500" />
                             </div>
                             <h3 className="text-2xl font-bold text-white mb-2">Sblocca Report Completo</h3>
                             <p className="text-gray-400 mb-8 text-center max-w-md">
                                 Accedi al Business Plan finanziario, scarica i file DXF per il tuo architetto e vedi l'analisi vincolistica completa.
                             </p>
                             <div className="flex gap-4">
                                <button 
                                    id="unlock-btn"
                                    onClick={handleUnlock}
                                    className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg transition-all"
                                >
                                    Sblocca Ora (€ 49)
                                </button>
                                <button 
                                    onClick={() => setIsPremiumUnlocked(true)}
                                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
                                >
                                    Vedi Esempio
                                </button>
                             </div>
                         </div>
                     )}

                     {/* BLURRED CONTENT */}
                     <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${!isPremiumUnlocked ? 'filter blur-md select-none opacity-30' : ''}`}>
                         
                         {/* Financial Metrics */}
                         <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-primary-900/10 to-transparent">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                 <div>
                                     <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">CAPEX</div>
                                     <div className="text-2xl font-bold text-white font-mono">€ {(financialData.capex / 1000).toFixed(0)}k</div>
                                 </div>
                                 <div>
                                     <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">{financialData.metricLabel}</div>
                                     <div className="text-2xl font-bold text-white font-mono">{financialData.mainMetric}</div>
                                 </div>
                                 <div>
                                     <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">ROI (20Y)</div>
                                     <div className="text-2xl font-bold text-green-400 font-mono">{financialData.roi}%</div>
                                 </div>
                                 <div>
                                     <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">Payback</div>
                                     <div className="text-2xl font-bold text-white font-mono">{financialData.paybackYear}</div>
                                 </div>
                             </div>
                             
                             <div className="h-64 w-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                     <BarChart data={financialData.cashFlow}>
                                         <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                         <XAxis dataKey="year" stroke="#666" fontSize={12} />
                                         <YAxis stroke="#666" fontSize={12} />
                                         <Tooltip 
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff' }}
                                            itemStyle={{ color: '#22c55e' }}
                                         />
                                         <Bar dataKey="cash" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                     </BarChart>
                                 </ResponsiveContainer>
                             </div>
                             <div className="text-center mt-4 text-xs text-gray-500">Proiezione Cash Flow Cumulativo (20 Anni)</div>
                         </div>

                         {/* Download & Tools */}
                         <div className="space-y-4">
                             <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                 <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                     <FileText className="w-4 h-4 text-primary-500" /> Export Tecnico
                                 </h4>
                                 <div className="space-y-3">
                                     <button 
                                        onClick={() => generateAndDownloadDXF(5000)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/50 transition-all group"
                                     >
                                         <div className="flex items-center gap-3">
                                             <div className="bg-black/50 p-2 rounded text-blue-400 font-mono text-xs">DXF</div>
                                             <span className="text-sm text-gray-300 group-hover:text-white">Planimetria CAD</span>
                                         </div>
                                         <Download className="w-4 h-4 text-gray-500 group-hover:text-primary-500" />
                                     </button>

                                     <button 
                                        onClick={() => generateAndDownloadCSV(report, financialData)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/50 transition-all group"
                                     >
                                         <div className="flex items-center gap-3">
                                             <div className="bg-black/50 p-2 rounded text-green-400 font-mono text-xs">CSV</div>
                                             <span className="text-sm text-gray-300 group-hover:text-white">Business Plan</span>
                                         </div>
                                         <Download className="w-4 h-4 text-gray-500 group-hover:text-primary-500" />
                                     </button>
                                 </div>
                             </div>

                             <div className="glass-panel p-6 rounded-2xl border border-white/10">
                                 <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                     <ShieldCheck className="w-4 h-4 text-primary-500" /> Certificazioni
                                 </h4>
                                 <button 
                                    onClick={() => generateAndDownloadReport(report)}
                                    className="w-full py-3 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 rounded-xl transition-all text-sm font-bold flex justify-center items-center gap-2"
                                 >
                                     <Printer className="w-4 h-4" /> Scarica Report Tecnico
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

const MarketplacePage = () => {
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sell Form State
  const [sellForm, setSellForm] = useState({
    title: '',
    price: '',
    location: '',
    type: 'Agricolo',
    size: '',
    description: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setIsLoading(true);
    try {
        if (supabase) {
            const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                setListings(data);
            } else {
                setListings(MOCK_LISTINGS_FALLBACK); // Fallback if table doesn't exist yet
            }
        } else {
            setListings(MOCK_LISTINGS_FALLBACK); // Demo mode
        }
    } catch (e) {
        console.error("Error fetching", e);
        setListings(MOCK_LISTINGS_FALLBACK);
    } finally {
        setIsLoading(false);
    }
  }

  async function handlePublish(e: React.FormEvent) {
      e.preventDefault();
      
      const newListing = {
          title: sellForm.title,
          price: parseFloat(sellForm.price),
          location: sellForm.location,
          type: sellForm.type,
          size_sqm: parseFloat(sellForm.size),
          description: sellForm.description,
          image_url: `https://source.unsplash.com/random/800x600/?land,${sellForm.type}`, // Random image for demo
          ai_score: Math.floor(Math.random() * 30) + 70, // Mock score
          features: ['Nuovo', 'Verificato']
      };

      if (supabase) {
          const { error } = await supabase.from('listings').insert([newListing]);
          if (error) {
              alert("Errore pubblicazione: " + error.message);
          } else {
              setIsSellModalOpen(false);
              fetchListings(); // Refresh
          }
      } else {
          // Demo local update
          setListings([ { ...newListing, id: Date.now().toString() }, ...listings ]);
          setIsSellModalOpen(false);
          alert("Annuncio pubblicato (Modalità Demo - Database non connesso)");
      }
  }

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Marketplace</h1>
            <p className="text-gray-400">
                {!isSupabaseConfigured() && <span className="text-orange-500 font-bold mr-2">[DEMO MODE]</span>}
                Terreni verificati con analisi AI inclusa.
            </p>
          </div>
          <button 
            onClick={() => setIsSellModalOpen(true)}
            className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Vendi il tuo terreno
          </button>
        </div>

        {/* Filters Bar */}
        <div className="glass-panel p-4 rounded-xl mb-12 flex flex-wrap gap-4 border border-white/10">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input type="text" placeholder="Cerca per località..." className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <select className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none">
                <option>Tutti i tipi</option>
                <option>Edificabile</option>
                <option>Agricolo</option>
            </select>
            <select className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none">
                <option>Prezzo: Crescente</option>
                <option>Prezzo: Decrescente</option>
            </select>
        </div>

        {/* Grid */}
        {isLoading ? (
            <div className="text-center py-20 text-gray-500">Caricamento terreni...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
                <div key={listing.id} className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all group hover:-translate-y-1">
                <div className="h-48 overflow-hidden relative">
                    <img 
                        src={listing.image_url || listing.imageUrl} 
                        alt={listing.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                        AI Score: <span className="text-primary-400">{listing.ai_score || listing.aiScore}</span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1 block">{listing.type}</span>
                            <h3 className="text-xl font-bold text-white mb-1">{listing.title}</h3>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                                <MapPin className="w-3 h-3" /> {listing.location}
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{listing.description}</p>
                    
                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-300">
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            <LandPlot className="w-4 h-4" /> {listing.size_sqm || listing.sizeSqm} mq
                        </div>
                        {(listing.features || []).slice(0,2).map((f: string, i: number) => (
                            <div key={i} className="bg-white/5 px-2 py-1 rounded">{f}</div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <div className="text-2xl font-bold text-white font-display">€ {(listing.price || 0).toLocaleString()}</div>
                        <button className="text-primary-400 hover:text-white font-bold text-sm transition-colors">
                            Dettagli AI →
                        </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* SELL MODAL */}
        {isSellModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-dark-900 border border-white/20 rounded-2xl w-full max-w-lg p-8 relative shadow-2xl">
                    <button 
                        onClick={() => setIsSellModalOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <h2 className="text-2xl font-bold text-white mb-6">Pubblica il tuo Terreno</h2>
                    
                    <form onSubmit={handlePublish} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Titolo Annuncio</label>
                            <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary-500"
                                value={sellForm.title} onChange={e => setSellForm({...sellForm, title: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Prezzo (€)</label>
                                <input required type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary-500"
                                    value={sellForm.price} onChange={e => setSellForm({...sellForm, price: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Superficie (mq)</label>
                                <input required type="number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary-500"
                                    value={sellForm.size} onChange={e => setSellForm({...sellForm, size: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Città</label>
                                <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary-500"
                                    value={sellForm.location} onChange={e => setSellForm({...sellForm, location: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tipologia</label>
                                <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary-500"
                                    value={sellForm.type} onChange={e => setSellForm({...sellForm, type: e.target.value})}
                                >
                                    <option>Agricolo</option>
                                    <option>Edificabile</option>
                                    <option>Industriale</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Descrizione</label>
                            <textarea className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary-500 h-24"
                                value={sellForm.description} onChange={e => setSellForm({...sellForm, description: e.target.value})}
                            ></textarea>
                        </div>
                        
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg mt-4 transition-all">
                            Pubblica Gratis
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const BlogPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      async function fetchPosts() {
          try {
              const res = await fetch(WORDPRESS_API_URL);
              if(!res.ok) throw new Error("Blog not found");
              const data = await res.json();
              
              const formattedPosts = data.map((p: any) => ({
                  id: p.id,
                  title: p.title.rendered,
                  excerpt: p.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 120) + "...",
                  imageUrl: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || `https://picsum.photos/800/400?random=${p.id}`,
                  date: new Date(p.date).toLocaleDateString(),
                  category: "News",
                  link: p.link
              }));
              setPosts(formattedPosts);
          } catch (e) {
              console.log("Blog fetch failed, using fallback");
              setPosts(MOCK_BLOG);
          } finally {
              setLoading(false);
          }
      }
      fetchPosts();
  }, []);

  return (
      <div className="pt-32 pb-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-display font-bold text-white mb-12 text-center">Blog & Insights</h1>
              
              {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[1,2,3].map(i => (
                          <div key={i} className="h-96 bg-white/5 animate-pulse rounded-2xl"></div>
                      ))}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {posts.map(post => (
                          <a href={post.link || '#'} key={post.id} target="_blank" rel="noreferrer" className="group glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all">
                              <div className="h-48 overflow-hidden">
                                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                              <div className="p-6">
                                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                                      <span className="uppercase tracking-wider">{post.category}</span>
                                      <span>{post.date}</span>
                                  </div>
                                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors" dangerouslySetInnerHTML={{__html: post.title}}></h3>
                                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                                  <div className="text-primary-500 text-sm font-bold flex items-center gap-1">
                                      Leggi articolo <ArrowRight className="w-4 h-4" />
                                  </div>
                              </div>
                          </a>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );
}

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock Login Handler
  const handleAuth = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      
      // Simulate network delay
      setTimeout(() => {
          setUser({ 
              id: 'usr_123', 
              email: email || 'demo@terreninvendita.ai', 
              name: email ? email.split('@')[0] : 'Investitore',
              plan: 'free' 
          });
          setIsLoading(false);
      }, 1500);
  };

  const handleLogout = () => {
      setUser(null);
  };

  if (user) {
      return (
        <div className="pt-32 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Bentornato, {user.name}</h1>
                        <p className="text-gray-400">Ecco una panoramica del tuo portafoglio immobiliare.</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><LayoutDashboard className="w-24 h-24 text-white" /></div>
                        <div className="text-gray-400 text-sm uppercase tracking-widest mb-2">Terreni Analizzati</div>
                        <div className="text-4xl font-bold text-white font-mono">12</div>
                        <div className="text-green-500 text-xs mt-2 flex items-center gap-1"><ArrowRight className="w-3 h-3 rotate-45" /> +2 questa settimana</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Wallet className="w-24 h-24 text-white" /></div>
                        <div className="text-gray-400 text-sm uppercase tracking-widest mb-2">Valore Stimato</div>
                        <div className="text-4xl font-bold text-white font-mono">€ 450k</div>
                        <div className="text-gray-500 text-xs mt-2">Basato su AI Valuation</div>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group cursor-pointer hover:border-primary-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Settings className="w-24 h-24 text-white" /></div>
                        <div className="text-gray-400 text-sm uppercase tracking-widest mb-2">Piano Attivo</div>
                        <div className="text-4xl font-bold text-primary-500 font-display">FREE</div>
                        <div className="text-white text-xs mt-2 flex items-center gap-1 group-hover:underline">Upgrade to PRO <ArrowRight className="w-3 h-3" /></div>
                    </div>
                </div>

                {/* Recent Activity / Saved Lands */}
                <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /> I tuoi Terreni Salvati</h3>
                        <button className="text-primary-400 text-sm font-bold hover:text-white transition-colors flex items-center gap-1">
                            <PlusCircle className="w-4 h-4" /> Nuova Analisi
                        </button>
                    </div>
                    <div className="divide-y divide-white/5">
                        {[
                            { name: "Uliveto Ostuni", date: "Oggi, 10:23", status: "Ottimo", score: 92 },
                            { name: "Lotto Chianti Classico", date: "Ieri, 18:45", status: "Buono", score: 85 },
                            { name: "Terreno Ind. Bari", date: "12 Mag, 09:15", status: "Medio", score: 74 }
                        ].map((item, i) => (
                            <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center text-gray-400">
                                        <LandPlot className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-primary-400 transition-colors">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.date}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase">AI Score</div>
                                        <div className="font-bold text-white font-mono">{item.score}</div>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-600 -rotate-90" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      );
  }

  return (
    <div className="pt-20 min-h-screen flex">
        {/* LEFT SIDE - VISUAL */}
        <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-60">
                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" className="w-full h-full object-cover" alt="Earth Data" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
            <div className="relative z-10 max-w-lg px-12">
                <Hexagon className="w-12 h-12 text-primary-500 mb-8 animate-pulse" />
                <h2 className="text-5xl font-bold text-white font-display mb-6 leading-tight">
                    "Il futuro dell'immobiliare è nei <span className="text-primary-500">dati</span>, non nei mattoni."
                </h2>
                <p className="text-gray-300 text-lg">Accedi alla suite di analisi territoriale più avanzata d'Europa.</p>
            </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-full lg:w-1/2 bg-[#09090b] flex flex-col justify-center px-8 md:px-20 relative">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">{isLoginMode ? 'Bentornato' : 'Crea Account'}</h2>
                    <p className="text-gray-400">
                        {isLoginMode ? 'Inserisci le tue credenziali per accedere.' : 'Inizia la tua prova gratuita oggi.'}
                    </p>
                </div>

                {/* SOCIAL AUTH */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button className="flex items-center justify-center py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group">
                         <Chrome className="w-5 h-5 text-white group-hover:text-primary-400" />
                    </button>
                    <button className="flex items-center justify-center py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group">
                         <Briefcase className="w-5 h-5 text-white group-hover:text-primary-400" /> {/* Apple fallback icon */}
                    </button>
                    <button className="flex items-center justify-center py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group">
                         <Mail className="w-5 h-5 text-white group-hover:text-primary-400" />
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#09090b] text-gray-500">Oppure continua con email</span></div>
                </div>

                {/* FORM */}
                <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="mario@esempio.it" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {!isLoginMode && (
                        <div className="flex items-start gap-2 text-sm text-gray-400">
                            <input type="checkbox" required className="mt-1 rounded bg-white/10 border-transparent focus:ring-primary-500 text-primary-600" />
                            <span>Accetto i <a href="#" className="text-primary-400 hover:underline">Termini di Servizio</a> e la Privacy Policy.</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLoginMode ? 'Accedi' : 'Crea Account Gratuito')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-400">
                        {isLoginMode ? 'Non hai ancora un account?' : 'Hai già un account?'}
                        <button 
                            onClick={() => setIsLoginMode(!isLoginMode)}
                            className="ml-2 text-primary-400 font-bold hover:text-primary-300 transition-colors"
                        >
                            {isLoginMode ? 'Registrati' : 'Accedi'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchMode, setSearchMode] = useState('buy');

  const handleSearchWidget = (mode: string) => {
      setSearchMode(mode);
      if (mode === 'sell') setCurrentPage('marketplace');
      else setCurrentPage('analysis');
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-primary-500/30">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="animate-fade-in">
        {currentPage === 'home' && (
          <>
            <HeroSection onStartAnalysis={handleSearchWidget} />
            <FeaturedSection />
            <ValuePropositionSection />
          </>
        )}
        {currentPage === 'analysis' && <AnalysisPage initialMode={searchMode} />}
        {currentPage === 'marketplace' && <MarketplacePage />}
        {currentPage === 'blog' && <BlogPage />}
        {currentPage === 'dashboard' && <DashboardPage />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
