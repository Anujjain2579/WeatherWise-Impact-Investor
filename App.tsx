
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { WeatherCard } from './components/WeatherCard';
import { InsightCard } from './components/InsightCard';
import { AffectedPowerPlantsCard } from './components/AffectedPowerPlantsCard'; // New import
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import type { WeatherData, PowerPlantFeature } from './types';
import { fetchWeather } from './services/weatherService';
import { getInvestmentInsights } from './services/geminiService';
import { fetchPowerPlants, FetchPowerPlantsResult } from './services/powerPlantService';
import { APP_NAME } from './constants';

interface ParsedAffectedPlantsResult {
  plants: PowerPlantFeature[];
  fallbackText: string | null;
  reasoning: { [key: string]: string }; // Store reasoning per plant
}

// Utility function to parse affected plants from Gemini response
const parseAffectedPlantsFromGeminiResponse = (
  geminiText: string,
  allPowerPlants: PowerPlantFeature[] | null
): ParsedAffectedPlantsResult => {
  const result: ParsedAffectedPlantsResult = { plants: [], fallbackText: null, reasoning: {} };
  if (!geminiText) return result;

  const sectionHeader = "### Top 3 Affected Power Plants:";
  const sectionIndex = geminiText.indexOf(sectionHeader);

  if (sectionIndex === -1) {
    return result; // Section not found
  }

  const followingText = geminiText.substring(sectionIndex + sectionHeader.length).trim();
  const nextSectionIndex = followingText.indexOf("\n### "); // Find start of next potential ### section
  
  const sectionText = (nextSectionIndex !== -1 ? followingText.substring(0, nextSectionIndex) : followingText).trim();
  result.fallbackText = sectionText;


  if (sectionText.toLowerCase().includes("no specific power plants identified")) {
    result.fallbackText = "AI analysis indicates no specific power plants from the provided list are at significantly elevated risk based on current alerts.";
    return result;
  }

  if (!allPowerPlants || allPowerPlants.length === 0) {
    // If we have text about plants but no local data to match, keep fallbackText.
    return result;
  }

  const plantEntries = sectionText.split('\n').map(s => s.trim()).filter(s => s.startsWith("- Utility Name:"));

  plantEntries.forEach(entry => {
    // Regex to capture Utility Name, Primary Source, and Reason
    // Example: "- Utility Name: Some Utility, Primary Source: Solar - Reason: Hail risk"
    const plantRegex = /- Utility Name: (.*?),\s*Primary Source: (.*?)\s*-\s*Reason: (.*)/;
    const match = entry.match(plantRegex);

    if (match && match.length === 4) {
      const utilityName = match[1].trim();
      const primarySource = match[2].trim();
      const reason = match[3].trim();

      // Find in allPowerPlants (case-insensitive and partial match for utility name)
      const foundPlant = allPowerPlants.find(p =>
        p.attributes.Utility_Name.toLowerCase().includes(utilityName.toLowerCase()) &&
        p.attributes.PrimSource.toLowerCase() === primarySource.toLowerCase()
      );

      if (foundPlant && !result.plants.some(p => p.attributes.Utility_Name === foundPlant.attributes.Utility_Name && p.attributes.PrimSource === foundPlant.attributes.PrimSource) ) {
         // Avoid duplicates if Gemini lists same plant multiple times somehow
        result.plants.push(foundPlant);
        result.reasoning[`${foundPlant.attributes.Utility_Name}_${foundPlant.attributes.PrimSource}`] = reason;
      }
    }
  });
  
  // If parsing resulted in identified plants, clear generic fallback if it's just a list.
  // But if fallbackText IS "no specific plants identified...", keep it.
  if (result.plants.length > 0 && result.fallbackText && !result.fallbackText.toLowerCase().includes("no specific power plants identified")) {
      // Check if fallback text is essentially just the list we parsed.
      // This is a heuristic. If it's more verbose, we might still want to show it or parts of it.
      // For now, if we successfully parse plants, we prioritize showing the structured data.
      // We can refine this to show specific reasons alongside parsed plants.
  }


  return result;
};


const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [powerPlantsData, setPowerPlantsData] = useState<PowerPlantFeature[] | null>(null);
  const [powerPlantsLimitExceeded, setPowerPlantsLimitExceeded] = useState<boolean>(false);
  const [investmentInsightText, setInvestmentInsightText] = useState<string | null>(null); // Full text from Gemini
  const [identifiedAffectedPlants, setIdentifiedAffectedPlants] = useState<PowerPlantFeature[]>([]); // Parsed plants
  const [affectedPlantsFallbackText, setAffectedPlantsFallbackText] = useState<string | null>(null); // Raw text for affected plants section
  const [affectedPlantsReasoning, setAffectedPlantsReasoning] = useState<{ [key: string]: string }>({}); // Reasoning for each plant

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError("Please enter a US State Code (e.g., CA, NY) to check for NWS alerts.");
      return;
    }
    const stateCodeMatch = query.match(/\b([A-Z]{2})\b/i);
    if (!stateCodeMatch && query.trim().length !== 2) {
        setError("Invalid input. Please enter a 2-letter US State Code (e.g., CA, TX) or a query like 'Alerts for CA'.");
        return;
    }

    setUserInput(query);
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setInvestmentInsightText(null);
    setPowerPlantsData(null);
    setPowerPlantsLimitExceeded(false);
    setIdentifiedAffectedPlants([]);
    setAffectedPlantsFallbackText(null);
    setAffectedPlantsReasoning({});

    let fetchedWeather: WeatherData | null = null;
    let fetchedPowerPlantsResult: FetchPowerPlantsResult | null = null;

    try {
      fetchedWeather = await fetchWeather(query);
      setWeatherData(fetchedWeather);

      try {
        fetchedPowerPlantsResult = await fetchPowerPlants();
        setPowerPlantsData(fetchedPowerPlantsResult.plants);
        setPowerPlantsLimitExceeded(fetchedPowerPlantsResult.exceededTransferLimit);
      } catch (powerPlantError) {
        console.error("Power Plant service error:", powerPlantError);
        const plantErrorMessage = `Failed to retrieve power plant data. Insights will be generated without it. ${powerPlantError instanceof Error ? powerPlantError.message : String(powerPlantError)}`;
        setError(prevError => prevError ? `${prevError}\n${plantErrorMessage}` : plantErrorMessage);
      }

      if (fetchedWeather && (fetchedWeather.extendedForecast.length > 0 || fetchedWeather.condition === "No Active Alerts" || fetchedWeather.condition !== "")) {
        try {
          const fullInsightText = await getInvestmentInsights(
            query,
            fetchedWeather,
            fetchedPowerPlantsResult?.plants || null,
            fetchedPowerPlantsResult?.exceededTransferLimit || false
          );
          setInvestmentInsightText(fullInsightText);

          if (fullInsightText) {
            const { plants, fallbackText: parsedFallbackText, reasoning } = parseAffectedPlantsFromGeminiResponse(
              fullInsightText,
              fetchedPowerPlantsResult?.plants || null
            );
            setIdentifiedAffectedPlants(plants);
            setAffectedPlantsFallbackText(parsedFallbackText);
            setAffectedPlantsReasoning(reasoning);
          }

        } catch (geminiError) {
          console.error("Gemini API error:", geminiError);
          setError(prevError => {
            const geminiErrorMessage = `Failed to retrieve investment insights. ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`;
            return prevError ? `${prevError}\n${geminiErrorMessage}` : geminiErrorMessage;
          });
          setInvestmentInsightText(null);
        }
      } else if (!fetchedWeather) {
         setError(prevError => {
           const weatherErrorMessage = "Received no weather data to analyze.";
           return prevError ? `${prevError}\n${weatherErrorMessage}` : weatherErrorMessage;
         });
      }

    } catch (weatherError) {
      console.error("Weather service error:", weatherError);
      setError(`Failed to retrieve NWS alerts. ${weatherError instanceof Error ? weatherError.message : String(weatherError)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-red-800 to-rose-700 text-slate-100">
      <Header appName={APP_NAME} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-lg mb-6 text-red-200">
            Enter a 2-letter US State Code (e.g., CA, TX, NY) to analyze potential impacts based on active NWS weather alerts and relevant power infrastructure.
          </p>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
          
          {powerPlantsLimitExceeded && !isLoading && (
            <p className="text-center text-xs text-amber-300 mt-2 mb-2 bg-slate-800/50 p-2 rounded-md">
              Note: The power plant dataset is extensive. Analysis is based on a representative sample due to data transfer limits.
            </p>
          )}

          {isLoading && (
            <div className="mt-8 flex flex-col items-center">
              <LoadingSpinner />
              <p className="mt-2 text-red-300">Fetching NWS Alerts, Power Plant Data & Analyzing, please wait...</p>
            </div>
          )}

          {!isLoading && weatherData && (
            <div className="mt-8 grid gap-6 md:grid-cols-1">
              <WeatherCard weatherData={weatherData} />
            </div>
          )}
          
          {!isLoading && (identifiedAffectedPlants.length > 0 || (affectedPlantsFallbackText && !affectedPlantsFallbackText.toLowerCase().includes("no specific power plants identified"))) && (
             <div className="mt-8">
                <AffectedPowerPlantsCard 
                    plants={identifiedAffectedPlants} 
                    fallbackText={affectedPlantsFallbackText}
                    reasoning={affectedPlantsReasoning} 
                />
            </div>
          )}

          {!isLoading && investmentInsightText && (
            <div className="mt-8">
                 <InsightCard insight={investmentInsightText} />
            </div>
          )}
          
          {!isLoading && !weatherData && !error && !investmentInsightText && (
            <div className="mt-12 text-center">
              <div className="bg-red-700/50 p-8 rounded-lg shadow-xl border border-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-red-300 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <h2 className="text-2xl font-semibold text-red-100 mb-2">Welcome to {APP_NAME}</h2>
                <p className="text-red-200">
                  Leverage AI-powered analysis of NWS weather alerts for smarter impact investments.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
