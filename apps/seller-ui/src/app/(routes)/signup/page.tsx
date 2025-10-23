"use client"
import React, { useRef, useState } from 'react'
import './pagestyle.css';
import {useForm} from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from "axios";
import { countries } from 'apps/seller-ui/src/utils/countries';
import CreateShop from 'apps/seller-ui/src/share/modules/auth/create-shop';
// import next from 'next'; // Removed unused/incorrect import


type SellerFormData = {
  name: string;
  email: string;
  phone_number: string;
  country: string;
  password: string;
};

const Signup = () => {
  const [activeStep, setActiveStep] = useState(2);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "","", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [sellerData, setSellerData] = useState<SellerFormData | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  

  const {
    register, handleSubmit,
    formState: { errors },  
  } = useForm();
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

  

// ...existing code...

const signupMutation = useMutation({
  mutationFn: async (data: SellerFormData) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
      data
    );
    return response.data;
  },
  onSuccess: (_, formData) => {
    setSellerData(formData);
    setShowOtp(true);
    setCanResend(false);
    setTimer(60);
    resendOtp();
  }
});
// ...existing code...

  const verifyOtpMutation = useMutation({
    mutationFn: async() => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`,
        {
          ...sellerData,
          otp: otp.join(""),
        }
      );
      return response.data
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  const onSubmit = (data: any) => {
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

    // Automatically verify OTP when all digits are entered
    if (newOtp.every(digit => digit !== "")) {
      verifyOtpMutation.mutate();
    }
  }
};

const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === "Backspace" && !otp[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
  if (event.key === "Enter") {
    verifyOtpMutation.mutate();
  }
};

const connectHubtel = async () => {
  if (!sellerData) {
    alert("Seller data is missing.");
    return;
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-hubtel-payout`,
      {
        recipientName: sellerData.name,
        recipientNumber: momoNumber, // e.g., "024XXXXXXX"
        amount: payoutAmount,
        channel: "mtn-gh", // or "vodafone-gh", "airteltigo-gh", "bank"
      }
    );
    alert("Hubtel payout initiated: " + response.data.status);
  } catch (error) {
    throw new Error("Error initiating Hubtel payout: " + error);
    }
};
  return (
      <div className='w-full flex flex-col items-center pt-5 min-h-screen '>
        {/* stepper */}
        <div className='relative flex md:w-[50%] items-center justify-between mb-8 '>
          <div className='absolute top-[30%] left-0 w-[80%] md:w-[95%] h-[0.8px] bg-gray-400 -z-10'/>
          {[1,2,3].map((step) => (
             <div key={step} >
              <div className={` border border-green-300 w-10 h-10 rounded-full flex items-center justify-center text-white ${
                step <= activeStep ? "bg-green-600" : "bg-gray-200" 
              }`}
              >
               {step}
              </div>
              <span className='ml-[-15px]'>
                {step == 1 ? "Create Account" : step == 2 ? "Setup Shop" : "Add Bank"}
              </span>
             </div>
           ))}
        </div>

        {/* step content */}
        <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
           {activeStep == 1 && (
            <>
             {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-2'>
                <div className='flex items-center justify-center'>
                  <h3 className='text-3xl font-bold'>
                  Create Account
                </h3>
                </div>
              <label htmlFor='name' className='block mb-1 font-poppins'>Name</label>
              <input
                type='text'
                id='name'
                {...register('name', { required: 'Name is required' })}
                className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your name'
              />
              {errors.name && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.name.message)}</p>}

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
              {errors.email && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.email.message)}</p>}

              <label className='block mb-1 font-poppins'>Phone Number</label>
              <input
                type='tel'                
                className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='+233*********'
                {...register(
                  'phone_number', 
                  { required: 'Phone number is required' ,
                    pattern: {
                    value: /^[+][0-9]{10,14}$/,
                    message: 'Invalid phone format',
                  },
                   minLength: {
                      value: 10,
                      message: 'Phone number must be 10 digits',
                  },
                  maxLength: {
                    value: 15,
                    message: 'Phone number must be not be more than 15 digits'
                  }
                  },
                )}
              />
              {errors.phone_number && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.phone_number.message)}</p>}

              <label className='block mb-1 font-poppins'>Country</label>
              <select className='w-full p-2 border border-gray-300 outline-0 rounded-[4px]'
              {...register("country", {required: 'Country is required'})}
               >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              {errors.country && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.country.message)}</p>}

  
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
              {errors.password && <p className='text-red-500 text-sm mt-1 font-poppins'>{String(errors.password.message)}</p>}
              <button 
              type='submit'
              disabled={signupMutation.isPending}
              className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg margin-top-4 hover:bg-gray-800 transition-colors font-poppins'
              >
              {signupMutation.isPending ? "Sigining up..." : "Signup"}
              </button>

              {signupMutation.isError &&
                signupMutation.error instanceof AxiosError && (
                  <p className='text-red-500 text-sm mt-1 font-poppins'>
                    {signupMutation.error.response?.data?.message || 
                     signupMutation.error.message}
                  </p>
                )
              }

              <p className='text-center text-gray-500 mb-6 font-poppins'>
                Already have an account? {''}
                <a href='/login' className='text-blue-500 hover:underline'>
                  Login
                </a>
              </p>
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
            </>
           )}
           {activeStep == 2 && (
            <CreateShop sellerId={sellerId!} setActiveStep={setActiveStep} />
           )}
           {activeStep == 3 && (
              <div>
                <h3 className='text-3xl font-bold text-center mb-4'>
                  Add Bank Details
                </h3>
                <br />
                <label className='block mb-1 font-poppins'>Bank Code</label>
                <input
                  type='text'
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2'
                  placeholder='Enter bank code (e.g., 058 for GTBank)'
                />
                <label className='block mb-1 font-poppins'>Account Number</label>
                <input
                  type='text'
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4'
                  placeholder='Enter account number'
                />
                <label className='block mb-1 font-poppins'>Momo Number</label>
                <input
                  type='text'
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2'
                  placeholder='Enter Momo number (e.g., 024XXXXXXX)'
                />
                <label className='block mb-1 font-poppins'>Payout Amount</label>
                <input
                  type='number'
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4'
                  placeholder='Enter payout amount'
                />
                <button
                  className='w-full m-auto flex items-center justify-center gap-3 text-lg bg-slate-500 text-white py-2 rounded-lg hover:bg-slate-600 transition-colors font-poppins'
                  onClick={connectHubtel}
                  type='button'
                >
                  Connect with Hubtel Momo
                </button>
              </div>
           )}
        </div>
      </div>
  )}

export default Signup