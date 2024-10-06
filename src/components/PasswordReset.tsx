import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import axios, { AxiosError } from "axios"; // Ensure axios is imported
import { Icons } from '@/components/icons';
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/components/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import hide_icon from "../assets/hide.png"
import show_icon from "../assets/show.png"
import { TriangleAlert } from 'lucide-react';
import { PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"



//email schema for step 1
const emailSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
});

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

//Password schema for step 3
const passwordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  confirmpassword: z.string().min(8, { message: "Confirm Password must be at least 8 characters long" }),
  }).refine(data => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  })




// Define the type for form values
type emailValues = z.infer<typeof emailSchema>;
type passwordValues = z.infer<typeof passwordSchema>;



interface DrawerDialogDemoProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DrawerDialogDemo({ isOpen, setOpen }: DrawerDialogDemoProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [step, setStep] = React.useState(1); // Step 1: Email form, Step 2: OTP form

  if (isDesktop) {
    return (
  <Dialog open={isOpen} onOpenChange={setOpen} modal={true}>
    <DialogTrigger asChild></DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        {step === 1 ? (
          <>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email to receive an OTP for resetting your password.
            </DialogDescription>
          </>
        ) : step === 2 ? (
          <>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              Please enter the one-time password sent to your email.
            </DialogDescription>
          </>
        ) : (
          // Step 3: Password Reset Form
          <>
            <DialogTitle>Set New Password</DialogTitle>
            <DialogDescription>
              Please enter your new password.
            </DialogDescription>
          </>
        )}
      </DialogHeader>
      <ProfileForm step={step} setStep={setStep} setOpen={setOpen} />
    </DialogContent>
  </Dialog>
);
  }
}

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';


function ProfileForm({
  step,
  setStep,
  className,
  setOpen,
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string>(""); // State for success message
  const [error, setError] = React.useState<string>(""); // State for error message
  const [code, setCode] = React.useState<string>("")
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false); //
  const [email, setEmail] = React.useState<string>(""); // State for email
  

  const {
    register:registerEmail,
    handleSubmit:emailSubmit,
    formState: { errors: emailErrors },
  } = useForm<emailValues>({
    resolver: zodResolver(emailSchema), // Zod validation schema
    mode: "onBlur",
  });


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: "" },
  });
 


    const {
    register:registerReset,
    handleSubmit: resetSubmit,
    formState: { errors:resetErrors },
  } = useForm<passwordValues>({
    resolver: zodResolver(passwordSchema), // Zod validation schema
    mode: "onBlur",
  });

    






  // Handle email submission and OTP verification
  const handleEmailSubmit = async (data: emailValues) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/forgot-password`, { 
        email: data.email,
      });

      // Store email in localStorage
      localStorage.setItem("email", data.email);
      setEmail(data.email); // Store the email in state
      setSuccess("Verification code sent.");


      //wait 2 seconds before moving to step 2
      setTimeout(() => {
        setStep(2); 
        setSuccess("") // clear the success message after moving to step 2
      }, 2000)// 2000ms = 2 seconds ;


    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.status === 404
          ? "User not found"
          : "Something went wrong. Please try again.";
        setError(errorMessage);
      } else {
        setError("An unknown error occurred.");
      }
      // Clear the error message after 5 seconds
      setTimeout(() => {
        setError("");
    }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP submission
  const handleOTPSubmit: SubmitHandler<{ pin: string }> = async (data) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/verify-code`, {
        email: localStorage.getItem("email"),
        code: data.pin,
      });
      localStorage.setItem("otpCode", data.pin);
      setSuccess("Code verified, proceed with password reset.");
      setTimeout(() => {
        setStep(3);
        setSuccess("");
      }, 2000);
    } catch (error) {
      setError(
        error instanceof AxiosError && error.response?.status === 400
          ? "Invalid or expired verification code"
          : "Something went wrong. Please try again."
      );
      // Clear the error message after 5 seconds
      setTimeout(() => {
        setError("");
    }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: passwordValues) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/reset-password`, {
        email: localStorage.getItem("email"),
        code: localStorage.getItem("otpCode"),
        password: data.password,
        confirmpassword: data.confirmpassword
      });
      setSuccess("Password reset successfully.");
      localStorage.removeItem("email");
      localStorage.removeItem("otpCode");
      setTimeout(() => {
        setOpen(false);
        window.location.href = "/";
      }, 2000);

    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.status === 401
        ? "password do not match"
        : error.response?.status === 400
        ? "Invalid or expired verification code"
        : 'An error occurred. Please try again later.'
        setError(errorMessage)
      } else {
        setError('An unexpected error occurred.');
      }
      // Clear the error message after 5 seconds
      setTimeout(() => {
        setError("");
    }, 5000);
    } finally {
      setIsLoading(false);
    }

  }






  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className={cn("grid gap-6", className)}>

      {/* Conditionally render the error message */}
      {error && (
        <Alert variant="destructive" className="mb-1 p-4 text-xs">
          <AlertTitle></AlertTitle>
          <AlertDescription className="text-xs flex items-center">
            <TriangleAlert className="mr-2" /> {/* Add margin to the right of the icon */}
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Conditionally render the success message */}
      {success && (
        <Alert variant="success" className="mb-1 p-4 text-xs">
          <AlertTitle></AlertTitle>
          <AlertDescription className="text-xs flex items-center">
            <PartyPopper className="mr-2" />
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Email submission form */}
      {step === 1 && (
        <form
          className={cn("grid items-start gap-4", className)}
          onSubmit={emailSubmit(handleEmailSubmit)}
        >
          <div className="grid gap-2">
            <Input
              type="email"
              id="email"
              placeholder="Email address"
              autoCapitalize="none"
              disabled={isLoading}
              {...registerEmail("email")}
            />
            {emailErrors.email && (
              <span className="text-red-500 text-xs mt-1 ml-3">
                {emailErrors.email.message}
              </span>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send Verification Code
          </Button>
        </form>
      )}

      {/* Step 2: OTP input form */}
      {step === 2 && (
        <Form {...form}>
       <form onSubmit={form.handleSubmit(handleOTPSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <Button className="mt-3" type="submit">Verify OTP</Button>
      </form>
    </Form>
        
      )}

      {step === 3 && (

        <form className={cn("grid items-start gap-4", className)} onSubmit={resetSubmit(handleResetSubmit)}>
  
          {/* New Password Input */}
          <div className="relative">
            <Input
              type={passwordVisible ? "text" : "password"}
              id="NewPassword"
              placeholder="New password"
              autoCapitalize="none"
              disabled={isLoading}
              {...registerReset("password")}
              className="pr-10" // Add padding to the right to make space for the icon
            />
            <img
              src={passwordVisible ? show_icon : hide_icon}
              alt="Toggle Visibility"
              onClick={togglePasswordVisibility}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer w-[15px] h-[15px]"
            />
            {resetErrors.password && (
              <span className="text-red-500 text-xs -mt-2 ml-2">{resetErrors.password.message}</span>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <Input
              type={passwordVisible ? "text" : "password"}
              id="confirmNewPassword"
              placeholder="Confirm password"
              autoCapitalize="none"
              disabled={isLoading}
              {...registerReset("confirmpassword")}
              className="pr-10" // Add padding to the right to make space for the icon
            />
            <img
              src={passwordVisible ? show_icon : hide_icon}
              alt="Toggle Visibility"
              onClick={togglePasswordVisibility}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer w-[15px] h-[15px]"
            />
            {resetErrors.confirmpassword && (
              <span className="text-red-500 text-xs -mt-2 ml-2">{resetErrors.confirmpassword.message}</span>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Change Password"
        )}
        
      </Button>
        </form>

      )}
    </div>
  );
}




