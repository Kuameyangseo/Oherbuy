"use client"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Input from 'apps/seller-ui/src/share/components/input';
import DeleteDiscountCodeModal from 'apps/seller-ui/src/share/components/modals/delete.discount-code';
import axiosInstance from 'apps/seller-ui/src/utils/axiosinstance';
import { AxiosError } from 'axios';
import { ChevronRight, Plus, Trash, X } from 'lucide-react'
import Link from 'next/link';
import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const page = () => {
    const [showModel, setShowModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [selectedDiscount, setSelectedDiscount] = React.useState<any | null>(null);


    const queryClient = useQueryClient();

    const { data: discountCodes = [], isLoading, isError } = useQuery({
        queryKey: ['shop-discount'],
        queryFn: async () => {
            const res = await axiosInstance.get('/product/api/get-discount-codes');
            return res?.data || [];
        }
    });

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            public_name: '',
            discountType: 'percentage',
            discountValue: '',
            discountCode: "",
        }
    })

    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data) => {
            await axiosInstance.post('/product/api/create-discount-code', data);
        } ,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shop-discount']});
            reset();
            setShowModal(false);
        }
    });
    const isCreating = (createDiscountCodeMutation as any).isLoading as boolean;

    const DeleteDiscountCodeMutation = useMutation({
        mutationFn: async (discountId: string) => {
            await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shop-discount']});
            setShowDeleteModal(false);
        }
    });

    const handleDeleteClick = async(discount: any) => {
        setSelectedDiscount(discount);
        setShowDeleteModal(true);
    }

    const onSubmit = (data: any) => {
        if(discountCodes.length >= 8){
            toast.error("You have reached the maximum limit of 8 discount codes.");
        }
        createDiscountCodeMutation.mutate(data);
    }


  return (
    <div className='w-full min-h-screen p-8 '>
        <div className='flex justify-between items-center mb-1'>
            <h2 className='text-2xl text-white font-semibold'>
                Discount Codes
            </h2>
            <button
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
            onClick={() => setShowModal(true)}
            >
                <Plus size={16} />
                <span>Create Discount Code</span>
            </button>
        </div>
        <div className='flex items-center text-white'>
            <Link href={'/dashboard'} className='text-[#80Deea] cursor-pointer'>
              Dashboard
            </Link>
            <ChevronRight className=' opacity-[.8]' size={14} />
            <span className='text-[#80Deea] cursor-pointer'>Discount Codes</span>
        </div>

        <div className='mt-8 bg-gray-800 p-6 rounded-lg shadow-lg'>
            <h3 className='text-xl text-white font-semibold mb-4'>
                Your Discount Codes
            </h3>
            {isLoading ? (
                <p className='text-white'>Loading...</p>
            ) : isError ? (
                <p className='text-white'>Error loading discount codes</p>
            ) : (
                <table className='w-full text-left text-white'>
                    <thead>
                        <tr className='border-b border-gray-800'>
                            <th className='py-2'>Title</th>
                            <th className='py-2'>Type</th>
                            <th className='py-2'>Value</th>
                            <th className='py-2'>Code</th>
                            <th className='py-2'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                                        {discountCodes?.map((discount: any) => (
                                            <tr key={discount?.id}
                                className='border-b border-gray-800 hover:bg-gray-700 transition'>
                                <td className='py-2'>{discount?.public_name}</td>
                                <td className='py-2'>{discount?.discountType === "percentage" 
                                    ? "Percentage" 
                                    : "Flat (₦)"}
                                </td>
                                <td className='py-2'>
                                    {discount?.discountType === "percentage"
                                        ? `${discount.discountValue}%`
                                        : `₦${discount.discountValue}`}
                                </td>
                                <td className='py-2'>{discount.discountCode}</td>
                                <td className='py-2'>
                                    <button 
                                      className='text-blue-500 hover:text-blue-700 mr-4 transition'
                                      onClick={() => handleDeleteClick(discount)}
                                      >
                                        <Trash size={18}/>
                                      </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
             {!isLoading && discountCodes?.length === 0 && (
                <p className='text-center py-4 text-gray-400'>
                    No Discount Codes Available!
                </p>
            )}  
        </div>
       
       {showModel && (
            <div className='fixed inset-2 bg-black bg-opacity-50 flex items-center justify-center '>
                <div className='bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg '>
                    <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-xl font-semibold text-white'>Create Discount Code</h3>
                        <button
                            onClick={() => setShowModal(false)}
                            className='text-gray-400 hover:text-white'
                        >
                            <X size={22} />
                        </button>
                    </div>
                    <form action="" onSubmit={handleSubmit(onSubmit)}>
                    <div className='mb-4'>
                        <Input
                            label='Title (Public Name)'
                            {...register('public_name', { required: true })}
                            className={`text-white border rounded-lg p-2 w-full ${errors.public_name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.public_name && <p className='text-red-500 text-sm'>Title is required</p>}
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-700 mb-2'>Discount Type</label>
                        <Controller
                            name='discountType'
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className={`border rounded-lg p-2 w-full ${errors.discountType ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value='percentage'>Percentage</option>
                                    <option value='flat'>Flat (₦)</option>
                                </select>
                            )}
                        />
                        {errors.discountType && <p className='text-red-500 text-sm'>Type is required</p>}
                    </div>

                    <div className='mb-4'>
                        <Input
                            label='Discount Value'
                            type='number'
                            {...register('discountValue', { 
                              required: "value is required" 
                            })}
                        />
                        {errors.discountValue && <p className='text-red-500 text-sm'>Value is required</p>}
                    </div>

                    <div className='mb-4'>
                        <Input
                            label='Discount Code'
                            {...register('discountCode', { 
                              required: "Discount code is required" })}
                        />
                        {errors.discountCode && <p className='text-red-500 text-sm'>{errors.discountCode.message}</p>}
                    </div>

                        <button 
                            type='submit' 
                            disabled={isCreating}
                            className='bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center gap-2'
                            >
                                <Plus size={22} /> {isCreating ? 'Creating...' : 'Create Code'}
                        </button>
                    {createDiscountCodeMutation.isError && (
                        <p className='text-red-500 text-sm'>
                                {(createDiscountCodeMutation.error as AxiosError<{
                                    message: string;
                                }>
                            )?.response?.data?.message || 'An error occurred while creating the discount code.'}
                        </p>
                    )}
                </form>
                </div> 
            </div> 
        )}

        {
            showDeleteModal && selectedDiscount && (
                <DeleteDiscountCodeModal 
                discount={selectedDiscount}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {setShowDeleteModal(false); DeleteDiscountCodeMutation.mutate(selectedDiscount.id)}}
                />
            )
        }
    </div>
  )
}

export default page
