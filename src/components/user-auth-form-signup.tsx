"use client";

import { useState, useEffect } from 'react';
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import show_icon from '../assets/show.png';
import hide_icon from '../assets/hide.png';
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios, { AxiosError } from 'axios';
import { Link,useNavigate } from 'react-router-dom';



// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Define the validation schema
const formSchema = z.object({
  fullname: z.string().min(5,{
    message: "Full name is required"
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Define the type for form values
type FormValues = z.infer<typeof formSchema>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [error, setError] = useState<string>(''); // Error state
  const [success, setSuccess] = useState<string>(''); // Success state
  const [redirect, setRedirect] = useState<boolean>(false); 
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  });

// Handle error alert timeout (5 seconds)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000); // 5000ms = 5 seconds

      return () => clearTimeout(timer); // Clean up the timer when component unmounts or error changes
    }
  }, [error]);



  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log('Submitting:', data); // Log the data
    setIsLoading(true);
    setError(''); // Reset error state before submitting
    setSuccess(''); // Reset success state before submitting
    try {
      await axios.post(`${API_URL}/register`, {
        fullname: data.fullname,
        email: data.email,
        password: data.password,
      });

      setSuccess('Registration successful!. Redirecting to Login page......');
      setRedirect(true);


  } catch (error) {
    if (error instanceof AxiosError) {
      // Handle specific error statuses from backend
      const errorMessage = error.response?.status === 400
      ? 'a user with this email already exist'
      : error.response?.status === 500
      ? 'Internal server error. Please try again later.'
      : 'An unknown error occurred. Please try again.'
    
    setError(errorMessage);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (redirect) {
      setTimeout(() => {
        navigate('/');
      }, 3000); // Delay to allow alert to be seen
    }
  }, [redirect, navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>

       {/* Conditionally render the Alert if there's an error */}
      {error && (
        <Alert variant="destructive" className="mb-1 p-4 text-xs">
          <AlertTitle >Error !!</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-2">
          <AlertTitle>Success!!!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-4">
          <Label className="sr-only" htmlFor="name">
              fullname
            </Label>
            <Input
              id="name"
              placeholder="Full Name"
              type="text"
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              disabled={isLoading}
              {...register("fullname")}
            />
            {errors.fullname && <span className="text-red-500 text-xs -mt-2 ml-2">{errors.fullname.message}</span>}
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Email Id"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="text-red-500 text-xs -mt-2 ml-2">{errors.email.message}</span>}
            
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="Password"
                type={passwordVisible ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect="off"
                disabled={isLoading}
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              <img
                src={passwordVisible ? show_icon : hide_icon}
                alt="Toggle Visibility"
                onClick={togglePasswordVisibility}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer w-[15px] h-[15px]"
              />
            </div>
            {errors.password && <span className="text-red-500 text-xs -mt-2 ml-2 ">{errors.password.message}</span>}
          </div>

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin " />
            )}
            Create Account
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        GitHub
      </Button>
    </div>
  );
}