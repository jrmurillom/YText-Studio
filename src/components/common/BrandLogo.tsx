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
  // Dimension definitions based on size preset (1:1 square icon)
  const sizeMap = {
    sm: { iconSize: 26, textClass: 'text-sm', studioClass: 'text-xs' },
    md: { iconSize: 34, textClass: 'text-lg', studioClass: 'text-xs' },
    lg: { iconSize: 44, textClass: 'text-2xl', studioClass: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* Icon: Official Layered Stack Squircle Isotype */}
      <svg
        width={currentSize.iconSize}
        height={currentSize.iconSize}
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-150 drop-shadow-xs"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bl-bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="bl-red" x1="112" y1="232" x2="912" y2="792" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF1E27" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="bl-play" x1="674" y1="624" x2="866" y2="816" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF0033" />
            <stop offset="100%" stopColor="#CC0000" />
          </linearGradient>
        </defs>

        {/* Squircle Base */}
        <rect width="1024" height="1024" rx="224" fill="url(#bl-bg)"/>
        <rect x="8" y="8" width="1008" height="1008" rx="216" stroke="#334155" strokeWidth="14" strokeOpacity="0.5"/>

        {/* Back Red Card */}
        <rect x="112" y="232" width="800" height="560" rx="48" fill="url(#bl-red)" transform="rotate(-5 512 512)" opacity="0.95" />

        {/* Front White Card with Bold T */}
        <g>
          <rect x="112" y="232" width="800" height="560" rx="48" fill="#FFFFFF" transform="rotate(2.5 512 512)" />
          <path d="M 222 332 L 802 332 L 802 447 L 597 447 L 597 732 L 427 732 L 427 447 L 222 447 Z" 
                fill="#0F172A" 
                transform="rotate(2.5 512 512)" />
        </g>

        {/* Play Badge */}
        <g>
          <circle cx="770" cy="720" r="96" fill="url(#bl-play)" stroke="#FFFFFF" strokeWidth="18"/>
          <path d="M 748 680 L 806 720 L 748 760 Z" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Typography Lockup */}
      {variant === 'full' && (
        <div className="flex items-baseline tracking-tight font-sans">
          <span className={`font-black text-[#FF0000] tracking-tight ${currentSize.textClass}`}>
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
