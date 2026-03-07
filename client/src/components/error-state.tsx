import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onHome?: () => void;
}

export function ErrorState({
  title = "We hit a snag curating your escape.",
  description = "Something went wrong. Want to try again?",
  onRetry,
  onHome,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">{description}</p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onRetry && (
          <Button onClick={onRetry} className="rounded-full" data-testid="button-retry">
            Try again
          </Button>
        )}
        {onHome && (
          <Button variant="outline" onClick={onHome} className="rounded-full" data-testid="button-home">
            Back to home
          </Button>
        )}
      </div>
    </div>
  );
}
