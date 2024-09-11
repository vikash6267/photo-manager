import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getFolder } from '../service/operations/folder';
import ImageModal from '../components/common/ImageModal';
import { imageUpload, uploadImageToFolder } from '../service/operations/user'; // Import these functions
import Compressor from 'compressorjs';

// Throttle function
const throttle = (func, limit) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall < limit) return;
    lastCall = now;
    func(...args);
  };
};

function SingleFolder() {
  const { id, folderName = "Folder" } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null); // Ref for file input
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
  const [error, setError] = useState(null);

  const fetchFolder = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await getFolder(id, token, page);
      const newImages = res?.images || [];
      setImages(prevImages => {
        const uniqueImages = [...prevImages, ...newImages].filter(
          (value, index, self) =>
            index === self.findIndex((t) => (
              t.public_id === value.public_id
            ))
        );
        return uniqueImages;
      });
      setHasMore(res?.currentPage < res?.totalPages);
    } catch (error) {
      console.error("Error fetching folder images", error);
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        success: (compressedFile) => {
          resolve(compressedFile);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  };

  useEffect(() => {
    fetchFolder();
  }, [page]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollableContainer = document.querySelector('.scrollable-container');
      if (scrollableContainer) {
        const scrollTop = scrollableContainer.scrollTop;
        const scrollHeight = scrollableContainer.scrollHeight;
        const clientHeight = scrollableContainer.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !loading) {
          setPage(prevPage => prevPage + 1);
        }
      }
    }, 100);

    const scrollableContainer = document.querySelector('.scrollable-container');
    if (scrollableContainer) {
      scrollableContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollableContainer) {
        scrollableContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, loading]);

  const openModal = (index) => {
    setCurrentIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handlePrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files)); // Convert FileList to array
      await uploadImage(Array.from(files));
    }
  };

  const uploadImage = async (acceptedFiles) => {
    if (!Array.isArray(acceptedFiles)) {
      console.error('Accepted files is not an array');
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    for (let file of acceptedFiles) {
      if (file.size <= MAX_FILE_SIZE) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      const resizedFiles = await Promise.all(invalidFiles.map(file => resizeImage(file)));
      validFiles.push(...resizedFiles);
      setError(`Some files were resized to meet the size limit.`);
    }

    setError(null);

    const response = await imageUpload(validFiles);
    const uploadedImages = response?.map((image) => ({
      public_id: image?.asset_id,
      url: image?.url,
    }));
    setImages(prevImages => {
      const uniqueImages = [...prevImages, ...uploadedImages].filter(
        (value, index, self) =>
          index === self.findIndex((t) => (
            t.public_id === value.public_id
          ))
      );
      return uniqueImages;
    });

    if (response) {
      await uploadImageToFolder({ folderNameId: "66e12f4e32b6ef6db96565e1", images: JSON.stringify(images) }, token);
    }
  };

  return (
    <div className="container">
      <div className='flex justify-between items-center my-5'>
        <h1 className='text-center font-semibold text-2xl'>{folderName} Images</h1>
        <div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide the file input
            id="image-upload-input"
          />
          <button
            className='bg-blue-600 px-3 py-1 text-white font-semibold rounded-xl'
            onClick={() => fileInputRef.current.click()} // Trigger file input click
          >
            {uploading ? 'Uploading...' : 'Add More Photos'}
          </button>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 scrollable-container">
        {images.map((image, index) => (
          <div
            key={index}
            className="image-item w-[300px] overflow-hidden flex items-center justify-center border border-black shadow-2xl bg-gray-200 cursor-pointer"
            onClick={() => openModal(index)}
          >
            <img
              src={image?.url}
              alt={`Image ${index}`}
              className='object-cover w-full h-full min-w-[200px] max-w-[200px]'
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="loader">Loading...</div>
        </div>
      )}

      {!hasMore && !loading && (
        <div className="text-center py-4 text-gray-600">
          No more images
        </div>
      )}

      <ImageModal
        isOpen={modalOpen}
        onClose={closeModal}
        images={images}
        currentIndex={currentIndex}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}

export default SingleFolder;
