import React, { useState } from 'react';
import './modal.css';

function ResizeModal({ isOpen, onClose, imageWidth, imageHeight, onResize }) {
  const [units, setUnits] = useState('percent');
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [interpolation, setInterpolation] = useState('nearest');
  const originalPixels = (imageWidth * imageHeight) / 1000000;

  const handleWidthChange = (e) => {
    setWidth(e.target.value);
    if (maintainAspectRatio) {
      setHeight((e.target.value * imageHeight) / imageWidth);
    }
  };

  const handleHeightChange = (e) => {
    setHeight(e.target.value);
    if (maintainAspectRatio) {
      setWidth((e.target.value * imageWidth) / imageHeight);
    }
  };

  const handleResize = () => {
    let newWidth = width;
    let newHeight = height;
    if (units === 'percent') {
      newWidth = (imageWidth * width) / 100;
      newHeight = (imageHeight * height) / 100;
    }
    onResize({ width: newWidth, height: newHeight });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Изменение размера изображения</h2>
        <div>
          <label>Единицы измерения:</label>
          <select value={units} onChange={(e) => setUnits(e.target.value)}>
            <option value="percent">Проценты</option>
            <option value="pixels">Пиксели</option>
          </select>
        </div>
        <div>
          <label>Ширина:</label>
          <input type="number" value={width} onChange={handleWidthChange} />
        </div>
        <div>
          <label>Высота:</label>
          <input type="number" value={height} onChange={handleHeightChange} />
        </div>
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={maintainAspectRatio} 
              onChange={() => setMaintainAspectRatio(!maintainAspectRatio)} 
            />
            Сохранять пропорции
          </label>
        </div>
        <div className="tooltip-container">
          <label>Алгоритм интерполяции:</label>
          <select value={interpolation} onChange={(e) => setInterpolation(e.target.value)}>
            <option value="nearest">Ближайший сосед</option>
          </select>
          <div className="tooltip">
            <span className="tooltip-text">
              Ближайший сосед - быстрый и простой метод, но может приводить к появлению ступенчатых краев в изображении.
            </span>
          </div>
        </div>
        <div>
          <p>Исходные пиксели: {originalPixels.toFixed(2)} Мп</p>
          <p>Новые пиксели: {((width * height) / 1000000).toFixed(2)} Мп</p>
        </div>
        <div className="modal-buttons">
          <button onClick={handleResize}>Применить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

export default ResizeModal;