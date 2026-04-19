import { GoogleGenAI, Type } from "@google/genai";

export interface PatientData {
  age: string;
  sex: string;
  weight: string;
  icuDay: string;
  diagnosis: string;
  infectionSource: string;
  ventilated: string;
  hemodynamics: string;
  mdrRisk: string;
  recentHospitalization: string;
  priorAntibiotics: string;
  priorAntibioticsDetails: string;
  immunocompromised: string;
  indwellingDevices: string;
  travelHistory: string;
  comorbidities: string;
  wbcTrend: string;
  procalcitonin: string;
  lactate: string;
  creatinine: string;
  cultureStatus: string;
  organism: string;
  sensitivity: string;
  selectedAntibiotic?: string;
}

export const analyzeSepsisTherapy = async (data: PatientData, retries = 2): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
    You are a senior infectious disease consultant, ICU physician, and clinical pharmacologist.
    Your role is to evaluate Whether a selected empiric antibiotic regimen is ADEQUATE, BORDERLINE, or INADEQUATE for a patient with sepsis in the ICU, and provide expert pharmacological guidance.

    INPUT DATA:
    Patient: ${data.age}yo ${data.sex}, ${data.weight}kg
    Status: ICU Day ${data.icuDay}, Diagnosis: ${data.diagnosis}, Source: ${data.infectionSource}, Ventilated: ${data.ventilated}, Hemodynamics: ${data.hemodynamics}
    Risk Factors: 
    - MDR Risk: ${data.mdrRisk}
    - Recent Hospitalization: ${data.recentHospitalization}
    - Prior Antibiotics: ${data.priorAntibiotics} (Details: ${data.priorAntibioticsDetails})
    - Immunocompromised: ${data.immunocompromised}
    - Indwelling Devices: ${data.indwellingDevices}
    - Recent Travel: ${data.travelHistory}
    - Comorbidities: ${data.comorbidities}
    Labs: WBC: ${data.wbcTrend}, Procalcitonin: ${data.procalcitonin}, Lactate: ${data.lactate}, Creatinine/eGFR: ${data.creatinine}
    Microbiology: Status: ${data.cultureStatus}, Organism: ${data.organism}, Sensitivity: ${data.sensitivity}
    User Selected Antibiotic: ${data.selectedAntibiotic || "None provided"}

    TASK & OUTPUT REQUIREMENTS:
    1. DECISION: Categorize the user's choice as ADEQUATE, BORDERLINE, or INADEQUATE.
    2. CLINICAL REASONING: Provide a high-impact reasoning (max 120 words).
    3. FAILURE RISK: Quantify risk of treatment failure as a percentage (0–100%).
    4. RISK CONTRIBUTORS: Identify the top 3 specific factors contributing to this risk.
    5. RECOMMENDED REGIMEN: Provide the most appropriate empiric antibiotic regimen with dose and route.
    6. COVERAGE GAPS: Explicitly identify if antipseudomonal, MRSA, or ESBL coverage is missing in the user's selected choice.
    7. PHARMACOLOGY ADVICE: Recommend optimal dosing, infusion strategy (bolus vs extended vs continuous), and renal adjustments for the recommended regimen, with PK/PD target rationale.

    DIFFERENTIAL DIAGNOSIS:
    - Always consider tropical infections (e.g., Malaria, Dengue, Typhoid, Leptospirosis) and Rickettsial infections (e.g., Scrub Typhus) especially if travel history is positive.
    - Recommend specific tests in the rationale if these are suspected.

    RULES:
    - Be clinically conservative. Never recommend under-treatment in ICU.
    - References to SSC 2026 or IDSA 2024 guidelines are mandatory.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empiric_recommendation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  antibiotic: { type: Type.STRING },
                  dose: { type: Type.STRING },
                  alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  coverage: {
                    type: Type.OBJECT,
                    properties: {
                      gram_positive: { type: Type.STRING },
                      gram_negative: { type: Type.STRING },
                      pseudomonas: { type: Type.STRING },
                      mrsa: { type: Type.STRING },
                      anaerobes: { type: Type.STRING },
                      vre: { type: Type.STRING },
                      esbl: { type: Type.STRING },
                      atypicals: { type: Type.STRING },
                      tropical_rickettsial: { type: Type.STRING },
                    }
                  },
                  coverage_details: {
                    type: Type.OBJECT,
                    properties: {
                      gram_positive: { type: Type.STRING },
                      gram_negative: { type: Type.STRING },
                      pseudomonas: { type: Type.STRING },
                      mrsa: { type: Type.STRING },
                      anaerobes: { type: Type.STRING },
                      vre: { type: Type.STRING },
                      esbl: { type: Type.STRING },
                      atypicals: { type: Type.STRING },
                      tropical_rickettsial: { type: Type.STRING },
                    }
                  },
                  pathogen_details: {
                    type: Type.OBJECT,
                    properties: {
                      gram_positive: { type: Type.ARRAY, items: { type: Type.STRING } },
                      gram_negative: { type: Type.ARRAY, items: { type: Type.STRING } },
                      pseudomonas: { type: Type.ARRAY, items: { type: Type.STRING } },
                      mrsa: { type: Type.ARRAY, items: { type: Type.STRING } },
                      anaerobes: { type: Type.ARRAY, items: { type: Type.STRING } },
                      vre: { type: Type.ARRAY, items: { type: Type.STRING } },
                      esbl: { type: Type.ARRAY, items: { type: Type.STRING } },
                      atypicals: { type: Type.ARRAY, items: { type: Type.STRING } },
                      tropical_rickettsial: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                  }
                }
              }
            },
            coverage_summary: {
              type: Type.OBJECT,
              properties: {
                gram_positive: { type: Type.STRING },
                gram_negative: { type: Type.STRING },
                pseudomonas: { type: Type.STRING },
                mrsa: { type: Type.STRING },
                anaerobes: { type: Type.STRING },
                vre: { type: Type.STRING },
                esbl: { type: Type.STRING },
                atypicals: { type: Type.STRING },
                tropical_rickettsial: { type: Type.STRING },
              }
            },
            coverage_summary_details: {
              type: Type.OBJECT,
              properties: {
                gram_positive: { type: Type.STRING },
                gram_negative: { type: Type.STRING },
                pseudomonas: { type: Type.STRING },
                mrsa: { type: Type.STRING },
                anaerobes: { type: Type.STRING },
                vre: { type: Type.STRING },
                esbl: { type: Type.STRING },
                atypicals: { type: Type.STRING },
                tropical_rickettsial: { type: Type.STRING },
              }
            },
            pathogen_summary_details: {
              type: Type.OBJECT,
              properties: {
                gram_positive: { type: Type.ARRAY, items: { type: Type.STRING } },
                gram_negative: { type: Type.ARRAY, items: { type: Type.STRING } },
                pseudomonas: { type: Type.ARRAY, items: { type: Type.STRING } },
                mrsa: { type: Type.ARRAY, items: { type: Type.STRING } },
                anaerobes: { type: Type.ARRAY, items: { type: Type.STRING } },
                vre: { type: Type.ARRAY, items: { type: Type.STRING } },
                esbl: { type: Type.ARRAY, items: { type: Type.STRING } },
                atypicals: { type: Type.ARRAY, items: { type: Type.STRING } },
                tropical_rickettsial: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
            },
            why_this_antibiotic: { type: Type.ARRAY, items: { type: Type.STRING } },
            user_antibiotic_assessment: {
              type: Type.OBJECT,
              properties: {
                selected_antibiotic: { type: Type.STRING },
                decision: { type: Type.STRING },
                risk_of_failure: { type: Type.STRING },
                failure_risk_percentage: { type: Type.NUMBER },
                key_reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommended_regimen: { type: Type.STRING },
                coverage_gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                clinical_reasoning: { type: Type.STRING },
                suggested_alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                rationale: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
            },
            deescalation_advice: { type: Type.STRING },
            dose_adjustment: {
              type: Type.OBJECT,
              properties: {
                renal: { type: Type.STRING },
                warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
            },
            pharmacology_analysis: {
              type: Type.OBJECT,
              properties: {
                recommended_dose: { type: Type.STRING },
                infusion_strategy: { type: Type.STRING },
                renal_adjustment: { type: Type.STRING },
                pk_pd_rationale: { type: Type.STRING },
              }
            },
            summary: { type: Type.STRING }
          }
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    if (retries > 0) {
      console.warn(`Gemini API RPC error, retrying... (${retries} attempts left)`, error);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return analyzeSepsisTherapy(data, retries - 1);
    }
    throw error;
  }
};
