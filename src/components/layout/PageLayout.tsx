import React from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  showHomeButton?: boolean;
  showFooter?: boolean;
  actions?: React.ReactNode;
  contentClass?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  showHomeButton = true,
  showFooter = true,
  actions,
  contentClass,
  breadcrumbs,
}) => {
  const finalBreadcrumbs = breadcrumbs || [
    { label: "MonteSite CRM", href: "/home" },
    { label: title },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TopBar breadcrumbs={finalBreadcrumbs} actions={actions} />
      <main className={cn("flex-1 p-4 sm:p-6 lg:p-8 overflow-auto", contentClass)}>
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
