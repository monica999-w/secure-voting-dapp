
import React from 'react';
import '../../css/legend.css'

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <div className="legend-color legend-color-red"></div>
        <span className="legend-label">High Turnout</span>
      </div>
      <div className="legend-item">
        <div className="legend-color legend-color-orange"></div>
        <span className="legend-label">Medium Turnout</span>
      </div>
      <div className="legend-item">
        <div className="legend-color legend-color-green"></div>
        <span className="legend-label">Low Turnout</span>
      </div>
    </div>
  );
};

export default Legend;

