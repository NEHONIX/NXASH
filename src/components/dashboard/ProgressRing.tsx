interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  circleColor = "#000080"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring">
      <svg width={size} height={size}>
        {/* Cercle de fond */}
        <circle
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Cercle de progression */}
        <circle
          stroke={circleColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%"
          }}
        />
        {/* Texte de progression */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fill={circleColor}
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold"
          }}
        >
          {Math.round(progress)}%
        </text>
      </svg>
    </div>
  );
};
