"use client"
import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form" // Import SubmitHandler
import { useNavigate } from 'react-router-dom';
import { z } from "zod"
import axios, { AxiosError } from 'axios';
import logo_icon from '../assets/logo.png'
import show_icon from '../assets/show.png';
import hide_icon from '../assets/hide.png';
import email_icon from '../assets/apple.png'
import password_icon from '../assets/password.png'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Define the validation schema
const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters ."
  })
})

// Define the LoginFormInputs type based on the form schema
type LoginFormInputs = {
  email: string;
  password: string;
};

export function Login() {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(''); // Error state
  const [success, setSuccess] = useState<string>(''); // Success state
  const [redirect, setRedirect] = useState<boolean>(false); 
  const navigate = useNavigate();

  // Initialize the form using useForm and pass zodResolver with the schema
  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      email: "",
      password: ""
    },
  })

  // Define the submit function
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    setError(''); // Reset error state before submitting
    setSuccess(''); // Reset success state before submitting
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('token', response.data.token);
      setSuccess('Login successful!');
      setRedirect(true);
    } catch (error) {
      if (error instanceof AxiosError) { // Type the error as AxiosError
        const errorMessage = error.response?.status === 401
          ? 'Incorrect email or password.'
          : error.response?.status === 404
          ? 'User not found.'
          : error.response?.status === 400
          ? 'Invalid credentials.'
          : 'An error occurred. Please try again later.';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (redirect) {
      setTimeout(() => {
        navigate('/Dashboard');
      }, 2000); // Delay to allow alert to be seen
    }
  }, [redirect, navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Card className="w-[650px] shadow-2xl p-10">
      <CardHeader>
        <div className='flex flex-col items-center gap-[9px] w-full mt-[30px]'>
          <img src={logo_icon} alt="Logo" />
        </div>
        <CardTitle>
          <div className="flex flex-col items-center">
            Change Management System
            <hr className='w-16 h-1.5 rounded-lg bg-blue-950 mt-2' />
          </div>
        </CardTitle>
        <CardDescription>Welcome Back</CardDescription>
      </CardHeader>


      {/* Conditionally render the Alert if there's an error */}
      {error && (
        <Alert variant="destructive" className="mb-4"> {/* Change variant if needed */}
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
          <Alert variant="success"  className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      
      <Form {...form}>
        <form className='mt-[50px] flex flex-col gap-[25px]' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <FormControl>
                    <Input className='pl-8' placeholder="Email ID" {...field} />
                  </FormControl>
                  <img
                    src={email_icon}
                    alt="Email Icon"
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 cursor-pointer w-[15px] h-[15px]"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative mt-3">
                  <FormControl>
                    <Input className='pl-8' type={passwordVisible ? "text" : "password"} placeholder="Password" {...field} />
                  </FormControl>
                  <img
                    src={password_icon}
                    alt="Password Icon"
                    className="absolute top-1/2 left-2 transform -translate-y-1/2  w-[15px] h-[15px]"
                  />
                  <img
                    src={passwordVisible ? show_icon : hide_icon}
                    alt="Toggle Visibility"
                    onClick={togglePasswordVisibility}
                    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2  w-[15px] h-[15px]"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Button */}
          <Button className='mt-5' type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className='mt-2.5 text-base'>
          Forgot Password?
          <span className='cursor-pointer hover:underline hover:text-orange-500'> Click Here!</span>
        </div>
        <div className="mt-2.5 text-base">
          Don't have an account? <span className='cursor-pointer hover:underline hover:text-orange-500'>Sign Up</span>
        </div>
      </Form>
    </Card>
  );
}

export default Login;
