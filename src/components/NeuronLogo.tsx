interface NeuronLogoProps {
  className?: string;
}

export function NeuronLogo({ className = "w-7 h-7" }: NeuronLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Speech bubble shape - transparent with dark green outline */}
      <path
        d="M 15 20 Q 15 10, 25 10 L 75 10 Q 85 10, 85 20 L 85 60 Q 85 70, 75 70 L 55 70 L 45 85 L 40 70 L 25 70 Q 15 70, 15 60 Z"
        fill="transparent"
        stroke="#2D5016"
        strokeWidth="3"
      />
      {/* Medical cross inside - slightly smaller, dark green */}
      <g transform="translate(50, 35)">
        <rect x="-3" y="-12" width="6" height="24" fill="#2D5016" rx="1" />
        <rect x="-12" y="-3" width="24" height="6" fill="#2D5016" rx="1" />
      </g>
    </svg>
  );
}
