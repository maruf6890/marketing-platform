
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useState } from "react";
import TextInput from "../app_inputs/text_input";
import { public_api_call } from "@/actions/public_api_call";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export default function ForgotPassword() {
  const router = useRouter();
  const [data, setFormData] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const isFormCompleted = Object.values(data).every(
    (value) => value.trim() !== "",
  );
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormCompleted) return;
    setLoading(true);
    const result = await public_api_call({
      path: "user/forgot-password",
      method: "POST",
      body: data,
    });
    console.log(result);
    if (result.success) {
      toast.success("OTP sent successfully!");
      setFormData({ email: "" });
      router.push("/auth/verify-otp/?email=" + data.email);
    } else {
      console.error(result.message || "Failed to send OTP");
      toast.error(result.message || "Failed to send OTP. Please try again.");
    }
    setLoading(false);
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
                Forgot Your Password?
              </h1>
              <p className="text-sm text-muted-foreground">
                Type in your email below, and we&apos;ll send you instructions on
                how to set a new password.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <TextInput
                  id="email"
                  value={data.email}
                  onChange={(value) => setFormData({ ...data, email: value })}
                  label="Email"
                  placeholder="Enter your email"
                  required={true}
                  type="email"
                />
              </div>
              <Button type="submit" className="w-full">
               {loading ? "Sending..." : "Send Instructions"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center font-medium">
            <Button variant="link" asChild>
              <a href="/login">Return to Login</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  

}