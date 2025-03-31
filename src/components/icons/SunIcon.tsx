export const SunIcon = () => (
  <svg 
    className="absolute top-0 right-0 w-64 h-64 text-yellow-300/70" 
    viewBox="0 0 100 100" 
    style={{ 
      clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
    }}
  >
    <circle cx="100" cy="0" r="70" fill="currentColor">
      <animate
        attributeName="opacity"
        values="0.7;0.9;0.7"
        dur="8s"
        repeatCount="indefinite"
      />
    </circle>
    {/* Sun rays */}
    <g opacity="0.6">
      <path d="M100 0 L85 20 M100 0 L100 20 M100 0 L115 20" stroke="currentColor" strokeWidth="2">
        <animate
          attributeName="opacity"
          values="0.6;0.8;0.6"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  </svg>
); 