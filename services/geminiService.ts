
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import type { WeatherData, DailyForecast, PowerPlantFeature } from "../types"; // Added PowerPlantFeature

const API_KEY = "AIzaSyCAzMhxHxTiTE4N-93XHEQ9htohdSLV6BQ";

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

// Helper to format a single alert for the prompt
const formatAlertForPrompt = (alert: any): string => {
  const headline = alert.headline || (alert.condition && alert.condition.length > 20 ? alert.condition : `Event: ${alert.day || alert.event}, Severity: ${alert.temp || alert.severity}`);
  const description = alert.description || "No detailed description provided in summary.";
  const instruction = alert.instruction || "No specific instruction provided in summary.";
  const timing = alert.precipitationChance || `Effective: ${alert.effective} to ${alert.expires}`;

  return `
  ---
  Alert Event: ${alert.day || alert.event}
  Severity: ${alert.temp || alert.severity}
  Headline: ${headline}
  Affected Areas: ${alert.areaDesc || 'Not specified in summary'}
  Timing: ${timing}
  Description: ${description.substring(0, 250)}${description.length > 250 ? '...' : ''}
  Instruction: ${instruction.substring(0, 200)}${instruction.length > 200 ? '...' : ''}
  ---
  `;
};

// Helper to format a single power plant for the prompt
const formatPowerPlantForPrompt = (plant: PowerPlantFeature): string => {
  const attrs = plant.attributes;
  return `
  - Plant/Utility: ${attrs.Utility_Name || 'N/A'}
    Primary Source: ${attrs.PrimSource || 'N/A'}
    State: ${attrs.State || 'N/A'}
    Capacity: ${attrs.Total_MW !== null && attrs.Total_MW !== undefined ? attrs.Total_MW.toFixed(1) : 'N/A'} MW
    Approx. Location (Lat/Lon): ${attrs.Latitude?.toFixed(3)}, ${attrs.Longitude?.toFixed(3)}
`;
};

export const getInvestmentInsights = async (
  userQuery: string,
  weatherReport: WeatherData,
  powerPlants: PowerPlantFeature[] | null,
  powerPlantsLimitExceeded: boolean
): Promise<string> => { // Returns the full text from Gemini
  if (!API_KEY) {
     return Promise.reject(new Error("Gemini API Key is not configured. Please set the API_KEY environment variable."));
  }
  
  const model = GEMINI_MODEL_NAME;

  const systemInstruction = `You are an expert AI financial advisor specializing in impact investing. Your analysis focuses on how **active National Weather Service (NWS) alerts (warnings, advisories, watches)** affect various sectors (e.g., agriculture, renewable energy, infrastructure, supply chains, insurance, public safety, utilities). Provide actionable insights, potential risks, and specific considerations for impact investors based on these *active alerts* and relevant power infrastructure. Emphasize immediate to short-term impacts, resilience, safety, and long-term positive impact alignment. Structure your response clearly. Be concise yet comprehensive. Ensure all requested points are addressed.`;
  
  let alertsSummary = "No specific alert details available in summary.";
  if (weatherReport.extendedForecast && weatherReport.extendedForecast.length > 0) {
    alertsSummary = weatherReport.extendedForecast.map(alert => formatAlertForPrompt(alert)).join('\n');
  } else if (weatherReport.condition !== "No Active Alerts") {
    alertsSummary = `Primary Alert Condition: ${weatherReport.condition}\nDescription: ${weatherReport.conditionDescription}`;
  }

  const weatherContext = `
Location (State/Area): ${weatherReport.location}
Overall Alert Status: ${weatherReport.conditionDescription} (This is typically the headline of the most significant or first alert)

Active NWS Alerts Summary:
${alertsSummary}
  `;

  let powerPlantsSummary = "No power plant data was provided or successfully retrieved for this analysis.";
  if (powerPlants && powerPlants.length > 0) {
    const sortedPlants = [...powerPlants]
      .filter(p => p.attributes.Total_MW !== null && p.attributes.Total_MW !== undefined) 
      .sort((a, b) => (b.attributes.Total_MW!) - (a.attributes.Total_MW!)); 

    const sampledPlants = sortedPlants.slice(0, 20); // Provide a slightly larger sample to AI if available

    powerPlantsSummary = `Here is a sample of power plants. Assume these are relevant if they operate within the queried state/area **(${weatherReport.location.split('-')[0].trim()})**. Consider their potential impact from NWS alerts:`;
    powerPlantsSummary += sampledPlants.map(formatPowerPlantForPrompt).join('');
    if (powerPlantsLimitExceeded) {
        powerPlantsSummary += "\n (Note: This power plant list is a sample from a larger dataset where data transfer limits were met.)";
    } else if (powerPlants.length > sampledPlants.length) {
        powerPlantsSummary += `\n (Note: Displaying a sample of ${sampledPlants.length} out of ${powerPlants.length} retrieved plants, prioritizing larger capacities.)`;
    } else if (powerPlants.length > 0) {
        powerPlantsSummary += `\n (Displaying all ${powerPlants.length} retrieved plants.)`;
    }
  }

  const prompt = `
User's Area of Interest/Investment Query: "${userQuery}"
Queried State/Region: ${weatherReport.location.split('-')[0].trim()}

Based on this area of interest, the provided **summary of active National Weather Service (NWS) alerts**, and relevant **power infrastructure information**, generate an impact investment analysis.
Focus your analysis on the implications of these *specific, active alerts* and their potential effects on local power generation and utilities.

NWS Alerts Context:
${weatherContext}

Power Infrastructure Context:
${powerPlantsSummary}

When analyzing power infrastructure, consider:
- How might different primary energy sources (e.g., solar, wind, hydroelectric, petroleum, natural gas) of the listed plants be vulnerable or resilient to the specific types of NWS alerts active (e.g., 'High Wind Warning' for wind/solar, 'Flood Watch' for hydroelectric, extreme cold for gas pipelines)?
- Identify if any **large capacity plants (e.g., > 100 MW Total_MW)** from the list appear to be in or near severely alerted zones. What are the potential consequences for energy supply and the utility operators?
- What are the investment implications (opportunities or risks) related to grid stability, repair services, or demand for resilient energy solutions in light of these potential impacts?

Your analysis should highlight in 2-3 lines each:
1.  **Immediate Investment Opportunities & Needs**: Sectors/services critical due to active alerts. Specifically mention any related to power grid stability, emergency power, or repair services for energy infrastructure if relevant.
2.  **Potential Risks & Urgent Mitigation**: Weather-related risks from alerts. Detail risks to energy infrastructure (generation, transmission) and utility operations, and suggest mitigation investment themes.
3.  **Sector-Specific Impacts**: How active alerts affect the user's area of interest, explicitly including impacts on or from the energy sector.
4.  **Short-Term Resilience & Preparedness**: Investments supporting community/business resilience. Highlight energy resilience, backup power, or microgrid opportunities if applicable.
5.  **Investor Actions**: Immediate actions based on alerts. Consider re-evaluating holdings in utilities potentially affected or identifying companies providing critical response/repair for energy systems.
6.  **Overall Outlook Based on Alerts**: Investment climate summary given NWS alerts, factoring in potential energy sector vulnerabilities and opportunities for the specified area and user query.
7.  **3 Stocks to Watch **: Identify three stocks (from sectors like energy, utilities, commodities, industrials, insurance) that are most likely to be significantly impacted (positively or negatively) by the active NWS extreme weather events, especially considering their potential effects on local power infrastructure. **If NWS alerts are severe and large power plants could be affected, ensure your stock choices reflect these specific, high-impact scenarios.** If there are no active alerts, suggest stocks that might benefit from stable conditions or are leaders in resilient infrastructure or renewable energy development.
8.  **Top 3 Affected Power Plants:** From the 'Power Infrastructure Context' provided earlier, specifically identify the top 3 power plants you assess are most likely to be significantly impacted by the active NWS alerts. For each plant, list its **Utility Name** and **Primary Source** as found in the data. Then, very briefly explain the primary reason for its potential vulnerability. Format each entry clearly, for example: " - Utility Name: [Exact Utility Name from data], Primary Source: [Exact Primary Source from data] - Reason: [Brief explanation]". If no specific plants from the list are deemed significantly at risk, clearly state "No specific power plants identified as significantly at risk based on current alerts and provided data." Present this information directly under a heading: "### Top 3 Affected Power Plants:"

Present your analysis in a clear, structured format. Use markdown for headings (e.g., "### 1. Immediate Investment Opportunities & Needs"). Ensure a line of gap between each main analysis point. Do not use asterisks in the text output unless part of a company name or ticker.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.65, 
            topK: 40,
            topP: 0.95,
        }
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("Received an empty response from Gemini API.");
    }
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key not valid") || error.message.toLowerCase().includes("permission denied")) {
            throw new Error("Gemini API request failed: Invalid API Key or insufficient permissions. Please check your API_KEY environment variable and Gemini project settings.");
        }
         throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching insights from Gemini API.");
  }
};
