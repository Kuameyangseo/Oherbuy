"use client"
import React, { useRef, useState } from 'react'
import './pagestyle.css';
import { useRouter } from 'next/navigation';
import {useForm} from 'react-hook-form';
import GoogleButton from '../../../share/components/google-button';
import { Eye, EyeOff} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from "axios"


type FormData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "","", ""]);
  const [showOtp, setShowOtp] =useState(false);
  const [userData, setUserData] =useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  const router = useRouter();

  const {
    register, handleSubmit,
    formState: { errors},  
  } = useForm<FormData>();

  const resendOtp = () => {
    if (canResend) {
      setCanResend(false);
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 60;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
  };

  const signupMutation = useMutation({
    mutationFn: async(data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData)
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      resendOtp()
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async() => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data
    },
    onSuccess: () => {
      router.push("/login")
    },
  });

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data)
   };

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
  <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
    <h1 className='text-3xl font-bold text-center mb- font-poppins'>
      Signup
    </h1>
    <p className='text-center text-gray-500 font-medium py-2 font-poppins'>
      Home . Signup
    </p>
    <div className='w-full flex justify-center'>
      <div className='md:w-[480px] p-8 bg-white rounded-lg shadow-lg '>
        <h3 className='text-2xl font-semibold text-center mb-2 font-poppins'>
          Signup To OherBuy
        </h3>
        <p className='text-center text-gray-500 mb-6 font-poppins'>
          Already have an account? {''}
          <a href='/login' className='text-blue-500 hover:underline'>
            Login
          </a>
        </p>
        <GoogleButton/>
        <div className='flex items-center my-5 text-gray-400 text-sm'>
          <hr className='flex-grow border-gray-400' />
          <span className='mx-2'>or Sign in with Email</span>
          <hr className='flex-grow border-gray-400' />
        </div>
        {!showOtp ? (
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
          <label htmlFor='name' className='block mb-1 font-poppins'>Name</label>
          <input
            type='text'
            id='name'
            {...register('name', { required: 'Name is required' })}
            className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter your name'
          />
          {errors.name && <p className='text-red-500 text-sm mt-1 font-poppins'>{errors.name.message}</p>}

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
              className='w-full px-2 py-2 border mb-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
          <button 
           type='submit'
           disabled={signupMutation.isPending}
           className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg margin-top-4 hover:bg-gray-800 transition-colors font-poppins'
           >
           {signupMutation.isPending ? "Sigining up..." : "Signup"}
          </button>
        </form>
        ) : (
          <div>
            <h3 className='text-1xl font-semibold text-center mb-2 font-poppins'>
              Enter the OTP sent to your email
            </h3>
            <div className='flex justify-center gap-6'>
             {otp.map((data, index) =>(
              <input 
                key={index}
                type="text"
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                maxLength={1}
                className='w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg' 
                value={data}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                 />
             ))}
            </div>
            <button 
              disabled={verifyOtpMutation.isPending}
              onClick={() => verifyOtpMutation.mutate()}
              className='w-full bg-[#008000] text-lg text-white py-2 rounded-md mt-6 hover:bg-green-600 transition-colors font-poppins'
              >
              {verifyOtpMutation.isPending ? "Verifying" : "Verify OTP"}
            </button>
            <p>
              {canResend ? (
                <button 
                  className='text-blue-500 underline mt-4 font-poppins'
                  onClick={resendOtp}
                >
                  Resend OTP
                </button>
              ) : (
                <span className='text-gray-500 mt-4 font-poppins'>
                  Resend OTP in {timer} seconds 
                </span>
              )}
            </p>
            {verifyOtpMutation?.isError &&
            verifyOtpMutation.error instanceof AxiosError && (
              <p className='text-red-500 text-sm mt-2'>
                {verifyOtpMutation.error.response?.data?.message || 
                verifyOtpMutation.error.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

export default Signup