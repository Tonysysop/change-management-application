import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import email_icon from '../assets/apple.png';
import password_icon from '../assets/password.png';
import show_icon from '../assets/show.png';
import hide_icon from '../assets/hide.png';
import logo_icon from '../assets/logo.png';

import { Button } from '@/components/ui/button';

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Validation schema using Zod
const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

// Define the form data type
type LoginFormInputs = z.infer<typeof schema>;

export const Login: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(''); // Error state
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    setError(''); // Reset error state before submitting
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      navigate('/Dashboard');
    } catch (error: any) {
      const errorMessage =
        error.response?.status === 401
          ? 'Incorrect email or password.'
          : 'An error occurred. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="flex flex-col mx-auto mt-[60px] w-[600px] bg-whitesmoke pb-[30px] overflow-hidden shadow-lg">
      <div className='flex flex-col items-center gap-[9px] w-full mt-[30px]'>
        <img src={logo_icon} alt="Company Logo" />
        <div className="text-orange-500 text-[35px] font-bold">Change Management System</div>
        <div className="w-[61px] h-[6px] bg-[#003380] rounded-[9px]"></div>
        <div className="text-[20px] font-bold text-[#003380] ">Welcome Back</div>
      </div>
      <form className='mt-[55px] flex flex-col gap-[25px] ' onSubmit={handleSubmit(onSubmit)}>
        <div className="relative flex items-center m-auto w-[460px] h-[60px] bg-[#eaeaea] rounded-[6px]">
          <img className='mx-[30px] w-[15px] h-[15px] object-contain' src={email_icon} alt="Email Icon" />
          <input className='h-[50px] w-[400px] bg-transparent border-none outline-none text-[#797979] text-[19px]'
            type="email" 
            placeholder='Email ID' 
            {...register("email")}
            disabled={loading} 
          />
          {errors.email && <div className='absolute -bottom-[20px] left-0 w-full text-red-500 text-[14px]'>{errors.email.message}</div>}
        </div>
        <div className="relative flex items-center m-auto w-[460px] h-[60px] bg-[#eaeaea] rounded-[6px]">
          <img className='mx-[30px] w-[15px] h-[15px] object-contain' src={password_icon} alt="Password Icon" />
          <input className='h-[50px] w-[400px] bg-transparent border-none outline-none text-[#797979] text-[19px]' 
            type={passwordVisible ? 'text' : 'password'}
            placeholder='Password'
            {...register("password")}
            disabled={loading}
          />
          <img  
            src={passwordVisible ? show_icon : hide_icon}
            alt="Toggle Visibility"
            className='mx-[30px] w-[15px] h-[15px] object-contain'
            onClick={togglePasswordVisibility}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          />
          {errors.password && <div className="absolute -bottom-[20px] left-0 w-full text-red-500 text-[14px]">{errors.password.message}</div>}
        </div>
        {error && <div className="bg-[#d4edda] text-[#155724] border border-[#c3e6cb] rounded-md p-2.5 mt-5 text-center w-[220px] max-w-full">{error}</div>} {/* Show error message */}
        <div className="flex gap-[30px] my-[20px] mx-auto">
          <Button  
          type="submit" className="flex justify-center items-center w-[220px] h-[59px] text-white bg-[#003380] rounded-full text-[19px] font-bold cursor-pointer transition-colors duration-300 ease-in-out" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
        <div className="pl-[17px] mt-3.75 text-[#797979] text-[17px]">
          Forgot Password? 
          <Link to="/ForgotPassword">
            <span className='text-[#4c00b4] cursor-pointer text-[17px] hover:underline hover:text-orange-500'> Click Here!</span> 
          </Link>
        </div>
        <div className="pl-[17px] mt-[10px] text-[#797979] text-[17px]">
          Don't have an account? <Link className='hover:text-orange-600 text-[17px] hover:underline text-[#4c00b4] cursor-pointer' to="/signup">Sign Up</Link>
        </div>

      </form>
    </div>
  );
};

export default Login;
