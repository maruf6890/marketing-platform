
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useEffect, useId, useState } from "react";
import TextInput from "../app_inputs/text_input";
import { public_api_call } from "@/actions/public_api_call";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";



export default function VerifyOtpForm() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [sendingOtp, setSendingOtp] = useState(false);


  const router = useRouter();
  const [data, setFormData] = useState({
    otp: "",
  });

    const [timeLeft, setTimeLeft] = useState(10);
    const id = useId();

    useEffect(() => {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;

      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };


  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!email) {
      toast.error("Email is missing. Please go back and try again.");
      return;
    }
    if (!data.otp) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    const result = await public_api_call({
      path: `user/verify-otp/${email}`,
      method: "POST",
      body: data,
    });
    console.log(result);
    if (result.success) {
      toast.success("OTP verified successfully!");
      setFormData({ otp: "" });
      router.push("/auth/reset-password/?email=" + email);
    } else {
      console.error(result.message || "Failed to verify OTP");
      toast.error(result.message || "Failed to verify OTP. Please try again.");
    }
    setLoading(false);
  };  
  const resendOtpEmail = async () => {
    if (!email) {
      toast.error("Email is missing. Please go back and try again.");
      return;
    }

    setSendingOtp(true);
    const result = await public_api_call({
      path: `user/forgot-password`,
      method: "POST",
      body: { email: email },
    });
    console.log(result);
    if (result.success) {
      toast.success("Resent OTP successfully!");
      setFormData({ otp: "" });
      setTimeLeft(120);
    } else {
      console.error(result.message || "Failed to resend OTP");
      toast.error(result.message || "Failed to resend OTP. Please try again.");
    }
    setSendingOtp(false);   
  };  

    return (
      <div className="w-full flex h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-6">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Verify OTP
              </h1>

                  
              <p className="text-sm text-muted-foreground">
                Type in the OTP sent to your email below to verify your account.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2 ">
                <div className="flex justify-center items-center">
                <InputOTP value={data.otp} onChange={(value) => setFormData({ otp: value })} id={id} maxLength={6}>
                  <InputOTPGroup className="gap-2 *:data-[active=true]:ring-0 *:data-[slot=input-otp-slot]:rounded-none *:data-[slot=input-otp-slot]:border-0 *:data-[slot=input-otp-slot]:border-b-2 *:data-[slot=input-otp-slot]:shadow-none *:dark:data-[slot=input-otp-slot]:bg-transparent">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-muted-foreground text-xs text-center">
                  {timeLeft > 0 ? (
                    `Resend available in ${formatTime(timeLeft)}`
                  ) : (
                      <Button type="button" variant="link" size="sm" className="hover:text-primary underline" disabled={sendingOtp} onClick={(e) => { e.preventDefault(); console.log("clicking"); resendOtpEmail()}}>
                      {sendingOtp ? "Resending..." : "Resend OTP"}
                    </Button>
                    
                  )}
                </p>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center font-medium">
            <Button variant="link" asChild>
              <Link href="/auth/login">Return to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  

}





