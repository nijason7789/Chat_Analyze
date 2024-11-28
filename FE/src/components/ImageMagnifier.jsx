import { useState, useEffect, useRef } from 'react';

export default function ImageMagnifier({
  src,
  alt,
  magnifierHeight = 200,
  magnifierWidth = 200,
  zoomLevel = 2.5
}) {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);
  
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      const { naturalWidth, naturalHeight } = img;
      setSize([naturalWidth, naturalHeight]);
    }
  }, [src]);

  const handleMouseMove = (e) => {
    const elem = e.currentTarget;
    const { top, left, width, height } = elem.getBoundingClientRect();

    // 計算相對於圖片的滑鼠位置（考慮滾動）
    const x = e.clientX - left;
    const y = e.clientY - top;

    // 計算滑鼠位置的百分比
    const xPercent = Math.max(0, Math.min(100, (x / width) * 100));
    const yPercent = Math.max(0, Math.min(100, (y / height) * 100));

    setXY([xPercent, yPercent]);
  };

  return (
    <div className="relative">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain rounded-lg"
        style={{ maxHeight: 'calc(90vh - 2rem)' }}
        onMouseEnter={(e) => {
          const elem = e.currentTarget;
          const { width, height } = elem.getBoundingClientRect();
          setSize([width, height]);
          setShowMagnifier(true);
          handleMouseMove(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setShowMagnifier(false);
        }}
      />

      {showMagnifier && (
        <div
          className="absolute pointer-events-none border border-gray-200 bg-white rounded-lg shadow-xl"
          style={{
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: y + '%',
            left: x + '%',
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${x * (zoomLevel / (zoomLevel - 1))}% ${y * (zoomLevel / (zoomLevel - 1))}%`,
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
            zIndex: 1000,
          }}
        >
          <div
            className="absolute w-1 h-1 bg-red-500 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
            }}
          />
        </div>
      )}
    </div>
  );
}
