"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from 'react';
import {
  Home,
  ShoppingCart,
  MessageSquare,
  Compass,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Menu,
  Activity,
  Bookmark,
  Sun,
  Bot,
  Users,
  Wallet,
  Zap,
  TrendingUp,
  Moon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/chat", label: "AI Chat", icon: Bot, badge: "AI" },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/cart", label: "My Cart", icon: ShoppingCart },
  ];

  return (
    <TooltipProvider>
    <div className={cn(
      "grid min-h-screen w-full transition-[grid-template-columns] duration-300",
       isSidebarExpanded ? "md:grid-cols-[240px_1fr]" : "md:grid-cols-[64px_1fr]"
    )}>
      {/* ── Sidebar ── */}
      <div
        className="hidden border-r md:flex md:flex-col sticky top-0 h-screen overflow-hidden"
        style={{
          background: 'hsl(36 30% 97%)',
          borderColor: 'hsl(36 15% 88%)',
        }}
      >
        {/* Logo */}
        <div className="flex h-[60px] items-center border-b px-4" style={{ borderColor: 'hsl(36 15% 88%)' }}>
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-2xl shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, hsl(350 60% 72%), hsl(350 45% 80%))' }}
            >
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            {isSidebarExpanded && (
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: 'hsl(25 20% 22%)' }}
              >
                Trend<span style={{ color: 'hsl(350 60% 58%)' }}>AI</span>
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 shrink-0 rounded-xl hover:bg-black/5"
            style={{ color: 'hsl(25 15% 50%)' }}
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          >
            {isSidebarExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>

        {/* Wallet Mini Badge */}
        {isSidebarExpanded && (
          <div
            className="mx-3 mt-4 rounded-2xl p-3.5"
            style={{
              background: 'linear-gradient(135deg, hsl(350 60% 96%), hsl(36 60% 95%))',
              border: '1px solid hsl(350 40% 88%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: 'hsl(350 60% 90%)' }}
                >
                  <Wallet className="h-4 w-4" style={{ color: 'hsl(350 60% 55%)' }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(25 15% 52%)' }}>OWS Wallet</p>
                  <p className="text-sm font-bold" style={{ color: 'hsl(25 20% 18%)' }}>$1,500.00</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" style={{ color: 'hsl(350 60% 58%)' }} />
                <span className="text-[10px] font-semibold" style={{ color: 'hsl(350 60% 55%)' }}>Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 overflow-auto py-4 px-2.5">
          <nav className="space-y-0.5">
            {isSidebarExpanded && (
              <p className="px-3 pb-2 text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'hsl(25 15% 60%)' }}>
                Menu
              </p>
            )}
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Tooltip key={link.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "text-white shadow-sm"
                          : "hover:bg-black/5"
                      )}
                      style={
                        isActive
                          ? {
                              background: 'linear-gradient(135deg, hsl(350 60% 62%), hsl(350 48% 70%))',
                              color: 'white',
                            }
                          : { color: 'hsl(25 15% 42%)' }
                      }
                    >
                      <link.icon
                        className="shrink-0"
                        style={{ width: '1.05rem', height: '1.05rem' }}
                      />
                      {isSidebarExpanded && <span className="flex-1">{link.label}</span>}
                      {isSidebarExpanded && (link as any).badge && (
                        <Badge
                          className="text-[9px] px-1.5 py-0 h-4 rounded-lg font-bold border-0"
                          style={{ background: 'hsl(350 60% 90%)', color: 'hsl(350 60% 50%)' }}
                        >
                          {(link as any).badge}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {!isSidebarExpanded && (
                    <TooltipContent side="right" className="text-xs">
                      {link.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t space-y-0.5" style={{ borderColor: 'hsl(36 15% 88%)' }}>
          {/* Theme toggle */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className={cn(
                  "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-black/5",
                  isSidebarExpanded ? "justify-start" : "justify-center"
                )}
                style={{ color: 'hsl(25 15% 42%)' }}
              >
                {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
                {isSidebarExpanded && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
              </button>
            </TooltipTrigger>
            {!isSidebarExpanded && (
              <TooltipContent side="right">Theme</TooltipContent>
            )}
          </Tooltip>

          <DropdownMenu>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-black/5 w-full text-sm font-medium",
                      isSidebarExpanded ? "justify-start" : "justify-center"
                    )}
                    style={{ color: 'hsl(25 15% 42%)' }}
                  >
                    <Menu className="h-4 w-4 shrink-0" />
                    {isSidebarExpanded && <span>More</span>}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {!isSidebarExpanded && (
                <TooltipContent side="right">More</TooltipContent>
              )}
            </Tooltip>
            <DropdownMenuContent
              side="right"
              align="end"
              className="w-52 rounded-2xl shadow-xl border"
              style={{ background: 'hsl(0 0% 100%)', borderColor: 'hsl(36 15% 88%)' }}
            >
              <DropdownMenuLabel className="text-xs" style={{ color: 'hsl(25 15% 52%)' }}>Account</DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: 'hsl(36 15% 90%)' }} />
              <DropdownMenuItem onClick={() => router.push('/settings/profile')} className="rounded-xl cursor-pointer hover:bg-rose-50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/activity')} className="rounded-xl cursor-pointer hover:bg-rose-50">
                <Activity className="mr-2 h-4 w-4" />
                <span>My Activity</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/saved')} className="rounded-xl cursor-pointer hover:bg-rose-50">
                <Bookmark className="mr-2 h-4 w-4" />
                <span>Saved Items</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: 'hsl(36 15% 90%)' }} />
              <DropdownMenuItem
                onClick={() => router.push('/login')}
                className="rounded-xl cursor-pointer text-rose-500 focus:text-rose-500 hover:bg-rose-50"
              >
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href="/profile/me"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-black/5",
                  pathname === "/profile/me" && "bg-black/5 font-semibold"
                )}
                style={{ color: 'hsl(25 15% 42%)' }}
              >
                <Users className="h-4 w-4 shrink-0" />
                {isSidebarExpanded && <span>Profile</span>}
              </Link>
            </TooltipTrigger>
            {!isSidebarExpanded && (
              <TooltipContent side="right">Profil</TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header
          className="flex h-14 items-center gap-4 border-b px-4 md:hidden"
          style={{ background: 'hsl(36 30% 97%)', borderColor: 'hsl(36 15% 88%)' }}
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-xl border"
                style={{ borderColor: 'hsl(36 15% 88%)', background: 'transparent', color: 'hsl(25 15% 40%)' }}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4 border-r" style={{ background: 'hsl(36 30% 97%)', borderColor: 'hsl(36 15% 88%)' }}>
              <Link href="/" className="flex items-center gap-2 font-bold mb-6">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, hsl(350 60% 72%), hsl(350 45% 80%))' }}
                >
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold" style={{ color: 'hsl(25 20% 22%)' }}>
                  Trend<span style={{ color: 'hsl(350 60% 58%)' }}>AI</span>
                </span>
              </Link>
              <nav className="grid gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                      pathname === link.href
                        ? "text-white shadow-sm"
                        : "hover:bg-black/5"
                    )}
                    style={
                      pathname === link.href
                        ? { background: 'linear-gradient(135deg, hsl(350 60% 62%), hsl(350 48% 70%))' }
                        : { color: 'hsl(25 15% 42%)' }
                    }
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex items-center">
            <span className="font-bold text-sm" style={{ color: 'hsl(25 20% 22%)' }}>
              Trend<span style={{ color: 'hsl(350 60% 58%)' }}>AI</span>
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}
