import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const ImageModal = ({ isOpen, onClose, images, currentIndex, onPrevious, onNext }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-4xl max-h-full">
        <img src={images[currentIndex]?.url} alt={`Full size ${currentIndex}`} className="object-contain w-full h-full" />
        
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={onPrevious}
        >
          <FaArrowLeft size={30} />
        </button>
        
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={onNext}
        >
          <FaArrowRight size={30} />
        </button>
        
        <button
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={onClose}
        >
          X
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
