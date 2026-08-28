import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function AppLayout({
  title,
  description,
  actions,
  children,
  contentClassName = "px-4 pb-4 lg:px-6 lg:pb-6",
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  contentClassName?: string
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col gap-6 py-4 lg:py-6">
          <div className="flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>
          <div className={cn("flex flex-1 flex-col gap-6", contentClassName)}>
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
