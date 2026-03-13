import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sun, Moon, LogOut, ChevronDown, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/lib/auth-context";

interface NavProps {
  variant?: "transparent" | "solid";
}

function WandrLogo({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <circle cx="5" cy="19" r="2.5" fill={color} />
      <circle cx="19" cy="5" r="2.5" fill={color} />
      <path d="M5 16.5C5 11 19 13 19 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Nav({ variant = "solid" }: NavProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isTransparent = variant === "transparent";
  const iconColor = isTransparent ? "white" : "currentColor";

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "";

  function handleLogout() {
    logout();
    setShowUserMenu(false);
    navigate("/");
  }

  return (
    <nav
      aria-label="Main navigation"
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
          <div className="flex items-center gap-2 cursor-pointer" data-testid="logo">
            <WandrLogo color={isTransparent ? "white" : "hsl(var(--primary))"} />
            <span className={`font-serif text-xl font-bold tracking-widest ${isTransparent ? "text-white" : "text-foreground"}`}>
              Wandr
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
            className={isTransparent ? "text-white hover:bg-white/10" : ""}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {user ? (
            /* Logged-in state */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-foreground hover:bg-muted"
                }`}
                data-testid="button-user-menu"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <span className="max-w-[100px] truncate hidden sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-background border border-border rounded-2xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border/60">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => { setShowUserMenu(false); navigate("/trips"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        data-testid="button-my-trips"
                      >
                        <Bookmark className="w-4 h-4" />
                        My trips
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Logged-out state */
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/sign-in")}
                data-testid="button-login"
                className={isTransparent ? "text-white/85 hover:text-white hover:bg-white/10 text-sm" : "text-sm"}
              >
                Log in
              </Button>

              <Button
                variant={isTransparent ? "outline" : "default"}
                size="sm"
                onClick={() => navigate("/sign-up")}
                data-testid="button-signup"
                className={isTransparent ? "text-white border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-sm" : "text-sm"}
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
