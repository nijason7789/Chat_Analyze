import { useState, useEffect, useRef } from 'react';
import styles from './ImageMagnifier.module.css';

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
    const x = e.pageX - (left + window.scrollX);
    const y = e.pageY - (top + window.scrollY);

    setXY([x, y]);
  };

  return (
    <div className={styles.container}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={styles.image}
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
          className={styles.magnifier}
          style={{
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: `${y}px`,
            left: `${x}px`,
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${(x / imgWidth) * 100}% ${(y / imgHeight) * 100}%`,
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
          }}
        >
          <div className={styles.cursor} />
        </div>
      )}
    </div>
  );
}
