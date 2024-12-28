import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import ImageMagnifier from './ImageMagnifier';
import styles from './ImageGallery.module.css';

export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images?.length) return null;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.grid}>
          {images.map((image, index) => (
            <div 
              key={index} 
              className={styles.imageWrapper}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image}
                alt={`Analysis Chart ${index + 1}`}
                className={styles.image}
              />
              <div className={styles.overlay}>
                <div className={styles.zoomIcon}>
                  <svg 
                    className={styles.icon}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        className={styles.dialog}
      >
        <div className={styles.dialogBackdrop} aria-hidden="true" />

        <div className={styles.dialogContainer}>
          <Dialog.Panel className={styles.dialogPanel}>
            <div className={styles.relative}>
              <button
                onClick={() => setSelectedImage(null)}
                className={styles.closeButton}
              >
                <svg 
                  className={styles.closeIcon}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
              
              <ImageMagnifier
                src={selectedImage}
                alt="Enlarged view"
                magnifierHeight={200}
                magnifierWidth={200}
                zoomLevel={5}
              />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
