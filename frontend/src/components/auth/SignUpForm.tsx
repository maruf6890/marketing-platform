"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Hexagon } from "lucide-react";
import TextInput from "../app_inputs/text_input";
import { useState } from "react";
import PasswordInput from "../app_inputs/password_input";
import { toast } from "sonner";
import { public_api_call } from "@/actions/public_api_call";
import { BASE_URL } from "@/lib/const";
import { setCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";



export default function SignUpForm() {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    confirm_password: "",

  });
  const resetData = () => {
    setFormData({
      user_name: "",
      email: "",
      password: "",
      confirm_password: "",
    })
  }
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isFormCompleted = Object.values(formData).every((value) => value.trim() !== "");
  const handleSumit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormCompleted) return;
    setLoading(true);
    const result = await public_api_call({ path: "user/register", method: "POST", body: formData });
    console.log(result)
    if (result.success) {
      toast.success("Account created successfully! Please log in.");
      console.log(result.data)
      if (result.data) { 
        const { token, user } = result.data;
        if (token) {
         await setCookie("token", token);
         
        }
        if (user) {
        await setCookie("user_name", JSON.stringify(user.user));
        await setCookie("email", JSON.stringify(user.email));
        await setCookie("user_id", JSON.stringify(user.id));
        await setCookie("role", JSON.stringify(user.role));
         
        }
      }
      
      resetData();
       router.push("/admin"); 
    } else {
      console.error(result.message || "Failed to create account");
      toast.error(result.message || "Failed to create account. Please try again.");
     
      
    }
    setLoading(false);
  }
  return (
    <section className="grid w-full grid-cols-1 md:min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center bg-primary-foreground px-4 py-12 text-base md:border-r">
        <div className="mx-auto grid w-full max-w-md gap-8">
          {BASE_URL}
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
                <Hexagon className="shrink-0" />
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
            <h1 className="text-xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started with MynaUI today.
            </p>
          </div>
          <form className="grid gap-4" onSubmit={handleSumit}>
            <div className="grid gap-2">
              <TextInput
                id="userName"
                value={formData.user_name}
                onChange={(value) =>
                  setFormData({ ...formData, user_name: value })
                }
                label="User Name"
                required={true}
              />
            </div>
            <div className="grid gap-2">
              <TextInput
                id="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                label="Email"
                required={true}
              />
            </div>
            <div className="grid gap-2">
              <PasswordInput
                id="password"
                value={formData.password}
                onChange={(value) =>
                  setFormData({ ...formData, password: value })
                }
                placeholder="Enter Password"
                label="Password"
                required={true}
              />
            </div>
            <div className="grid gap-2">
              <PasswordInput
                id="confirmPassword"
                value={formData.confirm_password}
                onChange={(value) =>
                  setFormData({ ...formData, confirm_password: value })
                }
                placeholder="Enter Password"
                label="Confirm Password"
                required={true}
                displayStrength={false}
                displayRequirements={false}
              />
            </div>
            <Button type="submit" className="w-full">
              {loading ? "Creating Account..." : "Create Account →"}
            </Button>
          </form>
          <p className="text-sm">
            Already have an account?{" "}
            <a href="#" className="underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
;

