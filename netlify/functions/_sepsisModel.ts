// Server-side Gemini call for /app (runs only inside the Netlify function, so the API key never reaches the browser).
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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  // Anything the clinician did not answer is sent as "Not assessed", never as a negative.
  const v = (x?: string) => (x && x.trim() ? x.trim() : 'Not assessed');
  const prompt = `
    You support an ICU doctor choosing empiric antibiotics for sepsis. Your output is shown to the doctor as an
    AI-generated suggestion that they must check; it is not a consultant opinion.
    Evaluate whether the doctor's proposed regimen (if any) is ADEQUATE, BORDERLINE, or INADEQUATE, recommend an
    empiric regimen, and give pharmacological guidance.

    INPUT DATA ("Not assessed" means the doctor did not answer: do not treat it as absent; say how it changes the plan):
    Patient: age ${v(data.age)} years, sex ${v(data.sex)}, weight ${v(data.weight)} kg
    Status: ICU day ${v(data.icuDay)}, diagnosis ${v(data.diagnosis)}, source ${v(data.infectionSource)}, mechanically ventilated: ${v(data.ventilated)}, hemodynamics ${v(data.hemodynamics)}
    Risk factors:
    - MDR risk: ${v(data.mdrRisk)}
    - Hospitalised in last 90 days: ${v(data.recentHospitalization)}
    - Broad-spectrum antibiotics in last 30 days: ${v(data.priorAntibiotics)}${data.priorAntibioticsDetails ? ` (${data.priorAntibioticsDetails})` : ''}
    - Immunocompromised: ${v(data.immunocompromised)}
    - Indwelling devices: ${v(data.indwellingDevices)}
    - Travel to high-resistance areas: ${v(data.travelHistory)}
    - Comorbidities: ${v(data.comorbidities)}
    Labs: WBC trend ${v(data.wbcTrend)}, procalcitonin ${v(data.procalcitonin)}, lactate ${v(data.lactate)}, creatinine ${v(data.creatinine)}
    Microbiology: cultures ${v(data.cultureStatus)}, organism ${v(data.organism)}, sensitivities ${v(data.sensitivity)}
    Doctor's proposed regimen: ${data.selectedAntibiotic || 'None provided'}

    TASK & OUTPUT REQUIREMENTS:
    1. DECISION: Categorize the doctor's proposed regimen as ADEQUATE, BORDERLINE, or INADEQUATE (only if one was given).
    2. CLINICAL REASONING: max 120 words.
    3. RISK OF FAILURE: a word (Low, Moderate, High). Do not invent a percentage.
    4. RISK CONTRIBUTORS: the top 3 specific factors.
    5. RECOMMENDED REGIMEN: the most appropriate empiric regimen with dose and route.
    6. COVERAGE GAPS: say if antipseudomonal, MRSA or ESBL cover is missing from the proposed regimen.
    7. COVERAGE NEEDED: for each pathogen category, "Yes" if this patient's source and risk factors need it covered, otherwise "No".
    8. PHARMACOLOGY: dosing, infusion strategy (bolus, extended or continuous) and renal adjustment, with the PK/PD rationale.
    9. SOURCES: for each recommendation and in "sources", cite the guideline the statement rests on: name, year,
       and the section or recommendation. Use only real guidance you are confident exists (for example the Surviving
       Sepsis Campaign 2021 guidelines, IDSA 2024 guidance on antimicrobial-resistant Gram-negative infections,
       ATS/IDSA 2019 community-acquired pneumonia guideline). Never invent a guideline, year or section; leave the
       citation empty if unsure.

    DIFFERENTIAL DIAGNOSIS:
    - Consider tropical infections (malaria, dengue, typhoid, leptospirosis) and rickettsial infections (scrub typhus),
      especially with positive travel history, and recommend specific tests in the rationale if suspected.

    RULES:
    - Be clinically conservative; never recommend under-treatment in the ICU, and do not add cover the patient does not need.
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
                  citation: { type: Type.OBJECT, properties: { guideline: { type: Type.STRING }, year: { type: Type.STRING }, section: { type: Type.STRING } } },
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
            coverage_needed: { type: Type.OBJECT, properties: { gram_positive: { type: Type.STRING }, pseudomonas: { type: Type.STRING }, mrsa: { type: Type.STRING }, anaerobes: { type: Type.STRING }, vre: { type: Type.STRING }, esbl: { type: Type.STRING }, atypicals: { type: Type.STRING }, tropical_rickettsial: { type: Type.STRING }, gram_negative: { type: Type.STRING } } },
            sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { guideline: { type: Type.STRING }, year: { type: Type.STRING }, section: { type: Type.STRING }, statement: { type: Type.STRING } } } },
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
