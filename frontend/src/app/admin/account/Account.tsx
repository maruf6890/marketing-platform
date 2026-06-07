import { private_api_call } from "@/actions/parivate_api_calll";

export default async function AccountPage() {
	try {
		const response = await private_api_call({ path: "user/get-current-user", method: "GET" });

		if (!response.success) {
			return (
				<div className="p-6">
					<h1 className="text-xl font-semibold">Account</h1>
					<p className="text-sm text-red-600">Failed to load user: {response.message || "Unknown error"}</p>
				</div>
			);
		}

		const user = response.data;

		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold mb-4">Account</h1>
				<div className="flex items-center gap-4">
					{user.avatar_url ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
					) : (
						<div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2">{user.name?.[0] ?? "U"}</div>
					)}

					<div>
						<p className="text-lg font-medium">{user.name}</p>
						<p className="text-sm text-muted-foreground">{user.email}</p>
						{user.role && <p className="text-sm text-muted-foreground">Role: {user.role}</p>}
					</div>
				</div>
			</div>
		);
	} catch {
		return (
			<div className="p-6">
				<h1 className="text-xl font-semibold">Account</h1>
				<p className="text-sm text-red-600">Error loading account</p>
			</div>
		);
	}
}