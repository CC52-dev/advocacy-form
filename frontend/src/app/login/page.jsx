"use client";
import { Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "next-view-transitions";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .regex(/^[a-zA-Z0-9]+$/, "OTP must contain only alphanumeric characters"),
});

export default function LoginPage() {
  const [step, setStep] = useState(0);
  const [resendTimer, setResendTimer] = useState(30);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const mutate = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/api/auth/login/${data.email}`);
      return response.data;
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await mutate.mutateAsync(data);
      toast({
        title: "OTP Sent",
        description: response.message,
        duration: 10000,
      });
      setStep(1);
      setResendTimer(30);
      console.log(response);
    } catch (error) {
      if (error.response?.status === 400) {
        form.setError("email", { message: "User Not Found" });
        toast({
          title: "User Not Found",
          description: error.response.data.message,
          duration: 10000,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          duration: 10000,
          variant: "destructive",
        });
      }
    }
  };

  const otpMutate = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('/api/auth/verify/otp', { email: form.getValues().email, otp: data.otp });
      return response.data;
    },
  });

  const onOtpSubmit = async (data) => {
    try {
      const response = await otpMutate.mutateAsync(data);
      toast({
        title: "Login successful",
        description: response.message,
        duration: 10000,
      });
    } catch (error) {
      if (error.response?.status === 400) {
        otpForm.setError("otp", { message: error.response.data.message });
        toast({
          title: "Invalid OTP",
          description: error.response.data.message,
          duration: 10000,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          duration: 10000,
          variant: "destructive",
        });
      }
    }
  };

  const resendOtpMutate = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/auth/verify/otp/resend/${form.getValues().email}`);
      return response.data;
    },
  });

  const handleResendOtp = async () => {
    try {
      const response = await resendOtpMutate.mutateAsync();
      toast({
        title: "OTP Resent",
        description: response.message,
        duration: 10000,
      });
      setResendTimer(30);
      otpForm.setValue("otp", "");
    } catch (error) {
      if (error.response?.status === 400) {
        otpForm.setError("otp", { message: error.response.data.message });
        toast({
          title: "Resend OTP Error",
          description: error.response.data.message,
          duration: 10000,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          duration: 10000,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Nav activeItem="login" />
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Lock className="size-4" />
            </div>
            Satsankalpa Advocacy
          </Link>
          {step === 0 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>Enter your email to login</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="m@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={mutate.isLoading}
                    >
                      {mutate.isLoading ? "Loading..." : "Login"}
                    </Button>
                    <div className="text-center text-sm">
                      Don't have an account?{" "}
                      <Link
                        href="/signup"
                        className="underline underline-offset-4"
                      >
                        Sign up
                      </Link>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          {step === 1 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">OTP Verification</CardTitle>
                <CardDescription>
                  Enter the OTP sent to your email
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="mx-auto flex w-full max-w-sm items-center justify-center">
                              <InputOTP
                                maxLength={6}
                                {...field}
                                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                              >
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
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Submit
                    </Button>
                  </form>
                </Form>
                <div className="text-center text-sm mt-4">
                  {resendTimer > 0 ? (
                    <span>Resend OTP in {resendTimer} seconds</span>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <span 
                          className="hover:text-grey-800 underline cursor-pointer"
                          style={{ pointerEvents: resendOtpMutate.isLoading ? 'none' : 'auto' }}
                        >
                          {resendOtpMutate.isLoading ? "Resending..." : "Resend OTP"}
                        </span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Requesting a new OTP will invalidate the previous one. You'll need to enter the new OTP when it arrives.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResendOtp}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="text-center text-sm">
                    <span>Not your email? <span className="underline cursor-pointer" onClick={() => setStep(0)} onKeyUp={(e) => { if (e.key === 'Enter') setStep(0); }}>Go back</span></span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
