
export interface DailyForecast {
  day: string; // For NWS, this will be the alert Event (e.g., "Flood Watch")
  temp: string; // For NWS, this will be the alert Severity (e.g., "Moderate")
  condition: string; // For NWS, this will be a short description or headline
  precipitationChance?: string; // For NWS, can be repurposed for effective/expires times or other key info
  description?: string; // Full NWS alert description
  instruction?: string; // NWS alert instruction
  areaDesc?: string; // NWS alert area description
}

export interface WeatherData {
  location: string;
  temperature: string; // Will often be "N/A - See Alerts"
  condition: string; // Primary alert event or "No Active Alerts"
  conditionDescription?: string; // Primary alert headline
  precipitationChance: string; // Will often be "See Active Alerts"
  wind: string; // Will often be "N/A - See Alerts"
  humidity: string; // Will often be "N/A"
  uvIndex?: string; // Will often be "N/A"
  extendedForecast: DailyForecast[]; // Repurposed to list individual alerts
  rawAlerts?: any[]; // To store the full array of alert objects from NWS
}

// Example: If Gemini response is structured JSON
export interface InvestmentInsight {
  opportunities: string[];
  risks: string[];
  recommendations: string;
}

// New types for Power Plant API
export interface PowerPlantAttributes {
  Longitude: number;
  Latitude: number;
  Total_MW: number | null; // API can return null for Total_MW
  Utility_Name: string;
  PrimSource: string;
  State: string;
}

export interface PowerPlantGeometry {
  x: number;
  y: number;
}

export interface PowerPlantFeature {
  attributes: PowerPlantAttributes;
  geometry: PowerPlantGeometry;
}

export interface PowerPlantAPIResponse {
  objectIdFieldName?: string;
  uniqueIdField?: { name: string; isSystemMaintained: boolean };
  globalIdFieldName?: string;
  geometryType?: string;
  spatialReference?: { wkid: number; latestWkid: number };
  fields?: any[]; // Can be defined more strictly if needed
  features: PowerPlantFeature[];
  exceededTransferLimit?: boolean;
}
