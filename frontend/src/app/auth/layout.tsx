import { getCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";

export default async function Page({ children }: { children: React.ReactNode }) {

    const token = await getCookie("token");
    console.log("token", token);
    if (token) redirect("/admin/compose/facebook")

    return (
        <div className="bg-muted flex-1">{children}</div>
    );
}