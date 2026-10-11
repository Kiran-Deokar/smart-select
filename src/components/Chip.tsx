import React from 'react';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, onRemove, disabled }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-sm rounded-md
        bg-blue-100 text-blue-800 border border-blue-200
        transition-all duration-150
        ${disabled ? 'opacity-60' : 'hover:bg-blue-200'}
      `}
    >
      <span className="truncate max-w-[140px]">{label}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};
