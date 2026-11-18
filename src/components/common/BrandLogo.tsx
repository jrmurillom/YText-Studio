import React from 'react';

export interface BrandLogoProps {
  /**
   * 'full': Icon + "YText Studio" typography lockup
   * 'icon-only': Standalone vector playmark
   */
  variant?: 'full' | 'icon-only';
  /**
   * Size presets or explicit height
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional custom styling
   */
  className?: string;
  /**
   * Show studio label or omit
   */
  showStudio?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'sm',
  className = '',
  showStudio = true,
}) => {
  // Dimension definitions based on size preset
  const sizeMap = {
    sm: { iconWidth: 32, iconHeight: 23, textClass: 'text-sm', studioClass: 'text-xs' },
    md: { iconWidth: 42, iconHeight: 30, textClass: 'text-lg', studioClass: 'text-xs' },
    lg: { iconWidth: 56, iconHeight: 40, textClass: 'text-2xl', studioClass: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* Icon: Neo-YouTube Clean Squircle Playmark */}
      <svg
        width={currentSize.iconWidth}
        height={currentSize.iconHeight}
        viewBox="0 0 140 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-150"
        aria-hidden="true"
      >
        {/* YouTube-style red squircle (#FF0000) */}
        <path
          d="M136 28C136 12.536 123.464 0 108 0H32C16.536 0 4 12.536 4 28V72C4 87.464 16.536 100 32 100H108C123.464 100 136 87.464 136 72V28Z"
          fill="#FF0000"
        />
        {/* Pure white play button with softened 2px corners */}
        <path
          d="M56 34.5C56 32.96 57.67 32 59 32.77L88.5 48.27C89.83 49.04 89.83 50.96 88.5 51.73L59 67.23C57.67 68 56 67.04 56 65.5V34.5Z"
          fill="white"
        />
      </svg>

      {/* Typography Lockup */}
      {variant === 'full' && (
        <div className="flex items-baseline tracking-tight font-sans">
          <span className={`font-black text-slate-900 ${currentSize.textClass}`}>
            YText
          </span>
          {showStudio && (
            <span className={`font-semibold text-slate-500 ml-1.5 ${currentSize.studioClass}`}>
              Studio
            </span>
          )}
        </div>
      )}
    </div>
  );
};
