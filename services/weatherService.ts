
import type { WeatherData, DailyForecast } from '../types';

// Helper to format date string from API (ISO 8601) to a more readable format
const formatNWSDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch (e) {
    return dateString; // Return original if parsing fails
  }
};


export const fetchWeather = async (stateCodeQuery: string): Promise<WeatherData> => {
  // Extract state code if a more complex query is given, e.g., "Alerts for CA"
  const stateCodeMatch = stateCodeQuery.match(/\b([A-Z]{2})\b/i);
  const stateCode = stateCodeMatch ? stateCodeMatch[1].toUpperCase() : stateCodeQuery.toUpperCase();

  if (!stateCode || stateCode.length !== 2) {
    throw new Error(`Invalid state code: "${stateCode}". Please enter a 2-letter US state code (e.g., CA, TX).`);
  }

  const weatherUrl = `https://api.weather.gov/alerts/active/area/${stateCode}`;
  const headers = {
    'Accept': 'application/geo+json',
    'User-Agent': 'WeatherWiseImpactInvestor/1.0 (contact@example.com)' // Recommended by NWS
  };

  try {
    const response = await fetch(weatherUrl, { headers });
    if (!response.ok) {
      if (response.status === 404) {
         // Potentially means no active alerts, or invalid area, NWS API can be tricky here.
         // For now, treat as no alerts. A more robust solution might check the body for specific NWS error codes.
         console.warn(`NWS API returned ${response.status} for ${stateCode}. Assuming no active alerts or invalid area.`);
         return {
            location: `${stateCode} (No active alerts found or invalid area)`,
            temperature: "N/A",
            condition: "No Active Alerts",
            conditionDescription: "No critical weather alerts reported for this area at this time.",
            precipitationChance: "N/A",
            wind: "N/A",
            humidity: "N/A",
            uvIndex: "N/A",
            extendedForecast: [],
        };
      }
      const errorData = await response.json().catch(() => response.text()); // Try to parse JSON, fallback to text
      throw new Error(`NWS API request failed for ${stateCode}: ${response.statusText}. Details: ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
    }
    const nwsApiData = await response.json();

    if (!nwsApiData.features || nwsApiData.features.length === 0) {
      return {
        location: `${stateCode} (No active alerts)`,
        temperature: "N/A",
        condition: "No Active Alerts",
        conditionDescription: "No critical weather alerts reported for this area at this time.",
        precipitationChance: "N/A",
        wind: "N/A",
        humidity: "N/A",
        uvIndex: "N/A",
        extendedForecast: [],
      };
    }

    const alerts = nwsApiData.features.map((feature: any) => feature.properties);

    // Use the first alert for the "current" condition summary
    const primaryAlert = alerts[0];

    const extendedForecast: DailyForecast[] = alerts.slice(0, 7).map((alert: any) => ({
      day: alert.event || "Unknown Event", // Represents the alert event type
      temp: alert.severity || "Unknown Severity", // Represents alert severity
      condition: alert.headline || "No headline available.", // Alert headline
      // Repurpose precipitationChance to show effective/expires times
      precipitationChance: `Effective: ${formatNWSDate(alert.effective)} to ${formatNWSDate(alert.expires)}`,
      // Add raw description and instruction for Gemini, and potentially for UI expansion
      description: alert.description,
      instruction: alert.instruction,
      areaDesc: alert.areaDesc,
    }));
    
    // Attempt to find the most severe alert for the main display
    const severityOrder = ["Extreme", "Severe", "Moderate", "Minor", "Unknown"];
    const sortedAlerts = [...alerts].sort((a,b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));
    const mostSevereAlert = sortedAlerts[0] || primaryAlert;


    return {
      location: mostSevereAlert.areaDesc ? `${stateCode} - ${mostSevereAlert.areaDesc.split(';')[0].trim()}` : stateCode,
      temperature: "N/A - See Alerts",
      condition: mostSevereAlert.event || "Alert Active",
      conditionDescription: mostSevereAlert.headline || "Refer to active alerts for details.",
      precipitationChance: "See Active Alerts",
      wind: "N/A - See Alerts",
      humidity: "N/A",
      uvIndex: "N/A",
      extendedForecast: extendedForecast,
      // Pass raw alerts if needed by Gemini or for a more detailed UI in future
      rawAlerts: alerts 
    };

  } catch (error) {
    console.error("NWS API error:", error);
    throw new Error(`Failed to fetch weather alerts for "${stateCode}". ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
  }
};
