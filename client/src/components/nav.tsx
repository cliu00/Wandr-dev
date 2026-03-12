import { Link } from "wouter";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme-provider";

interface NavProps {
  variant?: "transparent" | "solid";
}

function WandrLogo({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <circle cx="5" cy="19" r="2.5" fill={color} />
      <circle cx="19" cy="5" r="2.5" fill={color} />
      <path
        d="M5 16.5C5 11 19 13 19 7.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Nav({ variant = "solid" }: NavProps) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const isTransparent = variant === "transparent";

  function handleLogin() {
    toast({
      title: "Login coming soon",
      description: "Authentication will be available in the full version.",
    });
  }

  function handleSignup() {
    toast({
      title: "Sign up coming soon",
      description: "Create your account in the full version.",
    });
  }

  const iconColor = isTransparent ? "white" : "currentColor";

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
          <div className="flex items-center gap-2 cursor-pointer" data-testid="logo">
            <WandrLogo color={isTransparent ? "white" : "hsl(var(--primary))"} />
            <span
              className={`font-serif text-xl font-bold tracking-widest ${
                isTransparent ? "text-white" : "text-foreground"
              }`}
            >
              Wandr
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
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

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogin}
            data-testid="button-login"
            className={
              isTransparent
                ? "text-white/85 hover:text-white hover:bg-white/10 text-sm"
                : "text-sm"
            }
          >
            Log in
          </Button>

          <Button
            variant={isTransparent ? "outline" : "default"}
            size="sm"
            onClick={handleSignup}
            data-testid="button-signup"
            className={
              isTransparent
                ? "text-white border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-sm"
                : "text-sm"
            }
          >
            Sign up
          </Button>
        </div>
      </div>
    </nav>
  );
}
