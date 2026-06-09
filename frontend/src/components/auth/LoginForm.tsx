
"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Grid2X2Check } from "lucide-react";
import TextInput from "../app_inputs/text_input";
import PasswordInput from "../app_inputs/password_input";
import { useState } from "react";
import { public_api_call } from "@/actions/public_api_call";
import { toast } from "sonner";
import { setCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [data, setData] = useState({ 
    email: "",
    password: "",
  });
  const resetData = () => {
    setData({
      email: "",
      password: "",
    })
  }
  const [loading, setLoading] = useState(false);
  const isFormCompleted = Object.values(data).every(
    (value) => value.trim() !== "",
  );
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormCompleted) return;
    setLoading(true);
    const result = await public_api_call({
      path: "user/login",
      method: "POST",
      body: data,
    });
    console.log(result);
    if (result.success) {
      toast.success("Logged in successfully!");
      console.log(result);
      if (result.data) {
        const { accessToken, user } = result.data;
        console.log(accessToken, user);
       
        if (accessToken) {
          await setCookie("token", accessToken);
        }
        if (user) {
          await setCookie("user_name", JSON.stringify(user.user));
          await setCookie("email", JSON.stringify(user.email));
          await setCookie("user_id", JSON.stringify(user.id));
          await setCookie("role", JSON.stringify(user.role));
        }
      }

      resetData();
      router.push("/admin/compose/facebook");
    } else {
      console.error(result.message || "Failed to log in");
      toast.error(
        result.message || "Failed to log in. Please try again.",
      );
    }
    setLoading(false);
  };
  
  return (
    <section className="grid w-full grid-cols-1 md:min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center bg-primary-foreground px-4 py-12 text-base md:border-r">
        <div className="mx-auto grid w-full max-w-md gap-8">
          Logo
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-thin tracking-tight">
              You&#39;re one step away from your dream.
            </h1>
            <p>
              A beautifully designed interface that is fine-tuned to get out of
              your way and make your work as fast as possible.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { text: "Track and split bills effortlessly" },
              { text: "Simplify group expenses" },
              { text: "Hassle-free expense management" },
              { text: "Insights into spending patterns" },
            ].map((content, index) => (
              <div key={index} className="flex items-center gap-2">
                <Grid2X2Check className="shrink-0" />
                <p>{content.text}</p>
              </div>
            ))}
          </div>
          <Separator />
          <p>
            “No hidden fees or charges — the price you see is the price you pay.
            This makes my life so much easier!”
          </p>
        
        </div>
      </div>
      <div className="order-first flex items-center justify-center px-4 py-12 md:order-last">
        <div className="mx-auto grid w-full max-w-md gap-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details below to login
            </p>
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <TextInput label="Email" placeholder="Enter Email" required type="email" value={data.email} onChange={(value)=>{setData({ ...data, email: value });}}   id="email"/>
            </div>
            <div className="grid gap-2">
              <PasswordInput label="Password" displayStrength={false} displayRequirements={false} placeholder="Enter Password" required value={data.password} onChange={(value)=>{setData({ ...data, password: value });}}   id="password"/>
              
            </div>
            <Button type="submit" size="sm" disabled={!isFormCompleted || loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Login with Google
            </Button>
          </form>
          <div className="flex flex-col gap-4 text-sm">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="underline">
                Sign up
              </Link>
            </p>
            <Link href="/auth/forgot-password" className="underline">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

