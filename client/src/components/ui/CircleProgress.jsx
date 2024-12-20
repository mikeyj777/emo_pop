import React from "react";

const CircleProgress = ({ value, color, label }) => {
  const radius = 45;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="enhanced-circle-progress">
      <div className="enhanced-progress-glow" style={{ backgroundColor: color }}></div>
      <svg viewBox="0 0 120 120" className="enhanced-progress-ring">
        <defs>
          <pattern id="enhanced-pattern-circles" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1" fill="rgba(255, 255, 255, 0.1)" />
          </pattern>
          
          <linearGradient id={`enhanced-gradient-${label.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>

        <circle 
          className="enhanced-pattern-bg"
          cx="60" 
          cy="60" 
          r={radius + 8}
          fill="url(#enhanced-pattern-circles)"
        />

        <circle 
          className="enhanced-circle-bg"
          cx="60" 
          cy="60" 
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />

        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x = 60 + (radius + 2) * Math.cos(angle);
          const y = 60 + (radius + 2) * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1"
              fill="rgba(255, 255, 255, 0.2)"
              className="enhanced-circle-dot"
            />
          );
        })}

        <circle 
          className="enhanced-progress-bar"
          cx="60" 
          cy="60" 
          r={radius}
          stroke={`url(#enhanced-gradient-${label.replace(/\s+/g, '-')})`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />

        <circle 
          className="enhanced-circle-glow"
          cx="60" 
          cy="60" 
          r={radius}
          strokeWidth="1"
          stroke={color}
        />

        <g className="enhanced-text-group">
          <text 
            x="60" 
            y="55" 
            className="enhanced-circle-text"
            filter="url(#enhanced-shadow)"
          >
            {value}%
          </text>
          <text 
            x="60" 
            y="110" 
            className="enhanced-circle-label"
          >
            {label}
          </text>
        </g>

        <defs>
          <filter id="enhanced-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default CircleProgress;