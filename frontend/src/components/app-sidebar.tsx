"use client"

import * as React from "react"
import {
  Bot,
  Calendar,
  CalendarClock,
  FileText,
  // Frame,
  // Map,
  Pen,
  // PieChart,
  Unplug,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
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
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Post Overview",
          url: "#",
        },
        {
          title: "Generated Reports",
          url: "#",
        }
      ],
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
      <SidebarHeader>
        App Logo
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
