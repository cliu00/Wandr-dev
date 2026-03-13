import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Nav } from "@/components/nav";

const FAQS = [
  {
    q: "Which destinations does Wandr cover?",
    a: "We currently cover 32 Canadian destinations — from Vancouver Island and Whistler on the west coast, through the Rockies and the prairies, to Toronto, Montreal, Quebec City, and the Maritimes. International destinations are on the roadmap.",
  },
  {
    q: "How does the AI personalise my itinerary?",
    a: "Your quiz answers — energy level, daily budget, food preferences, the activities you love, and any anchor experience you have in mind — are used to select and sequence activities that genuinely match your travel style. Every itinerary is built from scratch for you, not pulled from a template.",
  },
  {
    q: "How long does it take to get an itinerary?",
    a: "Under a minute. Answer six quick questions, and Wandr generates a full day-by-day plan with morning, afternoon, and evening blocks, activity descriptions, a 'why this is right for you' note, and cost estimates.",
  },
  {
    q: "Can I plan a trip for a group with different tastes?",
    a: "Yes — that's one of Wandr's strengths. Invite your crew via a shared link. Each person completes a short preferences survey on their own device. Wandr then blends everyone's input and generates a single itinerary that satisfies the group, with notes on which picks cater to whom.",
  },
  {
    q: "How does the group itinerary process work, start to finish?",
    a: "It works in four steps. First, you plan your own trip through the usual quiz. Second, you open the invite screen and enter the names of your travel companions — Wandr generates a unique survey link for the group. Third, each person follows that link and answers their own short preference survey (energy level, budget, food style, favourite activities). Fourth, once enough people have responded, you tap 'Generate Group Itinerary' and Wandr builds a single day-by-day plan that balances everyone's input automatically.",
  },
  {
    q: "How do I invite friends to add their preferences?",
    a: "After you've completed your own quiz and reached the itinerary screen, tap 'Invite Crew'. You'll see a unique group link you can copy and share however you like — by text, WhatsApp, email, or any other app. There's also a pre-written email message you can copy or open directly in your mail client. Each person who opens the link gets their own short survey, separate from yours. You don't need everyone's email address upfront.",
  },
  {
    q: "How does the itinerary update as each person responds?",
    a: "The itinerary regenerates each time you tap 'Generate Group Itinerary' — it always reflects the preferences of everyone who has responded at that point. You can track who has submitted on the Group Status screen, send reminders to anyone still pending, and regenerate as more people come in. The final version should be generated once the whole group has responded for the most balanced result, but you're never blocked from generating early.",
  },
  {
    q: "What if one person's preferences clash badly with everyone else's?",
    a: "Wandr's balancing engine weighs preferences across the group and finds the highest-overlap activities first. Where genuine conflicts exist — say, one person wants a packed schedule and another needs a slow pace — we build in rest blocks and offer backup options so each person has flexibility. The Group Preferences tab on the status screen also shows exactly which activity picks are driven by which group members, so you can make informed swap decisions.",
  },
  {
    q: "Is there a limit to how many people can join a group trip?",
    a: "There's no hard cap during the prototype. In practice, groups of two to eight work best — beyond that, the preference spread tends to be wide enough that some activities will feel like a compromise for someone. We're working on smarter balancing for larger groups.",
  },
  {
    q: "Can I change my itinerary after it's generated?",
    a: "Absolutely. Every activity block has a backup option you can swap in with one tap, and you can replace any block with free time whenever you need a break. If the whole plan feels off, regenerate with adjusted preferences.",
  },
  {
    q: "Do I need an account to use Wandr?",
    a: "No — you can plan and view a complete itinerary without signing up. Creating an account lets you save trips, revisit them at any time, and share them with others.",
  },
  {
    q: "Is Wandr free to use?",
    a: "Planning your trip is completely free. Paid tiers are coming that will unlock premium features — concierge-level booking assistance, offline access, multi-destination itineraries, and more.",
  },
  {
    q: "What if I have a dietary restriction or very specific need?",
    a: "There's a free-text field at the end of the quiz — use it to tell us anything specific: dietary restrictions, mobility considerations, a must-see spot, or a hard no. We factor it in.",
  },
  {
    q: "Is my data kept private?",
    a: "Your preferences are used solely to personalise your trip and are never sold to third parties. See our Privacy Policy for the full picture.",
  },
  {
    q: "Can Wandr help with booking?",
    a: "Not yet — Wandr is currently a planning tool. You'll use your itinerary as a guide and book through the venues directly. Booking integrations are on the product roadmap.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 py-6 text-left group"
        data-testid={`faq-toggle-${q.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
      >
        <span className="font-serif text-lg font-light text-foreground leading-snug group-hover:text-primary transition-colors">
          {q}
        </span>
        <span className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
          {open
            ? <Minus className="w-4 h-4" aria-hidden="true" />
            : <Plus  className="w-4 h-4" aria-hidden="true" />
          }
        </span>
      </button>
      {open && (
        <div className="pb-6 -mt-2">
          <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm mb-10">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>
        </Link>

        <h1 className="font-serif text-5xl font-light text-foreground mb-2 tracking-wide">
          Questions Worth Asking
        </h1>
        <p className="text-muted-foreground text-sm mb-14 max-w-xl leading-relaxed">
          Everything you'd want to know before planning your first adventure with Wandr.
        </p>

        <div role="list" aria-label="Frequently asked questions">
          {FAQS.map((item) => (
            <div key={item.q} role="listitem">
              <FaqItem q={item.q} a={item.a} />
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 rounded-2xl border border-border bg-card">
          <p className="font-serif text-xl font-light text-foreground mb-1">
            Still have questions?
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            We're a small team and we actually read our messages.
          </p>
          <Link href="/contact">
            <button className="text-sm font-medium text-primary hover:underline transition-colors">
              Get in touch →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
