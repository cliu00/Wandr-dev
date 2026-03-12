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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      toast({ title: "Welcome back.", description: "You're now signed in." });
      navigate("/");
    }, 700);
  }

  function handleGoogle() {
    setLoading(true);
    setTimeout(() => {
      login("alex@example.com", "");
      toast({ title: "Signed in with Google.", description: "Welcome to Wandr." });
      navigate("/");
    }, 800);
  }

  function handleApple() {
    setLoading(true);
    setTimeout(() => {
      login("alex@icloud.com", "");
      toast({ title: "Signed in with Apple.", description: "Welcome to Wandr." });
      navigate("/");
    }, 800);
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

        {/* Social sign-in buttons */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Apple */}
          <button
            onClick={handleApple}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 transition-colors text-sm font-medium text-white dark:text-black disabled:opacity-60"
            data-testid="button-apple-signin"
          >
            <svg className="w-4 h-4 fill-white dark:fill-black flex-shrink-0" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 460.8 1 347.4 1 238.1C1 85.7 97.1 7.5 190.9 7.5c58.2 0 106.7 38.9 142.3 38.9 33.9 0 87.5-41.4 154.8-41.4 24.3 0 108.2 2.6 168.4 83.1zm-158.8-75.8c-28.8-34.5-78-60.5-121.5-60.5-8.3 0-16.6.6-25 1.9 1.3 43.4 18.6 86 49.2 115.5 28.7 27.6 73.7 47.8 113.3 47.8 7.7 0 15.4-.6 23.1-1.9-1.3-38.9-17.9-79.8-39.1-102.8z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium text-foreground disabled:opacity-60"
            data-testid="button-google-signin"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

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
