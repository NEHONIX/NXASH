import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Chargement en cours..." 
}) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle-outer"></div>
      </div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
