import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import ImageMagnifier from './ImageMagnifier';
import styles from './ImageGallery.module.css';
import ZoomIcon from '../assets/icons/ZoomIcon.svg';
import CloseIcon from '../assets/icons/CloseIcon.svg';

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
                  <img src={ZoomIcon} className={styles.icon} alt="zoom" />
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
          <DialogPanel className={styles.dialogPanel}>
            <div className={styles.relative}>
              <button
                onClick={() => setSelectedImage(null)}
                className={styles.closeButton}
              >
                <img src={CloseIcon} className={styles.closeIcon} alt="close" />
              </button>
              <ImageMagnifier
                src={selectedImage}
                alt="Enlarged view"
                magnifierHeight={200}
                magnifierWidth={200}
                zoomLevel={5}
              />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
