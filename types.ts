export enum LandType {
  AGRICULTURAL = 'Agricolo',
  BUILDABLE = 'Edificabile',
  INDUSTRIAL = 'Industriale',
  FOREST = 'Boschivo'
}

export interface LandListing {
  id: string;
  title: string;
  price: number;
  sizeSqm: number;
  type: LandType;
  location: string;
  imageUrl: string;
  description: string;
  aiScore: number; // 0-100
  features: string[];
  isPremium?: boolean;
}

export interface DetailedAnalysisData {
  morphology: {
    elevation: number;
    slope: number;
    exposure: string;
    terrainType: string;
  };
  solar: {
    irradiance: number; // kWh/m2
    sunHours: number;
    pvPotential: 'Basso' | 'Medio' | 'Alto' | 'Eccellente';
    shadingLoss: number; // %
  };
  wind: {
    speedAvg: number; // m/s
    directionDominant: string;
    gustPeak: number;
  };
  geology: {
    soilType: string;
    permeability: 'Bassa' | 'Media' | 'Alta';
    loadBearing: string; // kg/cm2
    clcClass: string; // Corine Land Cover
  };
  risks: {
    seismicZone: '1' | '2' | '3' | '4';
    floodHazard: 'P1' | 'P2' | 'P3' | 'Assente';
    landslideRisk: 'R1' | 'R2' | 'R3' | 'R4' | 'Assente';
  };
  context: {
    urbanDensity: string;
    nearestRoad: number; // meters
    noiseLevel: number; // dB
    accessQuality: number; // 1-10
  };
}

export interface AnalysisReport {
  id: string;
  address: string;
  coordinates: { lat: number; lng: number };
  scores: {
    agriculture: number;
    construction: number;
    solar: number;
    environmental: number;
    total: number;
  };
  data: DetailedAnalysisData;
  aiSummary: string;
  recommendations: string[];
  generatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  imageUrl: string;
  date: string;
}