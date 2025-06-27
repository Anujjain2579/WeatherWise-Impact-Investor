
import React from 'react';
import type { WeatherData, DailyForecast } from '../types';
import { WeatherIcon } from './WeatherIcon'; // Icon might be less relevant or need mapping

interface WeatherCardProps {
  weatherData: WeatherData;
}

const DetailItem: React.FC<{ label: string; value: string | undefined; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center space-x-2 p-2 bg-sky-700/30 rounded">
    {icon && <span className="text-sky-300">{icon}</span>}
    <span className="text-sm text-sky-200">{label}:</span>
    <span className="text-sm font-semibold text-white">{value || 'N/A'}</span>
  </div>
);

// Repurpose ForecastDayItem to display an Alert Summary
const AlertSummaryItem: React.FC<{ alert: DailyForecast }> = ({ alert }) => (
  <div className="flex flex-col p-3 bg-red-700/50 rounded-lg text-left shadow-md hover:bg-red-600/60 transition-colors">
    <div className="flex items-center mb-1">
      <WeatherIcon condition={alert.day} className="w-6 h-6 mr-2 text-red-200" /> {/* Use alert.day (event type) for icon */}
      <p className="text-sm font-bold text-red-100">{alert.day}</p> {/* Alert Event Type */}
    </div>
    <p className="text-xs text-red-200 mb-1">Severity: <span className="font-semibold">{alert.temp}</span></p> {/* Alert Severity */}
    <p className="text-xs text-red-200 mb-2 leading-tight">Summary: {alert.condition.substring(0, 100)}{alert.condition.length > 100 ? '...' : ''}</p> {/* Alert Headline/Short Desc */}
    {alert.precipitationChance && <p className="text-xs text-amber-200 bg-black/20 p-1 rounded">Timing: {alert.precipitationChance}</p>} {/* Effective/Expires */}
    {/* Optionally, add a button or link here to show full alert.description and alert.instruction */}
  </div>
);


export const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData }) => {
  const hasActiveAlerts = weatherData.extendedForecast && weatherData.extendedForecast.length > 0;
  const primaryAlertHeadline = weatherData.conditionDescription || "No specific headline.";
  const primaryAlertEvent = weatherData.condition || "Weather Alert";

  return (
    <div className="bg-red-800/70 shadow-xl rounded-xl p-6 backdrop-blur-sm border border-red-600">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Active Weather Alerts</h2>
          <p className="text-lg text-red-200">{weatherData.location}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* Using a generic alert icon or one based on the primary event */}
          <WeatherIcon condition={primaryAlertEvent} className="w-16 h-16 text-red-300" />
          <div>
            <p className="text-xl font-bold text-white">{primaryAlertEvent}</p>
            <p className="text-red-100 text-sm">{primaryAlertHeadline}</p>
          </div>
        </div>
      </div>
      {hasActiveAlerts ? (
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-red-100 mb-3">Active Alerts Summary ({weatherData.extendedForecast.length} {weatherData.extendedForecast.length === 1 ? 'alert' : 'alerts'}):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
            {weatherData.extendedForecast.map((alertItem, index) => (
              <AlertSummaryItem key={index} alert={alertItem} />
            ))}
          </div>
           { (weatherData.rawAlerts && weatherData.rawAlerts.length > 7) &&
             <p className="text-xs text-red-200 mt-2">Displaying first 7 alerts. More alerts may be active.</p>
           }
        </div>
      ) : (
        <div className="text-center py-4 bg-slate-700/30 rounded-md">
          <p className="text-lg text-sky-200">{weatherData.conditionDescription || "No active NWS alerts for this area."}</p>
        </div>
      )}
    </div>
  );
};

// SVG Icons (can be kept generic or adapted)
const TemperatureIcon: React.FC = () => ( // Generic temp icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a2.25 2.25 0 0 0 0 4.5v1.5a2.25 2.25 0 0 0 0 4.5m0-10.5a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25m0-10.5a2.25 2.25 0 0 1 2.25 2.25v6a2.25 2.25 0 0 1-2.25 2.25" />
  </svg>
);
const HumidityIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.822 13.626a4.5 4.5 0 0 1-8.146-5.25L9.5 2.25l2.214 6.126a4.5 4.5 0 0 1 4.108 5.25Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V21.75m-3-6V21.75m6-6V21.75" />
  </svg>
);
const WindIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
);
const PrecipitationIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
     <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a2.25 2.25 0 0 0-2.25 2.25v1.5a2.25 2.25 0 0 0 2.25 2.25h9.75m-9.75 0V21m-5.036-8.79A2.25 2.25 0 0 0 3 13.5v1.5a2.25 2.25 0 0 0 2.25 2.25h1.5V10.5a2.25 2.25 0 0 0-2.25-2.25h-1.5m10.5 6H21m-10.5-6H21m-10.5 0S10.5 6 10.5 6m0 6H3m7.5 0v6m0-6H3m0 0h7.5m6.375-3.375A2.25 2.25 0 0 0 15 4.5h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5M10.5 6h9.75M10.5 6a2.25 2.25 0 0 0-2.25 2.25v1.5a2.25 2.25 0 0 0 2.25 2.25h9.75" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l.75.75M9 15l.75.75M9 17.25l.75.75" />
  </svg>
);
// UvIndexIcon is removed as UV index is not primary for NWS alerts in this context
