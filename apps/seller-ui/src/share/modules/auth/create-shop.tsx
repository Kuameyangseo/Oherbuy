import { useMutation } from 'node_modules/@tanstack/react-query/build/modern/useMutation';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { shopCategories } from 'apps/seller-ui/src/utils/shopCategories';

const CreateShop = ({
    sellerId,
    setActiveStep
}:{
    sellerId: string;
    setActiveStep: (step: number) => void;
}) => {
      const {
        register, handleSubmit,
        formState: { errors},  
      } = useForm();

      const shopCreateMutation = useMutation({
         mutationFn: async(data: FormData) => {
           const response = await axios.post(
             `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-seller-shop`,
             data
           );

           return response.data;
    },
    onSuccess: () => {
        setActiveStep(3);
    }
});

    const onSubmit = async(data: any) => {
        const shopData = {
            ...data,
            sellerId
        };
        shopCreateMutation.mutate(shopData);
    }

    const countWords = (text: string) =>  text.trim().split(/\s+/).length;
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
        <div className='flex items-center justify-center'>
            <h3 className='text-3xl font-bold'>
            Create New Shop
            </h3>
        </div>
        <label className='block mb-1 font-poppins'>Name *</label>
          <input
            type='text'
            {...register(
              'name', { required: 'Name is required' ,
              })}
            className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Shop name'
          />

          {errors.name && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.name.message)}</p>}
        
        <label className='block mb-1 font-poppins'>Bio (Max 100 words) *</label>
        <input
          type='text' 
          placeholder='Shop bio'
          className='w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1'
          {...register(
              'bio', { 
                required: 'Bio is required',
                validate: (value: string) =>
                  countWords(value) <= 100 || 'Bio must be 100 words or less'
          })}
        />
        {errors.bio && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.bio.message)}</p>}


        <label className='block mb-1 font-poppins'>Address *</label>
        <input
          type='text'
          placeholder='Shop location'
          className='w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1'
          {...register(
              'address', {
                required: 'Address is required',
          })}
        />
        {errors.address && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.address.message)}</p>}
        
        <label className='block mb-1 font-poppins'>Opening Hours *</label>
        <input
          type='text'
          placeholder='e.g., 9:00 AM - 9:00 PM'
          className='w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1'
          {...register(
              'opening_hours', {
                required: 'Opening hours are required',
          })}
        />
        {errors.opening_hours && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.opening_hours.message)}</p>}

        <label className='block mb-1 font-poppins'>website *</label>
        <input
          type='url'
          placeholder='https://www.yourshop.com'
          className='w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1'
          {...register(
              'website', {
                pattern: {
                  value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/,
                  message: 'Enter a valid URL format',
                }
          })}
        />
        {errors.website && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.website.message)}</p>}

        <label className='block mb-1 font-poppins'>Category *</label>
        <select 
        className='w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1'
        {...register('category', { required: 'Category is required' })}>
          <option value="">Select a category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.category.message)}</p>}

        <button 
           type='submit'
           disabled={shopCreateMutation.isPending}
           className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg'
           >
            {shopCreateMutation?.isPending ? "Creating shop..." : "Create"}
          </button>
         

      </form>
      {/* Add your shop creation form or components here */}
    </div>
  );
};

export default CreateShop;
