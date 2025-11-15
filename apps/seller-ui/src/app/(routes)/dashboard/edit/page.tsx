"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ChevronRight, Wand, X } from 'lucide-react';
import ImagePlaceHolder from 'apps/seller-ui/src/share/components/image-placeholder';
import Input from 'apps/seller-ui/src/share/components/input';
import ColorSelector from 'apps/seller-ui/src/share/components/color-selector';
import CustomSpecifications from 'apps/seller-ui/src/share/components/custom-specifications';
import CustomProperties from 'apps/seller-ui/src/share/components/custom-properties';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance';
import RichTextEditor from 'apps/seller-ui/src/share/components/rich-text-editor';
import SizeSelector from 'apps/seller-ui/src/share/components/size-selector';
import Link from 'next/link';
import Image from 'next/image';
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancements';
import toast from 'react-hot-toast';

const page = () => {
  const { 
    register,
    control,
    watch,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged] = useState(true)
  const [selectedImage, setSelectedImage] = useState("")
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false)
  const [images, setImages] = useState<any[]>([null]);
  const [loading, setLoading] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false)
  const [disabledEffects, setDisabledEffects] = useState<string[]>([]);

  // extract id from path
  const [productId, setProductId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const id = parts[parts.length - 1];
      setProductId(id);
    }
  }, []);

 const {data, isLoading, isError} = useQuery<{ categories?: any[]; subCategories?: any[] }>(
  {
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res?.data ?? { categories: [], subCategories: [] };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  }
 );

  const { data: discountCodes = [], isLoading: isLoadingDiscountCodes } = useQuery({
          queryKey: ['shop-discount'],
          queryFn: async () => {
              const res = await axiosInstance.get('/product/api/get-discount-codes');
              return res?.data || [];
          }
  });  

 const categories = data?.categories || [];
 const subCategoriesData = data?.subCategories || [];

 const selectedCategory = watch("category");
 const regularPrice = watch("regular_price");

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || []:[];
  },[selectedCategory, subCategoriesData]);

  // load product data
  useEffect(() => {
    const load = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/product/api/get-product/${productId}`);
        const product = res?.data?.product;
        if (!product) return;

        // set form values
        setValue('title', product.title);
        setValue('short_description', product.short_description);
        setValue('detailed_description', product.detailed_description);
        setValue('warranty', product.warranty);
        setValue('slug', product.slug);
        setValue('tags', (product.tags || []).join(','));
        setValue('brand', product.brand);
        setValue('category', product.category);
        setValue('subcategory', product.subCategory);
        setValue('video_url', product.video_url);
        setValue('regular_price', product.regular_price);
        setValue('sale_price', product.sale_price);
        setValue('stock', product.stock);
        setValue('sizes', product.sizes || []);
        setValue('colors', product.colors || []);
        setValue('discountCodes', product.discount_codes || []);
        setValue('customProperties', product.custom_properties || {});
        setValue('custom_specifications', product.custom_specifications || {});

        const mappedImages = (product.images || []).map((img:any) => ({ fileId: img.file_id, file_url: img.url }));
        if (mappedImages.length === 0) mappedImages.push(null);
        if (mappedImages.length < 8 && !mappedImages.includes(null)) mappedImages.push(null);
        setImages(mappedImages);
        setValue('images', mappedImages);
      } catch (err) {
        console.error('Failed to load product for edit', err);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId, setValue]);

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

 const applyTransformation = async(transformation: string) => {
  if(!selectedImage || processing) return;
  const cleaned = (selectedImage as string).replace(/[?&]tr=[^&?]*/g, '');
  setProcessing(true);
  setActiveEffect(transformation)

  try {
    const res = await axiosInstance.post('/product/api/transform-product-image', { imageUrl: cleaned, effect: transformation });
    if (res?.data?.transformedUrl) {
      const transformedUrl = res.data.transformedUrl;
      // find image index by matching current selectedImage to slot
      const idx = images.findIndex((img:any) => {
        if (!img) return false;
        if (typeof img === 'string') return img === selectedImage;
        return (img.file_url && img.file_url === selectedImage) || (img.url && img.url === selectedImage);
      });
      const updatedImages = [...images];
      if (idx !== -1) {
        const existing = updatedImages[idx] || {};
        updatedImages[idx] = { fileId: existing.fileId || existing.file_id || existing.fileId || null, file_url: transformedUrl };
      } else {
        // fallback: replace first slot
        updatedImages[0] = { fileId: updatedImages[0]?.fileId || updatedImages[0]?.file_id || null, file_url: transformedUrl };
      }
      setImages(updatedImages);
      setValue('images', updatedImages);
      setSelectedImage(transformedUrl);
    } else {
      console.warn('Transform endpoint did not return transformedUrl', res?.data);
    }
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error('Transform request failed', status, data);
    if (status === 422) {
      const ikError: string | undefined = data?.details?.headers?.['ik-error'] || data?.details?.body;
      alert(data?.message || ikError || 'This enhancement is not supported for this image.');
      if (ikError && /ELIMIT|extensions|not have transparency/i.test(ikError)) {
        try {
          const next = Array.from(new Set([...disabledEffects, transformation]));
          setDisabledEffects(next);
          localStorage.setItem('disabledEffects', JSON.stringify(next));
        } catch (e) {
          console.warn('Failed to persist disabled effect', e);
        }
      }
    } else if (status === 504) {
      alert('Image transform timed out. Try again later.');
    } else {
      alert('Image transform failed. Please try again.');
    }
  } finally {
    setProcessing(false)
  }
 }

  // load persisted disabled effects
  useEffect(() => {
    try {
      const raw = localStorage.getItem('disabledEffects');
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        setDisabledEffects(parsed || []);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleImageChange = async (file: File | null, index:number) => {
    if (!file) return; 
    setPictureUploadingLoader(true)

    try {
      const fileName = await convertFileToBase64(file);

      const response = await axiosInstance.post("product/api/upload-product-image", {fileName} )
      
      const updatedImages = [...images];
      const uploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      }
      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8){
        updatedImages.push(null)
      }
      setImages(updatedImages);
      setValue("images", updatedImages);

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setPictureUploadingLoader(false)

    }
 };
 
 const handleImageRemove = async (index: number) => {
  try {
    const updatedImages = [...images];

    const imageToDelete = updatedImages[index];
    if (imageToDelete && typeof imageToDelete === "object"){
      await axiosInstance.delete("product/api/delete-product-image", {
        data: { fileId: imageToDelete.fileId },
      });
    }

    updatedImages.splice(index, 1)

    if(!updatedImages.includes(null) && updatedImages.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
    setValue("images", updatedImages)
  } catch (error) {
    console.log(error);
  }
 };

  const onSubmit = async (data:any) => {
    if (!productId) { toast.error('Missing product id'); return; }
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/product/api/update-product/${productId}`, data);
      if (response.status === 200) {
        window.location.href = '/dashboard/all-products';
        return;
      }
    } catch (error: any) {
      const resp = error?.response?.data;
      const message = resp?.message || resp?.error || "Failed to update product. Please try again.";
      toast.error(message);
      try {
        if (typeof message === 'string' && /missing required field/i.test(message)) {
          const m = message.match(/missing required field\(s\):\s*(.*)/i);
          if (m && m[1]) {
            const fields = m[1].split(',').map((f: string) => f.trim());
            fields.forEach((field: string) => {
              try { setError(field, { type: 'server', message: 'This field is required' }); } catch (e) { }
            });
          }
        }
      } catch (e) {}
      console.error("Error updating product:", error);
    } finally {
      setLoading(false);
    }
    return;
  }

  return (
    <form
      className='w-full mx-auto p-8 shadow-md rounded-lg text-white'
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3 className='text-2xl font-bold mb-6'>
        Edit Product
      </h3>
      <div className='flex items-center'>
        <Link href={'/dashboard'} className='text-[#80Deea] cursor-pointer'>Dashboard</Link>
        <ChevronRight className=' opacity-[.8]' size={14} />
        <span className='text-[#80Deea] cursor-pointer'>Edit Product</span>
      </div>

      <div className='py-4 w-full flex gap-6'>
        <div className='md:w-[35%]'>
          {images?. length > 0 && (<ImagePlaceHolder
            setOpenImageModal={setOpenImageModal}
            size='765 x 850'
            small={false}
            images={images}
            pictureUploadingLoader={pictureUploadingLoader}
            index={0}
            defaultImage={images[0] && typeof images[0] === 'object' ? images[0].file_url : null}
            onImageChange={handleImageChange}
            setSelectedImage={setSelectedImage}
            onRemove={handleImageRemove}
          />
          )}
          <div className='grid grid-cols-2 gap-3 mt-4'>
          {images.slice(1).map((_:any, index:number) => (
              <ImagePlaceHolder
                key={index}
                setOpenImageModal={setOpenImageModal}
                size='765 x 850'
                pictureUploadingLoader={pictureUploadingLoader}
                small
                images={images}
                defaultImage={images[index + 1] && typeof images[index + 1] === 'object' ? images[index + 1].file_url : null}
                setSelectedImage={setSelectedImage}
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleImageRemove}
              />
          ))}
          </div>
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
              <div className='mt-2'>
              <Input
                type="textarea"
                rows={4}
                cols={10}
                label="Short Description *"
                placeholder="Enter product description for quick view"
                {...register("short_description", { required: "Description is required",
                  validate: (value) => {
                    const wordCount = value.trim().split(/\s+/).length;
                    return wordCount <= 150 || `Description must not exceed 150 words (Current: ${wordCount})`;
                  }
                })}
                className={`${errors.description ? "border-red-500" : ""}`}
              />
            </div>
            <div className='mt-2'>
                <Input
                  label="Tags *"
                  placeholder="apple, mobile, samsung"
                  {...register("tags", { required: "Separate related product tags with commas" })}
                  className={`${errors.tags ? "border-red-500" : ""}`}
                />
            </div>
            <div className='mt-2'>
                <Input
                  label="Warranty *"
                  placeholder="1 year / No warranty"
                  {...register("warranty", { required: "Warranty information is required" })}
                  className={`${errors.warranty ? "border-red-500" : ""}`}
                />
            </div>
            <div className='mt-2'>
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
            <div className='mt-2'>
                <Input
                  label="Brand *"
                  placeholder="apple"
                  {...register("brand", { required: "Brand is required" })}
                  className={`${errors.brand ? "border-red-500" : ""}`}
                />
            </div>
            <div className='mt-2'>
                <ColorSelector control={control} errors={errors} />
            </div>
            <div className='mt-2'>
                <CustomSpecifications control={control} errors={errors} />
            </div>
            <div className='mt-2'>
                <CustomProperties control={control} errors={errors} />
            </div>
            <div className='mt-2'>
              <label className='block font-semibold text-gray-300'>
                Cash On Delivery
              </label>
              <select
              {...register("cash_on_delivery", { 
                required: "Please specify if Cash On Delivery is available" 
              })}
              defaultValue={"Yes"}
              className='w-full border outline-none border-gray-700 bg-transparent'
              >
                <option className='bg-black' value="Yes">Yes</option>
                <option className='bg-black' value="No">No</option>
              </select>
              {errors.cash_on_delivery && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.cash_on_delivery.message as string}
                </p>
              )}
            </div>
          </div>
          <div className='w-2/4'>
              <label>
                Categories *
              </label>
              {isLoading ? (
                <p className="text-gray-500">Loading categories...</p>
              ): isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ):(
                <Controller 
                   name='category'
                   control={control}
                   rules={{required: "Category is required"}}
                   render={({field}) => (
                    <select
                      {...field}
                      className='w-full border outline-none border-gray-700 bg-transparent'
                    >
                      <option value="" className='bg-black'>
                        Select Category
                      </option>
                      {categories?.map((category: string) => (
                        <option 
                        value={category}
                        key={category}
                        className='bg-black'
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                   )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className='mt-2'>
                <label className='block font-semibold text-gray-300'>
                  Subcategory *
                </label>
                 {isLoading ? (
                <p className="text-gray-500">Loading categories...</p>
                    ): isError ? (
                      <p className="text-red-500">Failed to load categories</p>
                    ):(
                      <Controller 
                        name='subcategory'
                        control={control}
                        rules={{required: "Subcategory is required"}}
                        render={({field}) => (
                          <select
                            {...field}
                            className='w-full border outline-none border-gray-700 bg-transparent'
                          >
                            <option value="" className='bg-black'>
                              Select Subcategory
                            </option>
                            {subcategories?.map((subcategory: string) => (
                              <option 
                              value={subcategory}
                              key={subcategory}
                              className='bg-black'
                              >
                                {subcategory}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    )}
                    {errors.subcategory && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.subcategory.message as string}
                      </p>
                    )}
              </div>

              <div className='mt-2'>
                <label className='block font-semibold text-gray-500'>
                  Detailed Description *(Min 100 words)
                </label>
                <Controller
                  name='detailed_description'
                  control={control}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const text = (value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
                      const normalized = text.replace(/\s+/g, ' ').trim();
                      const wordCount = normalized ? normalized.split(' ').filter((w: string) => w).length : 0;
                      return (
                        wordCount >= 100 || 
                        "Detailed description must be at least 100 words");
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                     
                    />
                  )}
                />
                {errors.detailed_description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.detailed_description.message as string}
                      </p>
                    )}
              </div>

              <div className='mt-2'>
                <Input
                  label="Video URL *"
                  placeholder='https://wwww.youtube.com/embed/xyz123'
                  {...register("video_url", { 
                   pattern: {
                    value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                    message:
                      "Invalid youtube URL format. Please provide a valid URL.",
                   },
                   })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className='mt-2'>
                <Input
                  label='Regular Price'
                  placeholder='$100'
                  {...register("regular_price", { 
                    valueAsNumber: true,
                    min: { value: 0, message: "Price cannot be negative" },
                    validate: (value) =>
                      !isNaN(value) || "Please enter a valid number for the price",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className='mt-2'>
                <Input
                  label='Sale Price'
                  placeholder='$100'
                  {...register("sale_price", { 
                    required: 'Sale price is required',
                    valueAsNumber: true,
                    min: { value: 0, message: "Price cannot be negative" },
                    validate: (value) => {
                      if (isNaN(value)) return "Please enter a valid number for the price";
                      if (regularPrice && value >= regularPrice) {
                        return "Sale price must be less than regular price";
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className='mt-2'>
                <Input
                  label='stock'
                  placeholder='100'
                  {...register("stock", { 
                    required: 'Stock is required',
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: { value: 100, message: "Stock cannot exceed 100" }, 
                    validate: (value) => {
                      if (isNaN(value)) return "Please enter a valid number for the stock";
                      if (!Number.isInteger(value)) {
                        return "Stock must be a whole number";
                      }
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className='mt-2'>
                <SizeSelector control={control} error={errors.sizes} />
                {errors.sizes && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sizes.message as string}
                  </p>
                )}
              </div>

              <div className='mt-2'>
                <label className='block font-semibold text-gray-300'>
                  Select Discount Code (optional)
                </label>
                {
                  isLoadingDiscountCodes ? (
                    <p className='text-white'>
                      Loading...
                    </p>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {discountCodes.map((code: any) => (
                        <button
                          key={code.id}
                          type='button'
                          className={`px-3 py-1 rounded-md text-sm font-semibold border ${watch("discountCodes")?.includes(code.id) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-gray-600 hover:bg-gray-700"}`}
                          onClick={() => {
                            const CurrentSelection = watch("discountCodes") || [];
                            const updatedSelection = CurrentSelection?.includes(code.id)
                              ? CurrentSelection.filter((id: string) => id !== code.id)
                              : [...CurrentSelection, code.id];
                            setValue("discountCodes", updatedSelection);
                          }}
                        >
                          {code?.public_name}({code.discountValue}{code.discountType == "percentage" ? "%" : "$"})
                        </button>
                      ))}
                    </div>
                  )}
              </div>
          </div>
      </div>
    </div>
    </div>

    {openImageModal && (
      <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50'>
        <div className='bg-gray-800 p-6 rounded-lg w-[450px] text-white'>
          <div className='flex justify-between items-center pb-3 mb-4'>
            <h2 className='text-lg font-semibold'>
              Enhance Product Image
            </h2>
            <X
              size={20}
              className='cursor-pointer'
              onClick={() => setOpenImageModal(!openImageModal)}
            />
          </div>
          <div 
           className='relative w-full h-[250px] rounded-md overflow-hidden'
          >
            <Image
              src={selectedImage}
              alt='product-image'
              style={{ objectFit: 'contain' }}
              layout='fill'
              unoptimized={
                typeof selectedImage === 'string' && (
                  selectedImage.includes('ik.imagekit.io') || selectedImage.includes('tr=')
                )
              }
          />
          </div>
          {selectedImage && (
          <div className='mt-4 space-y-2'>
            <h3 className='text-white text-sm font-semibold'>
              AI Enhancements
            </h3>
            <div className='grid grid-cols-2 gap-3 mx-h-[250px] overflow-y-auto'>
              {enhancements?.map(({label,effect}) => {
                const isDisabled = processing || disabledEffects.includes(effect);
                return (
                <button
                 key={effect}
                 className={`p-2 rounded-md flex items-center gap-2 ${
                  disabledEffects.includes(effect) ? 'opacity-50 cursor-not-allowed bg-gray-800' : (activeEffect === effect ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600')
                 }`}
                 onClick={() => applyTransformation(effect)}
                 disabled={isDisabled}
                 title={disabledEffects.includes(effect) ? 'This enhancement is not supported for this image' : ''}
                >
                  <Wand size={18} />
                  {label}
                </button>
                )
              })}
            </div>
          </div>
          )}
        </div>
      </div>
    )}

      <div className="mt-6 flex justify-end gap-3">
          {isChanged && (
            <button
              type="button"
              onClick={() => toast('Draft saved (client-only)')}
              className='px-4 py-2 bg-gray-700 text-white rounded-md'
            >
              Save Draft
            </button>
          )}
          <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded-md'
          disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
      </div>
    </form>
  );
}

export default page;
