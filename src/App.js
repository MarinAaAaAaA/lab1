import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ResizeModal from './modal';
import Toolbar from './toolbar';
import PipetteInfo from './pipet';
import CurvesModal from './CurvesModal'; // Импортируем новый компонент
import { rgbToXyz, rgbToLab, rgbToLch, rgbToOKLch, calculateContrast, calculateAPCA } from './utils';

function App() {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [color, setColor] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(100);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayedDimensions, setDisplayedDimensions] = useState({ width: 0, height: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCurvesModalOpen, setIsCurvesModalOpen] = useState(false); // Состояние для нового модального окна
  const [activeTool, setActiveTool] = useState('hand');
  const [colors, setColors] = useState({ primary: null, secondary: null });
  const [isPipetteInfoOpen, setIsPipetteInfoOpen] = useState(false);
  const canvasRef = useRef(null);
  const fileReader = useRef(new FileReader());

  fileReader.current.onloadend = () => {
    setImageURL(fileReader.current.result);
  };

  const handleOnChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setImage(file);
    fileReader.current.readAsDataURL(file);
  };

  const updatePosition = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setPosition({ x: offsetX, y: offsetY });
  };

  const updateColor = (e) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    const [r, g, b] = ctx.getImageData(offsetX, offsetY, 1, 1).data;
    setColor(`rgb(${r}, ${g}, ${b})`);
  };

  const handleMouseMove = (e) => {
    if (activeTool === 'pipette') {
      updateColor(e);
      updatePosition(e);
    }
  };

  const handleCanvasClick = (e) => {
    if (activeTool !== 'pipette') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    const [r, g, b] = ctx.getImageData(offsetX, offsetY, 1, 1).data;
    const color = {
      rgb: [r, g, b],
      position: { x: offsetX, y: offsetY },
      xyz: rgbToXyz([r, g, b]),
      lab: rgbToLab([r, g, b]),
      lch: rgbToLch([r, g, b]),
      oklch: rgbToOKLch([r, g, b])
    };

    if (e.altKey || e.ctrlKey || e.shiftKey) {
      setColors({ ...colors, secondary: color });
    } else {
      setColors({ ...colors, primary: color });
    }

    setIsPipetteInfoOpen(true);
  };

  const drawImage = (img, scale, offsetX, offsetY) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scaledWidth = (img.width * scale) / 100;
    const scaledHeight = (img.height * scale) / 100;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    context.clearRect(0, 0, scaledWidth, scaledHeight);
    context.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    setDisplayedDimensions({ width: Math.round(scaledWidth), height: Math.round(scaledHeight) });
  };

  const resizeImage = ({ width, height }) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      context.imageSmoothingEnabled = false;
      context.drawImage(img, 0, 0, width, height);
      setDisplayedDimensions({ width: width, height: height });
    };
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'resized_image.png';
    link.click();
  };

  useEffect(() => {
    if (!imageURL) return;
    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setDisplayedDimensions({ width: img.width, height: img.height });
      drawImage(img, scale, 0, 0);
    };
    img.onerror = () => {
      alert('Ошибка при загрузке изображения. Проверьте URL.');
    };
  }, [imageURL, scale]);

  const handleKeyDown = (e) => {
    console.log('Key pressed:', e.key);

    const moveAmount = e.shiftKey ? 20 : e.altKey ? 1 : 10;

    if (activeTool === 'hand') {
      const canvas = canvasRef.current;
      const img = new Image();
      img.src = imageURL;

      img.onload = () => {
        const { width, height } = canvas;
        let offsetX = position.x;
        let offsetY = position.y;

        switch (e.key) {
          case 'ArrowLeft':
            offsetX = position.x - moveAmount < 0 ? 0 : position.x - moveAmount;
            break;
          case 'ArrowRight':
            offsetX = position.x + moveAmount > width ? width : position.x + moveAmount;
            break;
          case 'ArrowUp':
            offsetY = position.y - moveAmount < 0 ? 0 : position.y - moveAmount;
            break;
          case 'ArrowDown':
            offsetY = position.y + moveAmount > height ? height : position.y + moveAmount;
            break;
          default:
            break;
        }

        drawImage(img, scale, offsetX, offsetY);
        setPosition({ x: offsetX, y: offsetY });
      };
    }
  };

  const applyCurvesCorrection = (lut) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = lut[data[i]];     // Red
      data[i + 1] = lut[data[i + 1]]; // Green
      data[i + 2] = lut[data[i + 2]]; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handlePreviewCurvesCorrection = (lut) => {
    applyCurvesCorrection(lut);
  };

  const handleCurvesApply = (lut) => {
    applyCurvesCorrection(lut);
    setIsCurvesModalOpen(false);
  };

  const handleCurvesReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  return (
    <div className="App" onKeyDown={handleKeyDown} tabIndex="0">
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} onOpenCurvesModal={() => setIsCurvesModalOpen(true)} />
      <div className="uploader">
        {image && (
          <div className="color-info">
            <div className="image-size">
              Размер изображения: <br />
              Ширина: {displayedDimensions.width}px <br />
              Высота: {displayedDimensions.height}px
            </div>
            <div>Координаты: <br />X: {position.x}px, <br /> Y: {position.y}px</div>
            <div className="color">Цвет: <br /> {color}</div>   
            <div style={{ backgroundColor: color, width: 150, height: 30, marginTop: 10 }}></div>
          </div>
        )}
        <div className="test">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            className="uploader__canvas"
          ></canvas>
          <div>{image ? image.name : ''}</div>
          <div className="load">
            <label htmlFor="loader-button" className="uploader__button">
              Загрузить файл
            </label>
            <input
              id="loader-button"
              type="file"
              className="uploader__upload-button"
              onChange={handleOnChange}
            />
            <div className="url-uploader">
              <input
                type="text"
                placeholder="Введите URL изображения"
                onChange={(e) => setImageURL(e.target.value)}
                className="url-input"
              />
              <button className="url-button" onClick={() => fileReader.current.readAsDataURL(image)}>загрузить</button>
            </div>
          </div>
          <div className="scale-selector">
            <label htmlFor="scale">Масштаб:</label>
            <input
              id="scale"
              type="range"
              min="12"
              max="300"
              stwp ='1'
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              style={{width:'100%'}}
            />
            <span>{scale}%</span>
          </div>
          <button onClick={() => setIsModalOpen(true)}>Изменить размер</button>
          <button onClick={saveImage}>Сохранить</button>
        </div>
      </div>
      <ResizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageWidth={originalDimensions.width}
        imageHeight={originalDimensions.height}
        onResize={resizeImage}
      />
      <CurvesModal
        isOpen={isCurvesModalOpen}
        onClose={() => setIsCurvesModalOpen(false)}
        onApply={handleCurvesApply}
        onReset={handleCurvesReset}
        onPreview={handlePreviewCurvesCorrection}
      />
      {isPipetteInfoOpen && (
        <PipetteInfo colors={colors} onClose={() => setIsPipetteInfoOpen(false)} />
      )}
    </div>
  );
}

export default App;

