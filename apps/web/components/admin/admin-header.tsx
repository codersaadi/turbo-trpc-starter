"use client";

import { SidebarTrigger } from "@repo/ui/components/ui/sidebar";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/ui/breadcrumb";

interface AdminHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function AdminHeader({ breadcrumbs = [] }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={index}>
              <BreadcrumbSeparator className="hidden md:block" />
              {crumb.href ? (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
