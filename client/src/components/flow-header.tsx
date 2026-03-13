import { Link } from "wouter";
import { ArrowLeft, X, Sun, Moon, ChevronDown, LogOut, Bookmark } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useLocation } from "wouter";

function WandrMark({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <circle cx="5" cy="19" r="2.5" fill={color} />
      <circle cx="19" cy="5" r="2.5" fill={color} />
      <path d="M5 16.5C5 11 19 13 19 7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

interface FlowHeaderProps {
  onBack?: () => void;
  onExit?: () => void;
  rightContent?: React.ReactNode;
  variant?: "solid" | "transparent";
}

export function FlowHeader({
  onBack,
  onExit,
  rightContent,
  variant = "solid",
}: FlowHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const isTransparent = variant === "transparent";

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "";

  function handleLogout() {
    logout();
    setShowMenu(false);
    navigate("/");
  }

  const baseClass = isTransparent
    ? "bg-transparent"
    : "bg-background/95 backdrop-blur-sm border-b border-border/60";

  return (
    <div className={`${baseClass} px-4 py-3 flex items-center justify-between gap-3`}>
      {/* Left — back / exit / placeholder */}
      <div className="flex-shrink-0 w-9 flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            data-testid="button-back"
            className={`p-1.5 -ml-1.5 rounded-lg transition-colors ${
              isTransparent
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        {onExit && !onBack && (
          <button
            onClick={onExit}
            aria-label="Exit"
            data-testid="button-exit"
            className={`p-1.5 -ml-1.5 rounded-lg transition-colors ${
              isTransparent
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Center — logo */}
      <Link href="/">
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          data-testid="flow-logo"
          aria-label="Wandr home"
        >
          <WandrMark color={isTransparent ? "white" : "hsl(var(--primary))"} />
          <span
            className={`font-serif text-lg font-bold tracking-widest ${
              isTransparent ? "text-white" : "text-foreground"
            }`}
          >
            Wandr
          </span>
        </div>
      </Link>

      {/* Right — custom slot + theme toggle + profile */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {rightContent && (
          <div className={isTransparent ? "text-white/70" : "text-muted-foreground"}>
            {rightContent}
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="button-theme-toggle-flow"
          className={`p-1.5 rounded-lg transition-colors ${
            isTransparent
              ? "text-white/70 hover:text-white hover:bg-white/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowMenu((s) => !s)}
              aria-label="User menu"
              data-testid="button-user-menu-flow"
              className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full text-xs font-medium transition-colors ${
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {initials}
              </div>
              <ChevronDown className="w-3 h-3 opacity-60 hidden sm:block" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-2xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border/60">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { setShowMenu(false); navigate("/trips"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      data-testid="button-my-trips-flow"
                    >
                      <Bookmark className="w-4 h-4" />
                      My trips
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      data-testid="button-logout-flow"
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
          <Link href="/sign-in">
            <button
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10 border border-white/30"
                  : "text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
              }`}
              data-testid="button-signin-flow"
            >
              Sign in
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
