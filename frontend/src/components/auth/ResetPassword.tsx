
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Link, Mail } from "lucide-react";
import { useState } from "react";
import { public_api_call } from "@/actions/public_api_call";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "../app_inputs/password_input";


export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const [data, setFormData] = useState({
    confirm_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(false);
  const isFormInCompleted = () => {
  return  data.confirm_password.trim() == "" || data.new_password.trim() == ""
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  
    e.preventDefault();
    if(!email) {
      toast.error("Email is missing. Please go back and try again.");
      return;
    }
    if (isFormInCompleted()) return;
    setLoading(true);
    const result = await public_api_call({
      path: `user/change-password/${email}`,
      method: "POST",
      body: data,
    });
    console.log(result);
    if (result.success) {
      toast.success("Password reset successfully!");
      setFormData({ confirm_password: "", new_password: "" });
      router.push("/auth/login");
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
                <PasswordInput id="new_password" value={data.new_password} onChange={(value) => setFormData({ ...data, new_password: value })} label="New Password" placeholder="Enter your new password" required={true} />
                <PasswordInput id="confirm_password"  value={data.confirm_password} onChange={(value) => setFormData({ ...data, confirm_password: value })} label="Confirm Password" placeholder="Confirm your new password" required={true} />
              </div>
              <Button type="submit" className="w-full" disabled={isFormInCompleted() || loading}>
                {loading ? "Resetting..." : "Reset Password"}
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