"use client";

import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import LocationSelector from "@/components/ui/location-input";
import { MultiSelect } from "@/components/ui/multi-select";
import api from "@/lib/axios";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import {useRouter} from "next/navigation";

function MyForm() {
  const [countryName, setCountryName] = useState("");
  const [stateName, setStateName] = useState("");
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [disabled, setDisabled] = useState(false);
  // REMINDER: Update the Schema in the bakcend as well and in the DB schema
  const formSchema = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    phone: z.string().min(1, "Phone number is required"),
    email: z
      .string()
      .email("Invalid email address")
      .superRefine(async (val, ctx) => {
        if (val && step === 1) {
          try {
          const response = await api.post(
            `/api/form/checkemail/${String(val)}`
          );
        
          if (!response.data.result) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
                          message: "Your Application is being reviewed, please check your inbox for a confirmation email and updates regarding your application status. If you would like to edit your application, please Sign In.",
                        });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Email is already being used, Sign in instead?",
            });
          } 
        } catch (error) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "API Error: Please try again later",
          });
          toast({
            title: "Error",
            description: "API Error: Please try again later",
            variant: "destructive",
          });
        }
      }}),
    location: z.array(z.string()).min(2, "Both country and state are required"),
    addr: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    zip: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
    interest: z.array(z.string()).min(1, "Please select at least one interest"),
    over16: z.boolean().refine((val) => val === true, {
      message: "You must be over 16 years old",
    }),
  });
  const mutate = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/form/new", data);
      return response.data;
    },
    onError: (error) => {
      if (error.response?.status === 400) {
        toast({
          title: "Submission Error",
          description: error.response.data.message,
          duration: 10000,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again later.",
          duration: 10000,
          variant: "destructive",
        });
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      phone: "",
      email: "",
      location: ["", ""],
      addr: "",
      city: "",
      zip: "",
      interest: [],
      over16: false,
    },
    mode: "onSubmit",
  });

  async function onSubmit(values) {
    try {
      // setDisabled(true);
      await mutate.mutateAsync(values);
      toast({
        title: "Success",
        description:
          "Form submitted successfully. You will be contacted via email or text shortly.",
        duration: 10000,
      });
      setStep(4);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  const nextStep = async () => {
    try {
    setDisabled(true);
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["email", "firstname", "lastname", "phone"]);
    } else if (step === 2) {
      isValid = await form.trigger(["location", "addr", "city", "zip"]);
    }
    
    setDisabled(false);
    if (isValid) {
      setStep(step + 1);
    }
  }
  catch (error) {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again later.",
      duration: 10000,
      variant: "destructive",
    });
    setDisabled(false);
  }


  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisabled(true);
    const isValid = await form.trigger(["interest", "over16"]);
    if (isValid) {
      form.handleSubmit(onSubmit)(e);
    }
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8 py-10 text-left">
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@doe.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>This is your email</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel>Phone number</FormLabel>
                    <FormControl className="w-full">
                      <PhoneInput
                        placeholder="(111) 222 3434"
                        {...field}
                        defaultCountry="US"
                      />
                    </FormControl>
                    <FormDescription>Enter your phone number.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={nextStep} disabled={disabled}>
                {disabled ? (
                  <>
                    {" "}

                    Next
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                  </>
                ) : (
                  "Next"
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Country & State</FormLabel>
                    <FormControl>
                      <LocationSelector
                        onCountryChange={(country) => {
                          setCountryName(country?.name || "");
                          form.setValue(field.name, [
                            country?.name || "",
                            stateName || "",
                          ]);
                        }}
                        onStateChange={(state) => {
                          setStateName(state?.name || "");
                          form.setValue(field.name, [
                            form.getValues(field.name)[0] || "",
                            state?.name || "",
                          ]);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      If your country has states, it will be appear after
                      selecting country
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="440 North Barranca Ave"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your street address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="San Diego"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the city you live in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip</FormLabel>
                        <FormControl>
                          <Input placeholder="53072" type="text" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your zip code, a 5 digit number. Also known as
                          a postal code.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="button" onClick={prevStep} disabled={disabled}>
                Previous
                </Button>
                <Button type="button" onClick={nextStep} disabled = {disabled}>
                {disabled ? (
                  <>
                    {" "}
                    Next
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                  </>
                ) : (
                  "Next"
                )}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <FormField
                control={form.control}
                name="interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Areas of Interest</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={[
                          "Thapo Kshetra revival (Bharat)",
                          "Vedic Worship (USA)",
                          "Virtual Knowledge Sessions",
                          "Research (USA)",
                          "Print and Publications (USA)",
                          "Bharatheeyatha Annual Event (USA)",
                          "Content Management (Global Shared Services)",
                          "Marketing (Global Shared Services)",
                          "Technology (Global Shared Services)",
                          "Charity (USA and Bharat)",
                          "Will participate in the near future",
                        ]}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select Areas of Interest"
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Please indicate your areas of interest to volunteer; Click
                      on the input to select options
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="over16"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-1">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 mt-1"
                      />
                    </FormControl>
                    <FormLabel>I confirm that I am over 16 years old</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="button" onClick={prevStep} disabled={disabled}>
                  Previous
                </Button>
                <Button type="submit" disabled={disabled}>
                  {disabled ? (
                    <>
                      Submitting...
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />

                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </>
          )}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.9,
                  scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                }}
                className="w-24 h-24 mb-6"
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 52 52"
                  className="w-full h-full"
                  role="img"
                  aria-label="Checkmark Icon"
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="24"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="2"
                  />
                  <motion.path
                    d="M14.1 27.2l7.1 7.2 16.7-16"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                </motion.svg>
              </motion.div>
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">
                  Thank you for signing up!
                </h1>
                <p className="text-gray-600">
                  We have received your registration and will get back to you
                  soon.
                </p>
              </div>
            </div>
          )}
        </form>
      </Form>
    </>
  );
}

export default function Signup() {
  const isLogggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  useEffect(() => {
    if (isLogggedIn) {
      router.push("/app");
    }
  }, [isLogggedIn, router]);
  return (
    <>
      { /*<Nav activeItem="signup" /> */}
      <div className="min-h-[100vh] flex flex-col md:flex-row flex-1 w-full mx-auto">
        <Card className="md:w-1/2 bg-gray-100 p-4 sm:p-6 md:p-8 m-3 md:mx-8 lg:mx-20 md:my-20 mb-0 mt-20 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">
            Satsankalpa Advocacy Membership
          </h2>
          <div className="text-gray-600 space-y-4">
            <p>Satsankalpa Foundation is based in USA and Bharat.</p>
            <p>
              'Satsankalpa Foundation Inc' is a 501(C)(3) non-profit
              organization in USA with a primary mission to positively impact
              peace and progress in humanity by reviving ancient Sanathana
              culture.
            </p>
            <p>
              'Sri Sivananda Satsankalpa Foundation' is a 80G non-profit
              organization in Bharat focused on revival of Thapo Kshetras and
              other activities
            </p>
            <p>
              Advocacy membership program's objective is to build a strong
              network of global supporters to further both the Foundations'
              vision, mission and activities.
            </p>
            <p>
              If you would like to become a member, please provide your details
              in the form below by indicating your areas of interest. Membership
              is free but one should be 16 years of age and above. Your personal
              details will be kept confidential.
            </p>
            <p>If you are already a member, you don't need to apply again.</p>
            <p>For any questions please email: engage@satsankalpa.org</p>
            <p>
              USA:{" "}
              <a
                href="https://satsankalpa.org/"
                className="text-blue-600 hover:underline"
              >
                https://satsankalpa.org/
              </a>
            </p>
            <p>
              India:{" "}
              <a
                href="https://satsankalpa.in"
                className="text-blue-600 hover:underline"
              >
                https://satsankalpa.in
              </a>
            </p>
          </div>
        </Card>
        <div className="md:w-1/2 p-4 sm:p-6 md:p-8 my-auto md:h-auto">
          <>
            <div className="hidden md:block">
              <MyForm />
            </div>
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button className="w-full bg-primary text-white">
                    Open Registration Form
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerTitle />
                  <div className="p-4 max-h-[90vh] overflow-y-auto">
                    <MyForm />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </>
        </div>
      </div>
      {/*<Footer /> */}
    </>
  );
}
