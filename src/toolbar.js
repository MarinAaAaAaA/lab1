import React, { useState } from 'react';
import './App.css';

function Toolbar({ activeTool, onSelectTool, onOpenCurvesModal }) {
  return (
    <div className="toolbar">
      <button
        className={activeTool === 'hand' ? 'active' : ''}
        onClick={() => onSelectTool('hand')}
        title="Рука (Перемещение изображения) [H]"
      >
        &#x1f590;
      </button>
      <button
        className={activeTool === 'pipette' ? 'active' : ''}
        onClick={() => onSelectTool('pipette')}
        title="Пипетка (Выбор цвета) [P]"
      >
        &#x1f9e0;
      </button>
      <button
        className="curves-button"
        onClick={onOpenCurvesModal}
        title="Кривые (Градационная коррекция) [C]"
      >
        Кривые
      </button>
    </div>
  );
}

export default Toolbar;
