"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import { parsePhoneNumber } from "react-phone-number-input";

// Import location data
import countries from "@/data/countries.json";
import states from "@/data/states.json";

const updateSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.array(z.string()).min(2, "Both country and state are required"),
  addr: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(1, "ZIP code is required").max(10, "ZIP code must be 10 characters or less"),
  interest: z.array(z.string()).min(1, "Please select at least one interest"),
});

// Helper functions for safe data conversion
const safeString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    if (value.trim() === "") return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

const safeLocationArray = (value) => {
  const arr = safeArray(value);
  // Ensure we always have exactly 2 elements for location [country, state]
  return [
    safeString(arr[0] || ""),
    safeString(arr[1] || "")
  ];
};

export default function ApplicantStatus() {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [locationSelectorKey, setLocationSelectorKey] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const authData = useAuthStore();
  
  // Permissions/roles from auth store (used for visibility and status)
  const storePermissions = Array.isArray(authData.permissions) ? authData.permissions : [];
  const storeRoles = Array.isArray(authData.roles) ? authData.roles : [];

  // Extract and safely convert all data
  const userData = {
    firstname: safeString(authData.firstname),
    lastname: safeString(authData.lastname),
    email: safeString(authData.email),
    phone: safeString(authData.phone),
    location: safeLocationArray(authData.location),
    addr: safeString(authData.addr),
    city: safeString(authData.city),
    zip: safeString(authData.zip),
    interest: safeArray(authData.interest),
    appliedAt: authData.appliedAt,
    acceptedAt: authData.acceptedAt,
    permissions: storePermissions,
    roles: storeRoles,
  };

  // Create form with default values
  const form = useForm({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      firstname: userData.firstname,
      lastname: userData.lastname,
      phone: userData.phone,
      location: userData.location,
      addr: userData.addr,
      city: userData.city,
      zip: userData.zip,
      interest: userData.interest,
    },
  });

  // Handle dialog open/close
  const handleDialogChange = (open) => {
    setIsUpdateDialogOpen(open);
    if (open) {
      console.log("Dialog opening with userData:", userData);
      console.log("Location data:", userData.location);
      
      // Reset form with current data when dialog opens
      form.reset({
        firstname: userData.firstname,
        lastname: userData.lastname,
        phone: userData.phone,
        location: userData.location,
        addr: userData.addr,
        city: userData.city,
        zip: userData.zip,
        interest: userData.interest,
      });
      // Force LocationSelector to re-render to reset its internal state
      setLocationSelectorKey(prev => prev + 1);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/api/applicants/updateApplication", data);
      return response.data;
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Your application has been updated successfully.",
        duration: 5000,
      });
      setIsUpdateDialogOpen(false);
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      try {
        const userResponse = await api.post("/api/user/getUser");
        if (userResponse.data && userResponse.data.message !== "Token is Invalid Or Expired") {
          useAuthStore.getState().setUserData(userResponse.data, true);
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update application.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const onSubmit = (values) => {
    updateMutation.mutate(values);
  };

  const getStatusInfo = () => {
    const permissions = userData.permissions ?? [];
    const roles = userData.roles ?? [];
    const allPermissions =
      permissions.length > 0
        ? permissions
        : roles.reduce((acc, role) => {
            if (role.permissions && Array.isArray(role.permissions)) {
              return [...acc, ...role.permissions];
            }
            return acc;
          }, []);
    
    if (allPermissions.includes("applicant")) {
      return {
        status: "Under Review",
        icon: <Clock className="h-5 w-5" />,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        description: "Your application is currently being reviewed by our team.",
      };
    } else if (allPermissions.includes("admin") || allPermissions.some(p => p.startsWith("applicants.") || p.startsWith("users."))) {
      // User has been approved (has permissions other than applicant/disabled)
      return {
        status: "Approved",
        icon: <CheckCircle className="h-5 w-5" />,
        color: "bg-green-100 text-green-800 border-green-200",
        description: "Congratulations! Your application has been approved.",
      };
    } else if (allPermissions.includes("disabled")) {
      return {
        status: "Not Approved",
        icon: <XCircle className="h-5 w-5" />,
        color: "bg-red-100 text-red-800 border-red-200",
        description: "Your application was not approved at this time.",
      };
    }
    return {
      status: "Unknown",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      description: "Status unknown.",
    };
  };

  const statusInfo = getStatusInfo();

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return null;
    }
  };

  // Helper function to format location for display
  const formatLocationDisplay = (locationArray) => {
    if (!Array.isArray(locationArray)) return "Not specified";
    const filtered = locationArray.filter(item => item && item.trim() !== "");
    return filtered.length > 0 ? filtered.join(", ") : "Not specified";
  };

  // Helper function to get country from phone number
  const getCountryFromPhone = (phoneNumber) => {
    if (!phoneNumber) return "US"; // Default fallback
    try {
      const parsed = parsePhoneNumber(phoneNumber);
      return parsed?.country || "US";
    } catch {
      return "US"; // Fallback if parsing fails
    }
  };

  // Only show for applicants (use same permissions/roles from userData, now sourced from auth store)
  const allPermissions =
    userData.permissions?.length > 0
      ? userData.permissions
      : (userData.roles || []).reduce((acc, role) => {
          if (role.permissions && Array.isArray(role.permissions)) {
            return [...acc, ...role.permissions];
          }
          return acc;
        }, []);

  if (!allPermissions.includes("applicant")) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-start">
            Application Status
            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
              {statusInfo.icon}
              {statusInfo.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{statusInfo.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {userData.appliedAt && (
              <div>
                <strong>Applied on:</strong> <code>{formatDate(userData.appliedAt)}</code>
              </div>
            )}
            {userData.acceptedAt && (
              <div>
                <strong>Accepted on:</strong> <code>{formatDate(userData.acceptedAt)}</code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Details */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Personal Information</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> <code>{userData.firstname} {userData.lastname}</code></div>
                <div><strong>Email:</strong> <code>{userData.email}</code></div>
                <div><strong>Phone:</strong> <code>{userData.phone}</code></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Location Details</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Address:</strong> <code>{userData.addr}</code></div>
                <div><strong>City:</strong> <code>{userData.city}</code></div>
                <div><strong>ZIP:</strong> <code>{userData.zip}</code></div>
                <div><strong>Location:</strong> <code>{formatLocationDisplay(userData.location)}</code></div>
              </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-1">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Areas of Interest</h4>
              <div className="flex flex-wrap gap-1">
                {userData.interest.length > 0 ? (
                  userData.interest.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No interests specified</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isUpdateDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Update Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Your Application</DialogTitle>
              <DialogDescription>
                Make changes to your application information. All fields are required.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Doe" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder="+1 (555) 123-4567"
                          defaultCountry={getCountryFromPhone(userData.phone)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
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
                          placeholder="123 Main St" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="San Diego" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="53072" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            "Virtual Knowledge Sessions (USA)",
                            "Research (USA)",
                            "Print and Publications (USA)",
                            "Bharatheeyatha Annual Event (USA)",
                            "Content Management (Global Shared Services)",
                            "Marketing (Global Shared Services)",
                            "Technology (Global Shared Services)",
                            "Charity (USA and Bharat)",
                            "Help me decide",
                          ]}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select Areas of Interest"
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>
                        Please indicate your areas of interest to volunteer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
} 