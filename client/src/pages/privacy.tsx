import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/nav";

export default function Privacy() {
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

        <h1 className="font-serif text-5xl font-light text-foreground mb-2 tracking-wide">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-12">Last updated: March 2026</p>

        <div className="prose prose-neutral max-w-none space-y-10">
          {[
            {
              title: "1. Information We Collect",
              body: "When you use Wandr, we may collect the following types of information: information you provide directly (such as your name, email address, and travel preferences); usage data collected automatically (such as pages visited, interactions, and session duration); and location data, only if you grant permission, to surface nearby destinations.",
            },
            {
              title: "2. How We Use Your Information",
              body: "We use the information we collect to personalise your travel itinerary, improve our recommendations over time, communicate with you about your trips and account, and send you updates or offers where you have opted in to receive them. We do not sell your personal data to third parties.",
            },
            {
              title: "3. Data Sharing",
              body: "We may share your information with trusted service providers who assist us in operating our platform (such as hosting and analytics providers), subject to strict confidentiality obligations. We may also disclose information when required by law or to protect our rights and users.",
            },
            {
              title: "4. Cookies",
              body: "Wandr uses cookies and similar technologies to enhance your experience, remember your preferences, and analyse traffic. You can disable cookies in your browser settings, though some features of the platform may not function as expected.",
            },
            {
              title: "5. Data Retention",
              body: "We retain your personal data only for as long as necessary to provide our services and comply with our legal obligations. You may request deletion of your data at any time by contacting us at privacy@wandr.app.",
            },
            {
              title: "6. Your Rights",
              body: "Depending on your jurisdiction, you may have the right to access, correct, or delete the personal information we hold about you. To exercise these rights, please contact us at privacy@wandr.app. We will respond to all requests within 30 days.",
            },
            {
              title: "7. Security",
              body: "We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet is completely secure, and we cannot guarantee absolute security.",
            },
            {
              title: "8. Changes to This Policy",
              body: "We may update this Privacy Policy from time to time. We will notify you of material changes by updating the date at the top of this page or by sending you an email notification.",
            },
            {
              title: "9. Contact",
              body: "If you have questions about this Privacy Policy, please contact us at privacy@wandr.app or through our Contact page.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="font-serif text-2xl font-light text-foreground mb-3 tracking-wide">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-[15px]">{section.body}</p>
            </div>
          ))}
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
