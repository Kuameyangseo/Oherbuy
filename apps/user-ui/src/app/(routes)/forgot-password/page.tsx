"use client"
import React, { useRef, useState, } from 'react'
import './pagestyle.css';
import { useRouter } from 'next/navigation';
import {useForm} from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

type formData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "","", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register, handleSubmit,
    formState: { errors},  
  } = useForm<formData>();

  const requestOtpMutation = useMutation({
    mutationFn: async({email}: {email: string}) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-user-password`, 
        {email}
      );
      return response.data;
    },
    onSuccess: (_, {email}) => {
      setUserEmail(email);
      setStep('otp');
      setServerError(null);
      setCanResend(false);
      resendOtp();
    },
    onError: (error: AxiosError) => {
     const errorMessage =
     (error.response?.data as { message: string })?.message ||
     error.message ||
     "Invalid OTP, please try again.";
     setServerError(errorMessage);
    },
  });

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

  const verifyOtpMutation = useMutation({
    mutationFn: async() => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-user`,
        {
          ...userEmail && {email: userEmail},
          otp: otp.join(""),
        }
      );
      return response.data
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
      (error.response?.data as { message: string })?.message ||
      error.message ||
      "Invalid OTP, please try again.";
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`,
        {
          ...userEmail && {email: userEmail},
          newPassword: password,
        }
      );
      return response.data
    },
    onSuccess: () => {
      setStep("email");
      toast.success("Password reset successful. Please login with your new password."
      );
      setServerError(null);
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
      (error.response?.data as { message: string })?.message ||
      error.message ||
      "Failed to reset password, please try again.";
      setServerError(errorMessage);
    },
  });

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
 
  const onSubmitEmail = ({email}: {email: string}) => {
    requestOtpMutation.mutate({email});
  };

  const onSubmitPassword = ({password}: {password: string}) => {
    resetPasswordMutation.mutate({ password });
  }

  return (
  <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
    <h1 className='text-3xl font-bold text-center mb- font-poppins'>
      Forgot Password 
    </h1>
    <p className='text-center text-gray-500 font-medium py-2 font-poppins'>
      Home . Forgot Password
    </p>
    <div className='w-full flex justify-center'>
      <div className='md:w-[480px] p-8 bg-white rounded-lg shadow-lg '>
        <h3 className='text-2xl font-semibold text-center mb-2 font-poppins'>
          Forgot Password
        </h3>
        <p className='text-center text-gray-500 mb-6 font-poppins'>
          Go back to? {''}
          <a href='/login' className='text-blue-500 hover:underline'>
            Login
          </a>
        </p>
        {step === "email" && (
          <form onSubmit={handleSubmit(onSubmitEmail)} className='space-y-2'>
            <label htmlFor='email' className='block mb-1 font-poppins'>Email</label>
            <input
              type='email'
              id='email'
              {...register(
                'email',
                {
                  required: 'Email is required',
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

            <button 
             type='submit'
             disabled={requestOtpMutation.isPending}
             className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg'
             >
              {requestOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
            </button>
            {serverError && (
              <p className='text-red-500 text-sm mt-2'>{serverError}</p>
            )}
          </form>
        )}
        {step === "otp" && (
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
                  {(verifyOtpMutation.error.response?.data as { message?: string })?.message || 
                  verifyOtpMutation.error.message}
                </p>
              )}
           </div>
        )}
        {step === "reset" && (
          <>
          <h3>Reset Password</h3>
          <form onSubmit={handleSubmit(onSubmitPassword)} className='space-y-2'>
            <label htmlFor='password' className='block mb-1 font-poppins'>New Password</label>
            <input
              type='password'
              id='password'
              {...register(
                'password', 
                { required: 'Password is required' ,
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                },
              )}
              className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter your new password'
            />
            {errors.password && <p className='text-red-500 text-sm mt-1 font-poppins'>{errors.password.message}</p>}

            <button 
             type='submit'
             disabled={resetPasswordMutation.isPending}
             className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg'
             >
              {resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"}
            </button>
            {serverError && (
              <p className='text-red-500 text-sm mt-2'>{serverError}</p>
            )}
          </form>
          </>
        )}
      </div>
    </div>
  </div>
  )
}

export default ForgotPassword