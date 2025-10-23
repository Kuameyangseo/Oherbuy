"use client"
import React, { useState } from 'react'
import './pagestyle.css';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import {useForm} from 'react-hook-form';
import { Eye, EyeOff} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

type formData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register, handleSubmit,
    formState: { errors},  
  } = useForm<formData>();

  const loginMutation = useMutation({
    mutationFn: async(data: formData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-seller`, 
        data,
        { withCredentials: true }
        
      );
      return response.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push('/');
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error) && error.response) {
        setServerError(error.response.data.message || 'Login failed. Please try again.');
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    },
  });

  const onSubmit = (data: formData) => {
    loginMutation.mutate(data);
  };

  return (
  <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
    <h1 className='text-3xl font-bold text-center mb- font-poppins'>
      Login
    </h1>
    <p className='text-center text-gray-500 font-medium py-2 font-poppins'>
      Home . Login
    </p>
    <div className='w-full flex justify-center'>
      <div className='md:w-[480px] p-8 bg-white rounded-lg shadow-lg '>
        <h3 className='text-2xl font-semibold text-center mb-2 font-poppins'>
          Login To OherBuy
        </h3>
        <p className='text-center text-gray-500 mb-6 font-poppins'>
          Don't have an account? {''}
          <a href='/signup' className='text-blue-500 hover:underline'>
            Sign up
          </a>
        </p>
        <div className='flex items-center my-5 text-gray-400 text-sm'>
          <hr className='flex-grow border-gray-400' />
          <span className='mx-2'>or Sign in with Email</span>
          <hr className='flex-grow border-gray-400' />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
          <label htmlFor='email' className='block mb-1 font-poppins'>Email</label>
          <input
            type='email'
            id='email'
            {...register(
              'email', 
              { required: 'Email is required' ,
                pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Invalid email address',
               },
              },
            )}
            className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter your email'
          />
          {errors.email && <p className='text-red-500 text-sm mt-1 font-poppins'>{errors.email.message}</p>}

          <label htmlFor='password' className='block mb-1 font-poppins'>Password</label>
          <div className='relative'>
            <input
              type={passwordVisible ? 'text' : 'password'}
              id='password'
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
               })}
              className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter your password'
            />
            <button
              type='button'
              onClick={() => setPasswordVisible(!passwordVisible)}
              className='absolute right-2 top-2 text-gray-500'
            >
              {passwordVisible ? <Eye/> : <EyeOff/>}
            </button>
          </div>
          {errors.password && <p className='text-red-500 text-sm mt-1 font-poppins'>{errors.password.message}</p>}

          <div className="flex justify-between items-center my-4">
               <label className="flex items-center text-gray-600">
                <input 
                  type="checkbox" 
                  className='mr-2' 
                  checked={rememberMe} 
                  onChange={() => setRememberMe(!rememberMe)} />
                  Remember me
               </label>
               <Link href={'/forgot-password'} className='text-blue-500 text-sm'>
                 Forgot Password
               </Link>
          </div>
          <button 
           type='submit'
           disabled={loginMutation.isPending}
           className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg'
           >
            {loginMutation?.isPending ? "Logging in..." : "Login"}
          </button>
          {serverError && (
            <p className='text-red-500 text-sm mt-2'>{serverError}</p>
          )}
        </form>
      </div>
    </div>
  </div>
  )
}

export default Login