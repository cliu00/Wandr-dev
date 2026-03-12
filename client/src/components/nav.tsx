import { Link } from "wouter";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NavProps {
  variant?: "transparent" | "solid";
}

export function Nav({ variant = "solid" }: NavProps) {
  const { toast } = useToast();
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
            Wandr
          </span>
        </Link>

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
        </div>
      </div>
    </nav>
  );
}
