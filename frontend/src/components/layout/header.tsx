"use client";

import Link from "next/link";
import { useState } from "react";
import { CryptoVisionLogo } from "@/components/icons/crypto-vision-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/auth-dialog";
import { User, LogIn, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, userData, logout } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <CryptoVisionLogo className="h-6 w-6" />
            <span className="font-bold font-headline sm:inline-block">
              CryptoVision AI
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            
            {user && userData ? (
              <>
                {/* Credits Display - Always visible */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                  {userData.isPremium ? (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                      ⭐ Premium
                    </Badge>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{userData.credits}</span>
                      <span className="text-xs text-muted-foreground">/ 6 credits</span>
                    </>
                  )}
                </div>
                
                {/* Mobile credits badge */}
                <div className="flex sm:hidden">
                  {userData.isPremium ? (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                      ⭐ Pro
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {userData.credits} credits
                    </Badge>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(userData.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userData.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {userData.isPremium ? (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                            Premium - Unlimited
                          </Badge>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {userData.credits} / 6 credits remaining
                            </Badge>
                            <p className="text-[10px] text-muted-foreground">3 credits = 1 prediction</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => setAuthDialogOpen(true)}
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  );
}
