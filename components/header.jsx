"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              CAREERSPHERE
            </span>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Industry Insights
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </Link>

              {/* Growth Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <StarsIcon className="h-4 w-4" />
                    <span className="hidden md:block">Growth Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/resume" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Build Resume
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/ai-cover-letter"
                      className="flex items-center gap-2"
                    >
                      <PenBox className="h-4 w-4" />
                      Cover Letter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/interview" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Interview Prep
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-10 h-10 p-0 rounded-full">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {session.user?.name || session.user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
