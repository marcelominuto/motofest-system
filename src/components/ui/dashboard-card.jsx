import * as React from "react";
import { cn } from "@/lib/utils";

function DashboardCard({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DashboardCardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn("px-6 py-4 border-b border-gray-50", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function DashboardCardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold text-gray-700 leading-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function DashboardCardContent({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function DashboardCardIcon({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DashboardCardValue({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "text-2xl sm:text-3xl font-bold text-gray-900 leading-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DashboardCardSubtitle({ className, children, ...props }) {
  return (
    <p
      className={cn("text-xs font-medium mt-2 leading-tight", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
  DashboardCardIcon,
  DashboardCardValue,
  DashboardCardSubtitle,
};
