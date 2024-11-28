import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import ImageMagnifier from './ImageMagnifier';

export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images?.length) return null;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image}
                alt={`Analysis Chart ${index + 1}`}
                className="w-full min-h-[500px] object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300">
                <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <svg 
                    className="w-12 h-12 text-white opacity-80" 
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
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/75" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-[90vw] max-h-[90vh] rounded-lg bg-white">
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700"
              >
                <svg 
                  className="w-6 h-6" 
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
