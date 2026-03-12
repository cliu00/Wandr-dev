import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, Check } from "lucide-react";
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

const PASSWORD_RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function SignUp() {
  const [, navigate] = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Your name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (!PASSWORD_RULES.every((r) => r.test(password))) e.password = "Password doesn't meet all requirements.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      signup(name.trim(), email, password);
      toast({ title: `Welcome to Wandr, ${name.split(" ")[0]}.`, description: "Your account is ready." });
      navigate("/");
    }, 800);
  }

  function handleGoogle() {
    setLoading(true);
    setTimeout(() => {
      signup("Alex", "alex@example.com", "");
      toast({ title: "Signed up with Google.", description: "Welcome to Wandr." });
      navigate("/");
    }, 800);
  }

  const inputBase =
    "w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground/60 outline-none transition-colors";

  const passwordStrength = touched ? PASSWORD_RULES.filter((r) => r.test(password)).length : -1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
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
          Create your account.
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Save trips, invite your crew, and plan smarter.
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium text-foreground mb-5 disabled:opacity-60"
          data-testid="button-google-signup"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
              placeholder="Alex Reyes"
              autoComplete="name"
              className={`${inputBase} ${errors.name ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary/50"}`}
              data-testid="input-name"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

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
                onChange={(e) => { setPassword(e.target.value); setTouched(true); setErrors((prev) => ({ ...prev, password: undefined })); }}
                placeholder="Create a password"
                autoComplete="new-password"
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

            {/* Password rules */}
            {touched && password.length > 0 && (
              <div className="mt-2.5 flex flex-col gap-1.5">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <div key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${met ? "bg-primary" : "bg-muted"}`}>
                        {met && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            )}
            {errors.password && passwordStrength < PASSWORD_RULES.length && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-full text-base py-5 mt-1"
            disabled={loading}
            data-testid="button-submit-signup"
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/terms"><span className="underline hover:text-foreground cursor-pointer">Terms</span></Link>
          {" "}and{" "}
          <Link href="/privacy"><span className="underline hover:text-foreground cursor-pointer">Privacy Policy</span></Link>.
        </p>

        <p className="text-sm text-muted-foreground text-center mt-5">
          Already have an account?{" "}
          <Link href="/sign-in">
            <span className="text-foreground font-medium hover:underline cursor-pointer" data-testid="link-signin">
              Log in
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
