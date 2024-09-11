// src/components/ImageUpload.js

import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { imageUpload, uploadImageToFolder } from '../service/operations/user';
import { useSelector } from 'react-redux';
import Compressor from 'compressorjs';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const ImageUpload = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

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

  const uploadImage = async (acceptedFiles) => {
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
    setImages((prevImages) => [...prevImages, ...uploadedImages]);

    if (response) {
      await uploadImageToFolder({ folderNameId: "66e12f4e32b6ef6db96565e1", images: JSON.stringify(images) }, token);
    }
  };

  return (
    <div className="p-4">
      <div className="dropzone-wrapper">
        <Dropzone onDrop={(acceptedFiles) => uploadImage(acceptedFiles)}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
      </div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
