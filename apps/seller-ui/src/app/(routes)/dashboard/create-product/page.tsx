"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronRight } from 'lucide-react';
import ImagePlaceHolder from 'apps/seller-ui/src/share/components/image-placeholder';
import Input from 'apps/seller-ui/src/share/components/input';
import ColorSelector from 'apps/seller-ui/src/share/components/color-selector';
import CustomSpecifications from 'apps/seller-ui/src/share/components/custom-specifications';
import CustomProperties from 'apps/seller-ui/src/share/components/custom-properties';

const page = () => {
  const { 
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false)
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data:any) => {
  console.log(data)
}
  const handleImageChange = (file: File | null, index:number) => {
    const updatedImages = [...images];

    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
    setValue('images', updatedImages);
 };
  
 const handleImageRemove = (index: number) => {
   setImages((prevImages) => {
     let updatedImages = [...prevImages];

     if (index === -1){
      updatedImages[0] = null;
     } else {
      updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      return updatedImages; 
   });
    setValue('images', images);
 };

  return (
    <form
      className='w-full mx-auto p-8 shadow-md rounded-lg text-white'
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3 className='text-2xl font-bold mb-6'>
        Create Product
      </h3>
    <div className='flex items-center'>
      <span className='text-[#80Deea] cursor-pointer'>Dashboard</span>
      <ChevronRight className=' opacity-[.8]' size={14} />
      <span className='text-[#80Deea] cursor-pointer'>Create Products</span>
    </div>

    <div className='py-4 w-full flex gap-6'>
      <div className='md:w-[35%]'>
        {images?. length > 0 && (<ImagePlaceHolder
          setOpenImageModal={setOpenImageModal}
          size='765 x 850'
          small={false}
          index={0}
          onImageChange={handleImageChange}
          onRemove={handleImageRemove}
        />
        )}
      </div>
      <div className='grid grid-cols-2 gap-3 mt-4'>
        {images.slice(1).map((_, index) => (
            <ImagePlaceHolder
              key={index}
              setOpenImageModal={setOpenImageModal}
              size='765 x 850'
              small
              index={index + 1}
              onImageChange={handleImageChange}
              onRemove={handleImageRemove}
            />
        ))}
      </div>
      <div className='md:w-[65%]'>
        <div className='w-full flex gap-4'>
          <div className='w-2/4'>
            <Input
              label="Product Title *"
              placeholder="Enter product title"
              {...register("title", { required: "Product title is required" })}
              className={`${errors.title ? "border-red-500" : ""}`}
            />
          </div>
      </div>
        <div className='w-2/4 mt-2'>
          <Input
            type="textarea"
            rows={4}
            cols={10}
            label="Short Description *"
            placeholder="Enter product description for quick view"
            {...register("description", { required: "Description is required",
              validate: (value) => {
                const wordCount = value.trim().split(/\s+/).length;
                return wordCount <= 150 || `Description must not exceed 150 words (Current: ${wordCount})`;
              }
            })}
            className={`${errors.description ? "border-red-500" : ""}`}
          />
        </div>
        <div className='w-2/4 mt-2'>
            <Input
              label="Tags *"
              placeholder="apple, mobile, samsung"
              {...register("tags", { required: "Separate related product tags with commas" })}
              className={`${errors.tags ? "border-red-500" : ""}`}
            />
        </div>
        <div className='w-2/4 mt-2'>
            <Input
              label="Warranty *"
              placeholder="1 year / No warranty"
              {...register("warranty", { required: "Warranty information is required" })}
              className={`${errors.warranty ? "border-red-500" : ""}`}
            />
        </div>
        <div className='w-2/4 mt-2'>
            <Input
              label="Slug *"
              placeholder="apple-mobile-samsung"
              {...register("slug", { required: "Product slug is required",
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: "Slug can only contain lowercase letters, numbers, and hyphens",
                },
                minLength: {
                  value: 3,
                  message: "Slug must be at least 3 characters long",
                },
                maxLength: {
                  value: 50,
                  message: "Slug must not exceed 50 characters",
                },
              })}
              className={`${errors.slug ? "border-red-500" : ""}`}
            />
        </div>
        <div className='w-2/4 mt-2'>
            <Input
              label="Brand *"
              placeholder="apple"
              {...register("brand", { required: "Brand is required" })}
              className={`${errors.brand ? "border-red-500" : ""}`}
            />
        </div>
        <div className='w-2/4 mt-2'>
            <ColorSelector control={control} errors={errors} />
        </div>
        <div className='w-2/4 mt-2'>
            <CustomSpecifications control={control} errors={errors} />
        </div>
        <div className='w-2/4 mt-2'>
            <CustomProperties control={control} errors={errors} />
        </div>
    </div>
    </div>  
    </form>
  );
}; 

export default page
 