import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

function WandrLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="19" r="2.5" fill="hsl(var(--primary))" />
      <circle cx="19" cy="5" r="2.5" fill="hsl(var(--primary))" />
      <path d="M5 16.5C5 11 19 13 19 7.5" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function SignIn() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back.", description: "You're now signed in." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground/60 outline-none transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      {/* Back button */}
      <button
        onClick={() => window.history.length > 1 ? window.history.back() : navigate("/")}
        className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        data-testid="button-back"
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 justify-center mb-10 cursor-pointer">
            <WandrLogo />
            <span className="font-serif text-2xl font-bold tracking-widest text-foreground">Wandr</span>
          </div>
        </Link>

        {/* Heading */}
        <h1 className="font-serif text-3xl font-light text-foreground mb-1 text-center">
          Welcome back.
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Sign in to access your saved trips.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
              placeholder="you@example.com"
              autoComplete="email"
              className={`${inputBase} ${errors.email ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary/50"}`}
              data-testid="input-email"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                placeholder="Your password"
                autoComplete="current-password"
                className={`${inputBase} pr-11 ${errors.password ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary/50"}`}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div className="text-right -mt-1">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => toast({ title: "Check your inbox.", description: "Password reset is available in the full version." })}
              data-testid="button-forgot-password"
            >
              Forgot your password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full text-base py-5 mt-1"
            disabled={loading}
            data-testid="button-submit-signin"
          >
            {loading ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{" "}
          <Link href="/sign-up">
            <span className="text-foreground font-medium hover:underline cursor-pointer" data-testid="link-signup">
              Sign up
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
