"use client";

import * as React from "react";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";

export function AuthButton() {
  const { user, loading, openLogin } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);

  if (loading) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-muted/40" />;
  }

  if (!user) {
    return (
      <Button size="sm" variant="secondary" onClick={openLogin}>
        <LogIn className="h-3.5 w-3.5" />
        로그인
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[180px] truncate text-xs text-muted-foreground sm:inline"
        title={user.email ?? undefined}
      >
        {user.email}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          void supabase.auth.signOut();
        }}
      >
        <LogOut className="h-3.5 w-3.5" />
        로그아웃
      </Button>
    </div>
  );
}
