import React from "react";
import "../../styles/stat-card.scss";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  isProgress?: boolean;
  loading?: boolean;
  textColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  isProgress = false,
  loading = false,
  textColor,
}) => {
  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 style={{ color: textColor }} className="title">
          {title}
        </h3>
        {icon && <span className="text-primary-600">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div className="value" style={{ color: textColor }}>
          {isProgress ? `${value}%` : value}
        </div>
      </div>
    </div>
  );
};
