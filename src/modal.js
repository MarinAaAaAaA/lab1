import React, { useState, useEffect } from 'react';
import './modal.css';

function ResizeModal({ isOpen, onClose, imageWidth, imageHeight, onResize }) {
  const [units, setUnits] = useState('percent');
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [interpolation, setInterpolation] = useState('nearest');
  const originalPixels = Math.round((imageWidth * imageHeight) / 1000000);

  useEffect(() => {
    setWidth(100);
    setHeight(100);
  }, [imageWidth, imageHeight]);

  const handleWidthChange = (e) => {
    const newWidth = Math.round(e.target.value);
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round((newWidth * imageHeight) / imageWidth));
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = Math.round(e.target.value);
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round((newHeight * imageWidth) / imageHeight));
    }
  };

  const handleResize = () => {
    let newWidth = width;
    let newHeight = height;
    if (units === 'percent') {
      newWidth = Math.round((imageWidth * width) / 100);
      newHeight = Math.round((imageHeight * height) / 100);
    } else {
      newWidth = Math.round(width);
      newHeight = Math.round(height);
    }
    onResize({ width: newWidth, height: newHeight });
    onClose();
  };

  if (!isOpen) return null;

  const newPixels = units === 'percent'
    ? Math.round((imageWidth * width / 100) * (imageHeight * height / 100) / 1000000)
    : Math.round((width * height) / 1000000);

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
          <p>Исходные пиксели: {originalPixels} Мп</p>
          <p>Новые пиксели: {newPixels} Мп</p>
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
