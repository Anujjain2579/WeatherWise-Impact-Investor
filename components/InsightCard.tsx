import React from 'react';

interface InsightCardProps {
  insight: string;
}

// Helper function to render text with **bold** markdown as <strong> tags
const renderWithBold = (text: string): React.ReactNode[] => {
  // Split by the bold markdown, keeping the delimiters
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the asterisks and wrap with <strong>
      return <strong key={i}>{part.substring(2, part.length - 2)}</strong>;
    }
    // Return normal text part
    return part;
  });
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const paragraphs = insight.split('\n').filter(p => p.trim() !== '');

  // Regex for numeric (e.g., "1. ") or markdown (e.g., "### ") headings
  const genericHeadingRegex = /^(\d+\.\s+|#{1,6}\s+)/;

  // Specific phrases that indicate a section heading
  const specificHeadingStarters = [
    "Immediate Investment Opportunities & Needs",
    "Potential Risks & Urgent Mitigation",
    "Sector-Specific Impacts", // Will match "Sector-Specific Impacts (CA - San Francisco):"
    "Short-Term Resilience & Preparedness",
    "Investor Actions",
    "Overall Outlook Based on Alerts",
    "Stocks Most Likely to Get Impacted Significantly", // From prompt/screenshot
    "List 3 stocks" // Fallback from prompt for the 7th point
  ];

  return (
    <div className="bg-slate-800/70 shadow-xl rounded-xl p-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mr-3 text-teal-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.354a15.057 15.057 0 0 1-4.5 0M3 16.5v-1.5A2.25 2.25 0 0 1 5.25 12.75h13.5A2.25 2.25 0 0 1 21 15v1.5m-18 0h18M12 6.75A.75.75 0 1 1 12 5.25a.75.75 0 0 1 0 1.5Zm0 0v2.25" />
        </svg>
        AI-Powered Investment Analysis
      </h2>
      <div className="prose prose-sm prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
        {paragraphs.map((paragraph, index) => {
          const trimmedParagraph = paragraph.trim();
          
          let isHeading = genericHeadingRegex.test(trimmedParagraph);
          if (!isHeading) {
            isHeading = specificHeadingStarters.some(starter => 
              trimmedParagraph.startsWith(starter)
            );
          }

          if (isHeading) {
            return (
              <h3 
                key={index} 
                className="text-xl font-semibold text-teal-300 mt-5 mb-3 first:mt-0"
              >
                {/* Render with bold handles if headings themselves contain **markdown** */}
                {renderWithBold(trimmedParagraph)}
              </h3>
            );
          }
          
          return (
            <p 
              key={index} 
              className={`mb-3 ${index === paragraphs.length - 1 ? 'last:mb-0' : ''}`}
            >
              {renderWithBold(trimmedParagraph)}
            </p>
          );
        })}
      </div>
    </div>
  );
};
