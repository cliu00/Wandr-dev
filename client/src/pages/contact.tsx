import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, MapPin, MessageCircle } from "lucide-react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    toast({ title: "Message received", description: "We'll be in touch within 1–2 business days." });
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm mb-10">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </Link>

        <h1 className="font-serif text-5xl font-light text-foreground mb-2 tracking-wide">Get in touch</h1>
        <p className="text-muted-foreground text-base mb-14 max-w-md leading-relaxed">
          Questions, feedback, or partnership enquiries — we read everything and respond within a business day.
        </p>

        <div className="grid md:grid-cols-2 gap-14">
          <div>
            {sent ? (
              <div className="py-12 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl font-light">Message sent</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thanks for reaching out. We'll be in touch within 1–2 business days.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }}
                  className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wide uppercase">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wide uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    data-testid="input-contact-email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wide uppercase">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what's on your mind…"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                    data-testid="input-contact-message"
                  />
                </div>
                <Button type="submit" className="rounded-full w-full" data-testid="button-contact-submit">
                  Send message
                </Button>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-8 pt-1">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-foreground text-sm mb-0.5">Email</div>
                <div className="text-muted-foreground text-sm">hello@wandr.app</div>
                <div className="text-muted-foreground text-sm">We respond within 1–2 business days</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-foreground text-sm mb-0.5">Based in</div>
                <div className="text-muted-foreground text-sm">Vancouver, BC</div>
                <div className="text-muted-foreground text-sm">Canada</div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm leading-relaxed">
                For press enquiries, partnerships, or API access, please email us directly at{" "}
                <span className="text-foreground">partnerships@wandr.app</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-serif text-base font-light tracking-widest text-foreground">Wandr</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy"><span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:text-foreground transition-colors cursor-pointer">Terms</span></Link>
            <Link href="/contact"><span className="hover:text-foreground transition-colors cursor-pointer">Contact</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
