import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Icons } from '@/components/icons';

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/components/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Define the validation schema with Zod
const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
});

// Define the type for form values
type FormValues = z.infer<typeof formSchema>;

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
            { step === 1 ?(
              <>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription >
                  Enter your email to receive an OTP for resetting your password.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Verify OTP</DialogTitle>
                <DialogDescription >
                  An OTP has been sent to your email. Enter it below to reset your password.
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          <ProfileForm step={step} setStep={setStep} />
        </DialogContent>
      </Dialog>
    );
  }
}

function ProfileForm({
  step,
  setStep,
  className,
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
} & React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Zod validation schema
    mode: "onBlur",
  });

  // Handle the form submission and validation
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setIsLoading(true);

    // Simulate a delay (optional), then move to OTP page
    setTimeout(() => {
      setStep(2); // Move to the OTP input step
      setIsLoading(false);
    }, 1000); // Simulate loading delay
  };

  return (
    <>
      {step === 1 && (
        <form
          className={cn("grid items-start gap-4", className)}
          onSubmit={handleSubmit(onSubmit)} // Only move to step 2 if validation passes
        >
          <div className="grid gap-2">
            <Input
              type="email"
              id="email"
              placeholder="Email address"
              autoCapitalize="none"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1 ml-3">
                {errors.email.message}
              </span>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reset Password
          </Button>
        </form>
      )}

      {step === 2 && (
        <div>
          <p className="mb-4">Enter the OTP sent to your email:</p>
          <InputOTP maxLength={6}>
            <InputOTPGroup >
              <InputOTPSlot className="shadow" index={0} />
              <InputOTPSlot className="shadow" index={1} />
              <InputOTPSlot className="shadow" index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot className="shadow" index={3} />
              <InputOTPSlot className="shadow" index={4} />
              <InputOTPSlot className="shadow" index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button className="mt-6">Verify OTP</Button>
        </div>
      )}
    </>
  );
}
