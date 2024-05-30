import React from 'react';
import './pipet.css';

const PipetteInfo = ({ colors, onClose }) => {
  const { primary, secondary } = colors;

  return (
    <div className="pipette-info">
      <button className="close-button" onClick={onClose}>Закрыть</button>
      {primary ? (
        <div className="color-swatch">
          <div className="swatch" style={{ backgroundColor: `rgb(${primary.rgb.join(', ')})` }}></div>
          <div className="color-details">
            <p>Цвет: {`rgb(${primary.rgb.join(', ')})`}</p>
            <p>Координаты: X: {primary.position.x}, Y: {primary.position.y}</p>
            <p>RGB: {primary.rgb.join(', ')}</p>
            <p>XYZ: {primary.xyz.join(', ')}</p>
            <p>Lab: {primary.lab.join(', ')}</p>
            <p>LCH: {primary.lch.join(', ')}</p>
            <p>OKLch: {primary.oklch.join(', ')}</p>
          </div>
        </div>
      ) : (
        <p>Primary color not selected</p>
      )}
      {secondary ? (
        <div className="color-swatch secondary">
          <div className="swatch" style={{ backgroundColor: `rgb(${secondary.rgb.join(', ')})` }}></div>
          <div className="color-details">
            <p>Цвет: {`rgb(${secondary.rgb.join(', ')})`}</p>
            <p>Координаты: X: {secondary.position.x}, Y: {secondary.position.y}</p>
            <p>RGB: {secondary.rgb.join(', ')}</p>
            <p>XYZ: {secondary.xyz.join(', ')}</p>
            <p>Lab: {secondary.lab.join(', ')}</p>
            <p>LCH: {secondary.lch.join(', ')}</p>
            <p>OKLch: {secondary.oklch.join(', ')}</p>
          </div>
        </div>
      ) : (
        <p>Secondary color not selected</p>
      )}
    </div>
  );
};

export default PipetteInfo;
