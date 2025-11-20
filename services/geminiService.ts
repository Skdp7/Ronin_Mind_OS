
import { GoogleGenAI } from "@google/genai";
import { DetailedAnalysisData } from "../types";

export const generateLandAnalysisSummary = async (address: string, data: DetailedAnalysisData): Promise<{ summary: string; recommendations: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Agisci come un sistema AI avanzato per l'analisi territoriale (terreninvendita.ai).
      Analizza i seguenti dati tecnici per un terreno situato a "${address}".
      
      DATI TECNICI:
      - Morfologia: Pendenza ${data.morphology.slope}%, Esposizione ${data.morphology.exposure}, Altitudine ${data.morphology.elevation}m
      - Geologia: Suolo ${data.geology.soilType}, Permeabilità ${data.geology.permeability}, CLC ${data.geology.clcClass}
      - Solare: Irraggiamento ${data.solar.irradiance} kWh/m2, Potenziale ${data.solar.pvPotential}
      - Rischi: Sismico Zona ${data.risks.seismicZone}, Idrogeologico ${data.risks.landslideRisk}
      
      TASK 1: Genera una "Sintesi Tecnica" (max 80 parole). Usa un linguaggio scientifico, preciso e futuristico. Evidenzia la vocazione principale del terreno.
      TASK 2: Genera 3 "Raccomandazioni Strategiche" brevi (max 10 parole ciascuna) per valorizzare il terreno.

      Rispondi ESCLUSIVAMENTE in formato JSON valido:
      {
        "summary": "testo sintesi...",
        "recommendations": ["racc 1", "racc 2", "racc 3"]
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini API Error (using fallback):", error);
    return {
        summary: `Analisi completata per l'area di ${address}. La morfologia rilevata (${data.morphology.elevation}m slm, pendenza ${data.morphology.slope}%) suggerisce una vocazione mista. L'irraggiamento solare è favorevole per installazioni agrivoltaiche. I parametri idrogeologici rientrano nella norma, ma si consiglia verifica puntuale dei vincoli paesaggistici. (Demo Mode: Aggiungi VITE_API_KEY su Vercel per analisi AI reale)`,
        recommendations: ["Verificare indici edificabilità", "Valutare impianto Agri-voltaico", "Analisi geologica approfondita"]
    };
  }
};

export const generateListingDescription = async (features: string[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    const prompt = `
      Scrivi una descrizione accattivante per un annuncio di vendita terreno su 'terreninvendita.ai'.
      Caratteristiche: ${features.join(', ')}.
      Usa uno stile persuasivo, moderno ed elegante. Max 100 parole.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Descrizione generata automaticamente.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Opportunità unica. Terreno con caratteristiche eccellenti, ideale per investimento o sviluppo progetto. Posizione strategica e alto potenziale di valorizzazione.";
  }
};
