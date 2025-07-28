'use client';

interface StatusIndicatorProps {
  isThinking: boolean;
  className?: string;
}

/**
 * Status indicator component
 * - Clear visual status
 * - Responsive text (hidden on mobile)
 * - Consistent styling
 */
export default function StatusIndicator({ 
  isThinking, 
  className = '' 
}: StatusIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full ${
          isThinking ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
        }`}
        aria-label={isThinking ? 'Processing' : 'Ready'}
      />
      <span className="hidden sm:inline">
        {isThinking ? 'Processing...' : 'Ready'}
      </span>
    </div>
  );
}