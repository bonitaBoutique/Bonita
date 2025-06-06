
import { useState } from 'react';

const TruncatedText = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <span className="text-gray-500">Sin descripción</span>;

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate 
    ? text 
    : `${text.substring(0, maxLength)}...`;

  return (
    <div className="text-sm">
      <span className="text-gray-700">{displayText}</span>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-600 hover:text-blue-800 underline focus:outline-none"
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
};

export default TruncatedText;
