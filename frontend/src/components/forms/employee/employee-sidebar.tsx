"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Wallet,
  User,
  LogOut,
  GraduationCap,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthActions } from "@/stores/auth.store"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Nghỉ phép",
    url: "/nghi-phep",
    icon: Calendar,
  },
  {
    title: "Chấm công",
    url: "/cham-cong",
    icon: Clock,
  },
  {
    title: "Lương",
    url: "/luong",
    icon: Wallet,
  },
  {
    title: "Hồ sơ",
    url: "/profile",
    icon: User,
  },
]

function DefaultPanel({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="text-base font-medium text-foreground">{title}</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
              <Icon className="mb-3 size-10 opacity-20" />
              <p>Chưa có dữ liệu</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  )
}

export function EmployeeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthActions()
  
  const [activeItem, setActiveItem] = React.useState(
    () => navItems.find((item) => pathname === item.url) || navItems[0]
  )

  React.useEffect(() => {
    const match = navItems.find((item) => pathname === item.url)
    if (match && match.title !== activeItem?.title) {
      setActiveItem(match)
    }
  }, [pathname, activeItem?.title])

  const renderPanel = () => {
    switch (activeItem?.url) {
      default:
        return <DefaultPanel title={activeItem?.title || ""} icon={activeItem?.icon || LayoutDashboard} />
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* Icon sidebar */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GraduationCap className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">THPT Thăng Long</span>
                    <span className="truncate text-xs">Cổng nhân viên</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = activeItem?.title === item.title
                  return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      isActive={isActive}
                      onClick={() => { setActiveItem(item); router.push(item.url) }}
                      className="px-2.5 md:px-2 cursor-pointer"
                    >
                      <item.icon className={isActive ? "text-sidebar-primary scale-110" : "text-sidebar-foreground/50"} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2">
            <SidebarMenuButton
              tooltip={{ children: "Đăng xuất", hidden: false }}
              onClick={() => logout()}
              className="w-full cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </div>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Detail panel */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        {renderPanel()}
      </Sidebar>
    </Sidebar>
  )
}
