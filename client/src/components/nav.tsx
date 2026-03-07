import { Link, useLocation } from "wouter";
import { Bookmark, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface NavProps {
  variant?: "transparent" | "solid";
}

export function Nav({ variant = "solid" }: NavProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTransparent = variant === "transparent";

  function handleLogin() {
    toast({
      title: "Login coming soon",
      description: "Authentication will be available in the full version.",
    });
  }

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        ${isTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-sm border-b border-border"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/">
          <span
            className={`font-serif text-xl font-bold tracking-widest cursor-pointer ${
              isTransparent ? "text-white" : "text-foreground"
            }`}
            data-testid="logo"
          >
            48HRS
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/">
            <span
              className={`text-xs tracking-[0.2em] uppercase font-medium cursor-pointer transition-opacity hover:opacity-70 ${
                isTransparent ? "text-white/90" : "text-muted-foreground"
              }`}
            >
              Destinations
            </span>
          </Link>
          <Link href="/">
            <span
              className={`text-xs tracking-[0.2em] uppercase font-medium cursor-pointer transition-opacity hover:opacity-70 ${
                isTransparent ? "text-white/90" : "text-muted-foreground"
              }`}
            >
              Journal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogin}
            data-testid="button-bookmark"
            className={isTransparent ? "text-white hover:bg-white/10" : ""}
          >
            <Bookmark className="w-4 h-4" />
          </Button>

          <Button
            variant={isTransparent ? "outline" : "default"}
            size="sm"
            onClick={handleLogin}
            data-testid="button-login"
            className={
              isTransparent
                ? "text-white border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                : ""
            }
          >
            Log in
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={`md:hidden ${isTransparent ? "text-white hover:bg-white/10" : ""}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={`md:hidden border-t px-6 py-4 flex flex-col gap-4 ${
            isTransparent
              ? "bg-black/80 backdrop-blur-md border-white/10"
              : "bg-background border-border"
          }`}
        >
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <span
              className={`text-xs tracking-[0.2em] uppercase font-medium cursor-pointer ${
                isTransparent ? "text-white/90" : "text-muted-foreground"
              }`}
            >
              Destinations
            </span>
          </Link>
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <span
              className={`text-xs tracking-[0.2em] uppercase font-medium cursor-pointer ${
                isTransparent ? "text-white/90" : "text-muted-foreground"
              }`}
            >
              Journal
            </span>
          </Link>
        </div>
      )}
    </nav>
  );
}
