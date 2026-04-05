import * as React from "react"

export interface NotAuthenticatedLayoutProps {
  children: React.ReactNode
  className?: string
}

export function NotAuthenticatedLayout({
  children,
  className,
}: NotAuthenticatedLayoutProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
