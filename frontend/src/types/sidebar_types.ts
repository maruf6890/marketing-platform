import type { ElementType } from "react";
import { User } from "./user_types";

export interface NavItem {
  id: string;
  title: string;
  icon: ElementType;
  url?: string;
  isActive?: boolean;
}



export interface FavoriteItem {
  id: string;
  title: string;
  href: string;
  color: string;
}

export interface TeamItem {
  id: string;
  title: string;
  icon: ElementType;
}

export interface TopicItem {
  id: string;
  title: string;
  icon: ElementType;
}

export interface SidebarData {
  user: User;
  navMain: NavItem[];
  navCollapsible: {
    favorites: FavoriteItem[];
    teams: TeamItem[];
    topics: TopicItem[];
  };
}
