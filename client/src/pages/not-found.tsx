import { useLocation } from "wouter";
import { EmptyState } from "@/components/empty-state";
import { Nav } from "@/components/nav";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <Nav variant="solid" />
      <div className="pt-20 px-6">
        <EmptyState
          headline="This adventure couldn't be found."
          subheading="The itinerary you're looking for may have been moved or doesn't exist."
          ctaLabel="Back to home"
          onCta={() => navigate("/")}
          imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
        />
      </div>
    </div>
  );
}
