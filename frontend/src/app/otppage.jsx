"use client";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function VerifyPage() {
  const { toast } = useToast();
  
  const handleSubmit = () => {
    toast({
      variant: "destructive",
      title: "Incorrect code",
      description: "The verification code you entered is incorrect. Please try again.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] p-6">
        <div className="flex flex-col items-center space-y-6">
          <svg 
            aria-label="Vercel logomark" 
            height="64" 
            width="74"
            role="img" 
            viewBox="0 0 74 64" 
            style={{
              width: '74px',
              height: '64px',
              overflow: 'visible'
            }}
          >
            <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" fill="black"></path>
          </svg>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Vercel Account Spam Detected
            </h1>
            <p className="text-gray-600">
              Please verify your phone number
            </p>
            <p className="text-sm text-gray-500">
              OTP Sent to +1(***)***-2379
            </p>
          </div>

          <Input
            type="text"
            maxLength={6}
            placeholder="Enter verification code"
            className="text-center"
            onChange={(e) => {
              if (e.target.value.length === 6) {
                console.log("OTP entered:", e.target.value);
              }
            }}
          />

          <Button 
            className="w-full"
            onClick={handleSubmit}
          >
            Verify
          </Button>
        </div>
      </Card>
    </div>
  );
}
