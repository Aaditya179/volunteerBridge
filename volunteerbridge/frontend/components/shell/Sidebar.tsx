/**
 * Sidebar navigation component.
 * Highlights active route. Collapsible on mobile.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Upload,
  Brain,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Crisis Map",
    href: "/dashboard/map",
    icon: <Map size={20} />,
  },
  {
    label: "Upload Survey",
    href: "/dashboard/upload",
    icon: <Upload size={20} />,
  },
  {
    label: "AI Intelligence",
    href: "/dashboard/intelligence",
    icon: <Brain size={20} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40
        transition-all duration-300 ease-in-out flex flex-col
        ${collapsed ? "w-[68px]" : "w-[240px]"}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
              VolunteerBridge
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-150 group
              ${
                isActive(item.href)
                  ? "bg-brand-50 text-brand-500 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
            title={collapsed ? item.label : undefined}
          >
            <span
              className={`flex-shrink-0 ${
                isActive(item.href)
                  ? "text-brand-500"
                  : "text-gray-400 group-hover:text-gray-600"
              }`}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm whitespace-nowrap">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-gray-400 hover:text-gray-600 hover:bg-gray-50
                     transition-colors duration-150"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
