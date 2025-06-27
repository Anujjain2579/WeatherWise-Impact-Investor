
import type { PowerPlantFeature, PowerPlantAPIResponse } from '../types';

const POWER_PLANT_API_URL = "https://services7.arcgis.com/FGr1D95XCGALKXqM/arcgis/rest/services/Power_Plants_Testing/FeatureServer/0/query?where=1%3D1&outFields=Longitude,Latitude,Total_MW,Utility_Name,PrimSource,State&outSR=4326&f=json";

export interface FetchPowerPlantsResult {
  plants: PowerPlantFeature[];
  exceededTransferLimit: boolean;
}

export const fetchPowerPlants = async (): Promise<FetchPowerPlantsResult> => {
  try {
    const response = await fetch(POWER_PLANT_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      let errorDetails = response.statusText;
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData.error?.message || errorData);
      } catch (e) {
        // If parsing error data fails, stick with statusText
      }
      throw new Error(`Power Plant API request failed: ${response.status}. Details: ${errorDetails}`);
    }
    const data: PowerPlantAPIResponse = await response.json();
    return {
      plants: data.features || [],
      exceededTransferLimit: !!data.exceededTransferLimit,
    };
  } catch (error) {
    console.error("Power Plant API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching power plant data.';
    // Re-throw to be caught by the calling function in App.tsx
    throw new Error(errorMessage);
  }
};
