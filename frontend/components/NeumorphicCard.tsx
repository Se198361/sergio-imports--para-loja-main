import React from 'react';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NeumorphicCard({ children, className = '', onClick }: NeumorphicCardProps) {
  return (
    <div
      className={`
        bg-gray-50 dark:bg-gray-800
        shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
        dark:shadow-[8px_8px_16px_#1f2937,-8px_-8px_16px_#374151]
        rounded-xl
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:hover:shadow-[4px_4px_8px_#1f2937,-4px_-4px_8px_#374151]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
