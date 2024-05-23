import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ResizeModal from './modal'; // Импортируем компонент модального окна для изменения размера

function App() {
  // Состояния компонента
  const [image, setImage] = useState(); // Выбранное изображение
  const [imageURL, setImageURL] = useState(''); // URL изображения
  const [color, setColor] = useState(''); // Цвет под указателем мыши
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Координаты указателя мыши на холсте
  const [scale, setScale] = useState(100); // Масштаб изображения
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 }); // Размеры изображения
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна для изменения размера
  const canvasRef = useRef(null); // Ссылка на холст
  const fileReader = new FileReader(); // Объект для чтения файлов

  // Обработчик завершения чтения файла
  fileReader.onloadend = () => {
    setImageURL(fileReader.result);
  };

  // Обработчик выбора файла изображения
  const handleOnChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    setImage(file);
    fileReader.readAsDataURL(file);
  };

  // Обновление координат указателя мыши
  const updatePosition = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setPosition({ x: offsetX, y: offsetY });
  };

  // Обновление цвета при наведении на холст
  const updateColor = (e) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    const [r, g, b] = ctx.getImageData(offsetX, offsetY, 1, 1).data;
    setColor(`rgb(${r}, ${g}, ${b})`);
  };

  // Обработчик движения мыши по холсту
  const handleMouseMove = (e) => {
    updateColor(e);
    updatePosition(e);
  };

  // Отрисовка изображения на холсте с учетом масштаба
  const drawImage = (img, scale) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
  
    const scaledWidth = (img.width * scale) / 100;
    const scaledHeight = (img.height * scale) / 100;
  
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
  
    context.clearRect(0, 0, scaledWidth, scaledHeight);
    context.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  
    setImageDimensions({ width: Math.round(scaledWidth), height: Math.round(scaledHeight) });
  };
  
  // Изменение размера изображения
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
      setImageDimensions({ width: width, height: height });
    };
  };

  // Сохранение изображения
  const saveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'resized_image.png';
    link.click();
  };

  // Загрузка изображения при монтировании или изменении URL
  useEffect(() => {
    if (!imageURL) return;
    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      const initialScale = Math.min(
        ((window.innerWidth - 100) / img.width) * 100,
        ((window.innerHeight - 100) / img.height) * 100
      );
      setScale(initialScale);
      drawImage(img, initialScale);
    };
    img.onerror= () => {
      alert('Ошибка при загрузке изображения. Проверьте URL.');
    };
  }, [imageURL]);

  // Изменение масштаба изображения при изменении состояния scale
  useEffect(() => {
    if (!imageURL) return;
    const img = new Image();
    img.src = imageURL;
    img.onload = () => drawImage(img, scale);
  }, [scale]);


  return (
    <div className='App'>
      <div className='uploader'>
        {image && (
          <div className='color-info'>
            <div className='image-size'>
            Размер изображения: <br />
            Ширина: {imageDimensions.width}px {image.width && `(${Math.round((imageDimensions.width / image.width) * 100)}%)`}<br />
            Высота: {imageDimensions.height}px {image.height && `(${Math.round((imageDimensions.height / image.height) * 100)}%)`}
          </div>
            <div>Координаты: <br />X: {position.x}px, <br /> Y: {position.y}px</div>
            <div className='color'>Цвет: <br /> {color}</div>
            <div style={{ backgroundColor: color, width: 150, height: 30, marginTop: 10 }}></div>
          </div>
        )}
        <div className='test'>
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className='uploader__canvas'>
          </canvas>
          <div>{image ? image.name : ""}</div>
          <div className='load'>
            <label htmlFor="loader-button" className="uploader__button">
              Загрузить файл
            </label>
            <input
              id="loader-button"
              type="file"
              className="uploader__upload-button"
              onChange={handleOnChange} />
            <div className="url-uploader">
              <input
                type="text"
                placeholder="Введите URL изображения"
                onChange={(e) => setImageURL(e.target.value)}
                className="url-input" />
              <button className='url-button' onClick={setImage}> загрузить </button>
            </div>
          </div>
          <div className='scale-selector'>
            <label htmlFor="scale">Масштаб:</label>
            <input
              id="scale"
              type="range"
              min="12"
              max="300"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
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
        imageWidth={imageDimensions.width}
        imageHeight={imageDimensions.height}
        onResize={resizeImage}
      />
    </div>
  );
}

export default App;