
import React from 'react';
import type { PowerPlantFeature } from '../types';

interface AffectedPowerPlantsCardProps {
  plants: PowerPlantFeature[];
  fallbackText: string | null;
  reasoning: { [key: string]: string }; // Key: UtilityName_PrimSource
}

export const AffectedPowerPlantsCard: React.FC<AffectedPowerPlantsCardProps> = ({ plants, fallbackText, reasoning }) => {
  const hasIdentifiedPlants = plants && plants.length > 0;
  const showFallback = !hasIdentifiedPlants && fallbackText && !fallbackText.toLowerCase().includes("no specific power plants identified as significantly at risk");
  const showNoRiskMessage = fallbackText && fallbackText.toLowerCase().includes("no specific power plants identified as significantly at risk");


  if (!hasIdentifiedPlants && !showFallback && !showNoRiskMessage) {
    return null; // Don't render if nothing to show or if AI explicitly says no specific plants
  }

  return (
    <div className="bg-amber-800/70 shadow-xl rounded-xl p-6 backdrop-blur-sm border border-amber-600">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-3 text-amber-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83M11.42 15.17A3 3 0 0 1 6.344 12.7A3 3 0 0 1 9.343 7.66m0 0H3M7.66 9.344A3 3 0 0 1 12.7 6.344 3 3 0 0 1 17.66 9.344m0 0L21 3M2.98 16.02A3 3 0 0 1 6.02 13.04m0 0L2.98 16.02m3.04-2.98A3 3 0 0 0 9.02 13.04m0 0L6.02 16.02m6.04-2.98A3 3 0 0 1 15.02 13.04m0 0L12.02 16.02m3-2.98A3 3 0 0 0 18.02 13.04m0 0L15.02 16.02m2.98-2.98L21 12m-2.98 4.02A3 3 0 0 1 18.02 19.04m0 0L21 16.02m-2.98 2.98A3 3 0 0 0 15.02 19.04m0 0L12.02 16.02m-2.98 2.98A3 3 0 0 1 6.02 19.04m0 0L3 16.02m2.98 2.98A3 3 0 0 0 9.02 19.04m0 0L6.02 16.02" />
        </svg>
        AI Assessed: Potentially Affected Power Plants
      </h2>

      {hasIdentifiedPlants && (
        <div className="space-y-4">
          {plants.map((plant, index) => {
            const plantKey = `${plant.attributes.Utility_Name}_${plant.attributes.PrimSource}`;
            const plantReason = reasoning[plantKey];
            return (
              <div key={index} className="bg-slate-700/50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-amber-200">{plant.attributes.Utility_Name}</h3>
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Primary Source:</span> {plant.attributes.PrimSource}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Capacity:</span> {plant.attributes.Total_MW !== null ? `${plant.attributes.Total_MW.toFixed(1)} MW` : 'N/A'}
                </p>
                {plantReason && (
                   <p className="text-sm text-amber-300 mt-1 italic">
                     <span className="font-medium">AI's Assessed Vulnerability:</span> {plantReason}
                   </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showFallback && (
        <div className="prose prose-sm prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed mt-4">
          <p className="text-amber-200 font-semibold mb-2">AI's assessment on affected power plants (raw text):</p>
          <p>{fallbackText}</p>
          <p className="text-xs mt-2 text-slate-400">
            (Displayed as raw text. Could not fully match all mentioned plants to the local dataset, or the AI provided a general statement.)
          </p>
        </div>
      )}
      
      {showNoRiskMessage && !hasIdentifiedPlants && (
         <div className="prose prose-sm prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed mt-4">
          <p>{fallbackText}</p>
        </div>
      )}

    </div>
  );
};
