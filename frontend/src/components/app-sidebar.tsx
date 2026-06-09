"use client"

import * as React from "react"
import {
  Bot,
  Calendar,
  CalendarClock,
  FileText,
  Pen,
  Unplug,
  Zap,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { private_api_call } from "@/actions/parivate_api_calll"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Compose",
      url: "/admin/compose",
      icon: Pen,
      isActive: true,
      items: [
        {
          title: "Facebook Post",
          url: "/admin/compose/facebook",
        },
        {
          title: "Instagram Post",
          url: "/admin/compose/instagram",
        }

      ],
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: Calendar,
      isActive: true,
      children: undefined,
    },
    {
      title: "Scheduled Posts",
      url: "/admin/scheduled_posts",
      icon: CalendarClock,
      isActive: true,
      children: undefined,
    },
    {
      title: "Drafts",
      url: "/admin/drafts",
      icon: FileText,
      isActive: true,
      children: undefined,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: Bot,
      children: undefined,
    },
    {
      title: "Integrations",
      url: "#",
      icon: Unplug,
      items: [
        {
          title: "Account Integrations",
          url: "/admin/integrations",
        },
      ],
    },
    {
      title: "Platform Settings",
      url: "/admin/platform",
      icon: FileText,
      items: [
        {
          title: "Facebook Pages",
          url: "/admin/platform/facebook_pages",
        },
        {
          title: "Instagram Accounts",
          url: "/admin/platform/instagram_accounts",
        }
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(data.user)

  React.useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const response = await private_api_call({
        path: "user/get-current-user",
        method: "GET",
      })

      if (!isMounted || !response.success || !response.data) {
        return
      }

      const currentUser = response.data
      setUser({
        name: currentUser.name ?? "",
        email: currentUser.email ?? "",
        avatar: currentUser.avatar_url || "/avatars/shadcn.jpg",
      })
    }

    void loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center gap-3 justify-center px-4 py-6 bg-linear-to-r from-blue-500/10 to-purple-500/10 border-b">
        <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-950 p-2 shadow-sm">
          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <h1 className="font-bold text-lg text-blue-700">Marketo</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
