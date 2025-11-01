import { Pencil, WandSparkles, X } from 'lucide-react';
import React, { useState } from 'react'


const ImagePlaceHolder = ({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = null,
  index = undefined,
  setOpenImageModal,
}:{
    size: string;
    small?: boolean;
    onImageChange: (file: File | null, index: number) => void;
    onRemove: (index: number) => void;
    defaultImage?: string | null;
    index?: any;
    setOpenImageModal: (openImageModal: boolean) => void;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index!);
    }
  };

  const handleRemove = () => {
    setImagePreview(null);
    onRemove(index ?? -1);
  };

  return (
    <div
      className={`relative ${small ? "h-[180px]" : "h-[450px]"} w-full rounded-lg border border-dashed border-gray-600 flex flex-col justify-center items-center cursor-pointer bg-gray-400`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 text-sm hover:bg-red-600"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>

          <button
            type="button"
            onClick={() => setOpenImageModal(true)}
            className="absolute top-3 right-[70px] p-2 rounded bg-blue-500 shadow-lg text-white"
            aria-label="Edit image"
          >
            <WandSparkles size={16} color="white" />
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 !rounded text-gray-700 shadow-lg cursor-pointer"
        >
          <Pencil size={16} />
        </label>
      )}
      {imagePreview ? (
        <img 
           width={400}
           height={300}
           src={imagePreview} 
           alt="uploaded" 
           className="w-full h-full object-cover rounded-lg" />
      ):(
        <>
        <p className={`text-gray-600 ${
            small ? "text-xl" : "text-4xl"
            } font-semibold`} >
            {size}
        </p>
         <p className={`text-gray-700 ${
            small ? "text-sm" : "text-lg"
            } pt-2 text-center`} >
            Please choose an image <br />
            according to the specified size.
        </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceHolder
