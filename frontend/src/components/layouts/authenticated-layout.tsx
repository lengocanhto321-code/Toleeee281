"use client"

import * as React from "react"
import { AppSidebar } from "@/components/organisms/app-sidebar"
import { SiteHeader } from "@/components/organisms/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export interface AuthenticatedLayoutProps {
  children: React.ReactNode
  sidebarVariant?: "sidebar" | "inset" | "floating"
}

export function AuthenticatedLayout({
  children,
  sidebarVariant = "inset",
}: AuthenticatedLayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant={sidebarVariant} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
