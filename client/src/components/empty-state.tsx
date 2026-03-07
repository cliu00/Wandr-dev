import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  headline: string;
  subheading?: string;
  ctaLabel?: string;
  onCta?: () => void;
  imageUrl?: string;
}

export function EmptyState({ headline, subheading, ctaLabel, onCta, imageUrl }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] px-6 text-center overflow-hidden rounded-2xl">
      {imageUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/55" />
        </>
      )}
      <div className="relative z-10 max-w-md">
        <h2 className={`font-serif text-3xl font-bold mb-3 ${imageUrl ? "text-white" : "text-foreground"}`}>
          {headline}
        </h2>
        {subheading && (
          <p className={`text-lg mb-8 leading-relaxed ${imageUrl ? "text-white/75" : "text-muted-foreground"}`}>
            {subheading}
          </p>
        )}
        {ctaLabel && onCta && (
          <Button
            size="lg"
            onClick={onCta}
            className="rounded-full px-8"
            variant={imageUrl ? "outline" : "default"}
            data-testid="button-empty-cta"
          >
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
