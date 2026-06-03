"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  CalendarClock,
  Command,
  FileText,
  Frame,
  GalleryVerticalEnd,
  Map,
  Pen,
  PieChart,
  Settings2,
  SquareTerminal,
  Unplug,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Compose",
      url: "#",
      icon:Pen,
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
  url: "/admin/scheduled-posts",
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
          url: "/admin/integrations/facebook-pages",
        },
        {
          title: "Facebook Pages",
          url: "/admin/integrations/facebook-pages",
        },
        {
          title: "Instagram Accounts",
          url: "/admin/integrations/instagram-accounts",
        }
      ],
    },
  ],
  projects: [
    {
      name: "Terms & Conditions",
      url: "#",
      icon: Frame,
    },
    {
      name: "Privacy Policy",
      url: "#",
      icon: PieChart,
    },
    {
      name: "About Platforms",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        App Logo
        {/* <TeamSwitcher teams={data.teams} /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
