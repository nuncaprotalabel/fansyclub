import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleUserRound,
  ExternalLink,
  Fingerprint,
  Globe2,
  KeyRound,
  Layers3,
  Loader2,
  LogIn,
  LogOut,
  LockKeyhole,
  Menu,
  Plus,
  Radar,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react';
import {
  getCheckAccessQueryKey,
  getGetCurrentUserQueryKey,
  getGetPublicWorldQueryKey,
  getHealthCheckQueryKey,
  getListMyWorldsQueryKey,
  useCheckAccess,
  useCreateWorld,
  useGetCurrentUser,
  useGetPublicWorld,
  useHealthCheck,
  useListMyWorlds,
  useLogin,
  useLogout,
  useRegister,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';

const queryClient = new QueryClient();

type UserLike = {
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
  lastLoginAt?: string | null;
};

type WorldLike = {
  id: string;
  name: string;
  slug: string;
  status: string;
  updatedAt: string;
  createdAt: string;
};

function getErrorMessage(error: unknown, fallback = 'Something went sideways. Try again.') {
  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { message?: string; error?: string };
    return maybeError.message || maybeError.error || fallback;
  }
  return fallback;
}

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" data-testid="link-brand-home">
      <span className={`relative grid h-9 w-9 place-items-center rounded-[11px] border ${inverse ? 'border-[#f8f0df]/25 bg-[#f8f0df]/10' : 'border-[#f04f38]/40 bg-[#f04f38]'}`}>
        <span className={`h-3.5 w-3.5 rounded-full border-[3px] ${inverse ? 'border-[#f8f0df]' : 'border-[#17162c]'}`} />
        <span className={`absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${inverse ? 'bg-[#f8e36b]' : 'bg-[#f8e36b]'}`} />
      </span>
      <span className={`display text-[1.35rem] font-bold tracking-[-0.04em] ${inverse ? 'text-[#f8f0df]' : 'text-[#17162c]'}`}>FANSYCLUB</span>
    </Link>
  );
}

function ButtonLink({ href, children, variant = 'primary', className = '', testId }: { href: string; children: ReactNode; variant?: 'primary' | 'light' | 'ghost'; className?: string; testId: string }) {
  const styles = {
    primary: 'bg-[#f04f38] text-[#17162c] hover:-translate-y-0.5 hover:bg-[#f76651] shadow-[0_9px_0_#b93526]',
    light: 'bg-[#f8f0df] text-[#17162c] hover:-translate-y-0.5 hover:bg-white',
    ghost: 'border border-current/20 text-current hover:bg-current/10',
  };
  return <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold ${styles[variant]} ${className}`} data-testid={testId}>{children}<ArrowUpRight className="h-4 w-4" /></Link>;
}

function PublicNav() {
  return (
    <header className="absolute left-0 right-0 top-0 z-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <BrandMark inverse />
        <nav className="hidden items-center gap-8 text-sm text-[#f8f0df]/70 md:flex">
          <a href="#signal" className="hover:text-[#f8f0df]" data-testid="link-nav-signal">The signal</a>
          <a href="#studio" className="hover:text-[#f8f0df]" data-testid="link-nav-studio">Inside the studio</a>
          <a href="#manifesto" className="hover:text-[#f8f0df]" data-testid="link-nav-manifesto">Manifesto</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden px-2 py-2 text-sm font-semibold text-[#f8f0df]/80 hover:text-[#f8f0df] sm:block" data-testid="link-nav-login">Sign in</Link>
          <ButtonLink href="/register" variant="light" className="px-4 py-2.5" testId="link-nav-register">Enter the club</ButtonLink>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  const health = useHealthCheck({ query: { retry: false, queryKey: getHealthCheckQueryKey() } });
  return (
    <main className="noise min-h-[100dvh] overflow-hidden bg-[#17162c] text-[#f8f0df]">
      <section className="relative isolate min-h-[720px] overflow-hidden">
        <div className="absolute inset-0 -z-10 ink-grid opacity-60" />
        <div className="absolute -right-28 top-16 -z-10 h-[430px] w-[430px] rounded-full border-[1px] border-[#f8e36b]/40 bg-[#f8e36b]/10 blur-[1px]" />
        <div className="absolute -right-12 top-32 -z-10 h-[300px] w-[300px] rounded-full border border-[#f04f38]/60" />
        <div className="absolute left-[42%] top-[46%] -z-10 h-24 w-24 rotate-12 bg-[#5f6eea] opacity-80 blur-[1px]" />
        <PublicNav />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-36 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pt-48">
          <div className="max-w-3xl">
            <div className="rise mb-8 inline-flex items-center gap-2 rounded-full border border-[#f8f0df]/20 bg-[#f8f0df]/[.06] px-3 py-2 text-xs text-[#f8f0df]/75">
              <span className="h-2 w-2 rounded-full bg-[#f8e36b]" />
              A private creative command center
            </div>
            <h1 className="display rise rise-1 max-w-4xl text-[clamp(3.5rem,8.5vw,8.3rem)] font-semibold leading-[.85] text-[#f8f0df]">
              Make your <span className="text-[#f04f38]">world</span> impossible to ignore.
            </h1>
            <p className="rise rise-2 mt-8 max-w-xl text-lg leading-relaxed text-[#f8f0df]/65 sm:text-xl">
              FANSYCLUB gives artists, creators, and entrepreneurs the place behind the place — shape the signal, launch the World, keep the keys.
            </p>
            <div className="rise rise-3 mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/register" testId="link-hero-start">Build your World</ButtonLink>
              <Link href="/login" className="inline-flex items-center gap-2 px-1 py-3 text-sm font-bold text-[#f8f0df]/80 hover:text-[#f8e36b]" data-testid="link-hero-login">I already have a World <ChevronRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="relative hidden min-h-[430px] lg:block">
            <div className="float-slow absolute right-[12%] top-10 w-[300px] rotate-[-7deg] rounded-[2rem] border border-[#f8f0df]/20 bg-[#f8f0df]/10 p-5 backdrop-blur-md">
              <div className="mb-20 flex items-center justify-between">
                <span className="mono-label text-[#f8f0df]/55">WORLD / 001</span>
                <Globe2 className="h-5 w-5 text-[#f8e36b]" />
              </div>
              <p className="display text-4xl font-semibold">A room for<br /><span className="text-[#f8e36b]">the real ones.</span></p>
              <div className="mt-10 flex items-center justify-between border-t border-[#f8f0df]/15 pt-3 text-xs text-[#f8f0df]/55"><span>public / private</span><span>always in progress</span></div>
            </div>
            <div className="float-slow absolute bottom-8 left-[8%] w-[215px] rotate-[7deg] rounded-2xl bg-[#f04f38] p-5 text-[#17162c] [animation-delay:-2s]">
              <Sparkles className="mb-10 h-5 w-5" />
              <p className="display text-3xl font-semibold leading-[.9]">The work is the flex.</p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[.1em]">FANSYCLUB / NOTES</p>
            </div>
            <div className="absolute bottom-0 right-0 flex items-center gap-2 rounded-full border border-[#f8f0df]/15 bg-[#17162c] px-3 py-2 text-xs text-[#f8f0df]/55">
              <span className="h-2 w-2 rounded-full bg-[#50b88d]" />
              {health.isLoading ? 'Connecting to foundation' : health.isError ? 'Foundation offline' : 'Foundation operational'}
            </div>
          </div>
        </div>
      </section>
      <section id="signal" className="border-t border-[#f8f0df]/10 bg-[#f8f0df] py-20 text-[#17162c] lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="mono-label text-[#f04f38]">01 / THE SIGNAL</p>
              <h2 className="display mt-5 max-w-sm text-5xl font-semibold leading-[.92] sm:text-6xl">Not a feed. A foundation.</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="border-t-2 border-[#17162c] pt-4">
                <Layers3 className="mb-10 h-7 w-7 text-[#5f6eea]" />
                <h3 className="display text-3xl font-semibold">Your World, your rules.</h3>
                <p className="mt-3 leading-relaxed text-[#17162c]/60">Build the public surface around what you actually make — not what a platform thinks you should post.</p>
              </div>
              <div className="border-t-2 border-[#17162c] pt-4">
                <Fingerprint className="mb-10 h-7 w-7 text-[#f04f38]" />
                <h3 className="display text-3xl font-semibold">Private by design.</h3>
                <p className="mt-3 leading-relaxed text-[#17162c]/60">The studio is where rough edges stay useful. Shape your work before you send it into the room.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="studio" className="bg-[#f04f38] px-5 py-20 text-[#17162c] lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="mono-label text-[#17162c]/60">02 / INSIDE THE STUDIO</p>
            <h2 className="display mt-5 max-w-xl text-5xl font-semibold leading-[.9] sm:text-7xl">A sharper room for the next move.</h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-[#17162c]/70">One place to name the thing, claim the URL, and keep the creative direction yours.</p>
            <ButtonLink href="/register" variant="ghost" className="mt-8 border-[#17162c]/30" testId="link-studio-cta">Claim your space</ButtonLink>
          </div>
          <div className="paper-grid relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[#17162c]/15 bg-[#f8f0df]/70 p-5 sm:p-8">
            <div className="absolute right-[-6%] top-[-10%] h-48 w-48 rounded-full border-[24px] border-[#5f6eea]/50" />
            <div className="relative grid gap-3 sm:grid-cols-[1fr_.8fr]">
              <div className="rounded-2xl bg-[#17162c] p-5 text-[#f8f0df] sm:row-span-2">
                <div className="flex justify-between"><span className="mono-label text-[#f8f0df]/45">WORLD STATUS</span><span className="h-2 w-2 rounded-full bg-[#50b88d]" /></div>
                <p className="display mt-20 text-4xl">In progress<br /><span className="text-[#f8e36b]">on purpose.</span></p>
                <div className="mt-12 flex justify-between border-t border-[#f8f0df]/15 pt-3 text-xs text-[#f8f0df]/45"><span>studio / private</span><span>v. 0.1</span></div>
              </div>
              <div className="rounded-2xl border border-[#17162c]/15 bg-[#f8f0df] p-5">
                <span className="mono-label text-[#17162c]/45">01 / NAME IT</span>
                <p className="display mt-10 text-2xl font-semibold">The first signal is a name.</p>
              </div>
              <div className="rounded-2xl border border-[#17162c]/15 bg-[#5f6eea] p-5 text-[#f8f0df]">
                <span className="mono-label text-[#f8f0df]/60">02 / SHARE IT</span>
                <p className="display mt-10 text-2xl font-semibold">Make the door easy to find.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="manifesto" className="overflow-hidden bg-[#17162c] py-20 text-[#f8f0df] lg:py-28">
        <div className="marquee flex w-max gap-8 whitespace-nowrap border-y border-[#f8f0df]/15 py-6 text-4xl font-semibold sm:text-6xl">
          <span>MAKE THE ROOM</span><span className="text-[#f8e36b]">+</span><span>KEEP THE KEYS</span><span className="text-[#f04f38]">+</span><span>MAKE THE ROOM</span><span className="text-[#f8e36b]">+</span><span>KEEP THE KEYS</span>
        </div>
        <div className="mx-auto max-w-7xl px-5 pt-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <p className="mono-label text-[#f8f0df]/45">03 / A SMALL MANIFESTO</p>
            <div>
              <p className="display max-w-4xl text-4xl font-medium leading-[.96] sm:text-6xl">The internet is noisy. Your World should feel like a room someone is lucky to enter.</p>
              <div className="mt-12 flex flex-wrap items-center gap-5"><ButtonLink href="/register" variant="light" testId="link-manifesto-cta">Start a World</ButtonLink><span className="text-sm text-[#f8f0df]/45">No performance required.</span></div>
            </div>
          </div>
        </div>
      </section>
      <footer className="flex flex-col justify-between gap-4 bg-[#17162c] px-5 pb-8 text-xs text-[#f8f0df]/40 sm:flex-row lg:px-10"><span>© 2025 FANSYCLUB FOUNDATION</span><span>For people building something real.</span></footer>
    </main>
  );
}

function AuthLayout({ eyebrow, title, description, children, footer }: { eyebrow: string; title: string; description: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="noise min-h-[100dvh] bg-[#f8f0df] text-[#17162c]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-[#17162c] p-10 text-[#f8f0df] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 ink-grid opacity-50" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border-[30px] border-[#5f6eea]/40" />
          <div className="relative"><BrandMark inverse /></div>
          <div className="relative max-w-md">
            <p className="mono-label text-[#f8e36b]">THE ROOM BEHIND THE ROOM</p>
            <p className="display mt-6 text-6xl font-semibold leading-[.88]">Keep the signal close.</p>
            <p className="mt-6 max-w-xs leading-relaxed text-[#f8f0df]/55">Your World starts private. That is where the good decisions happen.</p>
          </div>
          <div className="relative flex items-center gap-3 text-xs text-[#f8f0df]/40"><span className="h-2 w-2 rounded-full bg-[#50b88d]" />foundation / online</div>
        </div>
        <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-24 lg:py-10">
          <div className="flex justify-between lg:justify-end"><div className="lg:hidden"><BrandMark /></div><Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#17162c]/50 hover:text-[#f04f38]" data-testid="link-auth-back"><X className="h-4 w-4" /> close</Link></div>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <p className="mono-label text-[#f04f38]">{eyebrow}</p>
            <h1 className="display mt-5 text-5xl font-semibold leading-[.9] sm:text-6xl">{title}</h1>
            <p className="mt-5 leading-relaxed text-[#17162c]/55">{description}</p>
            <div className="mt-9">{children}</div>
            <div className="mt-8 border-t border-[#17162c]/10 pt-6 text-sm text-[#17162c]/55">{footer}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FormField({ label, name, type = 'text', value, onChange, placeholder, autoComplete }: { label: string; name: string; type?: string; value: string; onChange: (value: string) => void; placeholder: string; autoComplete?: string }) {
  return <label className="block" htmlFor={name}><span className="mono-label mb-2 block text-[#17162c]/55">{label}</span><input id={name} name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} required className="w-full rounded-xl border border-[#17162c]/15 bg-[#fffaf0] px-4 py-3.5 text-[#17162c] outline-none placeholder:text-[#17162c]/30 focus:border-[#f04f38] focus:ring-2 focus:ring-[#f04f38]/15" data-testid={`input-${name}`} /></label>;
}

function FormError({ message }: { message: string }) {
  return <div className="mt-4 rounded-xl border border-[#f04f38]/30 bg-[#f04f38]/10 px-4 py-3 text-sm text-[#a52f20]" data-testid="status-form-error">{message}</div>;
}

function Login() {
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ data: { email, password } }, { onSuccess: (result) => { client.setQueryData(getGetCurrentUserQueryKey(), result.user); setLocation('/studio'); } });
  };
  return <AuthLayout eyebrow="WELCOME BACK / 00" title="Back to the room." description="Sign in to pick up the thread, check your World, and keep moving." footer={<span>New here? <Link href="/register" className="font-bold text-[#f04f38] hover:underline" data-testid="link-login-register">Create an account</Link></span>}>
    <form onSubmit={submit} className="space-y-5" data-testid="form-login">
      <FormField label="Email" name="email" type="email" value={email} onChange={setEmail} placeholder="you@yourworld.com" autoComplete="email" />
      <FormField label="Password" name="password" type="password" value={password} onChange={setPassword} placeholder="At least 10 characters" autoComplete="current-password" />
      {login.isError && <FormError message={getErrorMessage(login.error, 'That combination did not open the door.')} />}
      <button type="submit" disabled={login.isPending} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17162c] px-5 py-4 font-bold text-[#f8f0df] hover:-translate-y-0.5 hover:bg-[#272544] disabled:cursor-wait disabled:opacity-60" data-testid="button-login-submit">{login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} {login.isPending ? 'Opening your room…' : 'Sign in'}</button>
    </form>
  </AuthLayout>;
}

function Register() {
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const register = useRegister();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    register.mutate({ data: { name, username, email, password } }, { onSuccess: (result) => { client.setQueryData(getGetCurrentUserQueryKey(), result.user); setLocation('/studio'); } });
  };
  return <AuthLayout eyebrow="MAKE AN ENTRANCE / 01" title="Name the thing." description="Create your account, then give the world a name it can remember." footer={<span>Already have a room? <Link href="/login" className="font-bold text-[#f04f38] hover:underline" data-testid="link-register-login">Sign in</Link></span>}>
    <form onSubmit={submit} className="space-y-4" data-testid="form-register">
      <FormField label="Your name" name="name" value={name} onChange={setName} placeholder="The person behind the work" autoComplete="name" />
      <FormField label="Username" name="username" value={username} onChange={(value) => setUsername(value.replace(/[^a-zA-Z0-9_]/g, ''))} placeholder="your_signal" autoComplete="username" />
      <FormField label="Email" name="email" type="email" value={email} onChange={setEmail} placeholder="you@yourworld.com" autoComplete="email" />
      <FormField label="Password" name="password" type="password" value={password} onChange={setPassword} placeholder="10 characters minimum" autoComplete="new-password" />
      {register.isError && <FormError message={getErrorMessage(register.error, 'We could not make the account yet.')} />}
      <button type="submit" disabled={register.isPending} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f04f38] px-5 py-4 font-bold text-[#17162c] shadow-[0_8px_0_#b93526] hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" data-testid="button-register-submit">{register.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {register.isPending ? 'Setting the room…' : 'Create account'}</button>
    </form>
  </AuthLayout>;
}

function LoadingScreen({ label = 'Checking the room' }: { label?: string }) {
  return <main className="grid min-h-[100dvh] place-items-center bg-[#f8f0df] p-5 text-[#17162c]"><div className="w-full max-w-sm space-y-5 text-center"><div className="mx-auto h-3 w-40 animate-pulse rounded-full bg-[#17162c]/10" /><div className="mx-auto h-3 w-56 animate-pulse rounded-full bg-[#17162c]/10" /><p className="mono-label text-[#17162c]/45">{label}</p></div></main>;
}

function AuthGate({ children }: { children: (user: UserLike) => ReactNode }) {
  const [, setLocation] = useLocation();
  const currentUser = useGetCurrentUser({ query: { retry: false, queryKey: getGetCurrentUserQueryKey() } });
  useEffect(() => {
    if (currentUser.isError) setLocation('/login');
  }, [currentUser.isError, setLocation]);
  if (currentUser.isLoading) return <LoadingScreen />;
  if (!currentUser.data) return null;
  return <>{children(currentUser.data as UserLike)}</>;
}

function PrivateShell({ user, children }: { user: UserLike; children: ReactNode }) {
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const signOut = () => logout.mutate(undefined, { onSuccess: () => { client.removeQueries({ queryKey: getGetCurrentUserQueryKey() }); setLocation('/'); } });
  return <div className="noise min-h-[100dvh] bg-[#f8f0df] text-[#17162c]">
    <header className="sticky top-0 z-20 border-b border-[#f8f0df]/10 bg-[#17162c] text-[#f8f0df]">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
        <div className="flex items-center gap-8"><BrandMark inverse /><span className="hidden h-5 w-px bg-[#f8f0df]/20 sm:block" /><span className="mono-label hidden text-[#f8f0df]/45 sm:block">private studio</span></div>
        <button className="rounded-lg p-2 text-[#f8f0df] md:hidden" onClick={() => setOpen(!open)} data-testid="button-mobile-menu">{open ? <X /> : <Menu />}</button>
        <div className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-3 border-b border-[#f8f0df]/10 bg-[#17162c] p-5 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}>
          <Link href="/studio" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#f8f0df]/70 hover:bg-[#f8f0df]/10 hover:text-[#f8f0df]" data-testid="link-shell-studio">Studio</Link>
          {user.role !== 'USER' && <Link href="/control-center" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#f8f0df]/70 hover:bg-[#f8f0df]/10 hover:text-[#f8f0df]" data-testid="link-shell-control-center">Control center</Link>}
          <div className="mx-1 hidden h-6 w-px bg-[#f8f0df]/15 md:block" />
          <div className="flex items-center gap-3 border-t border-[#f8f0df]/10 pt-3 md:border-0 md:pt-0"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#5f6eea] text-xs font-bold text-[#f8f0df]">{user.name.slice(0, 1).toUpperCase()}</div><div className="mr-2"><p className="text-sm font-bold">{user.name}</p><p className="mono-label text-[#f8f0df]/40">{user.role}</p></div><button onClick={signOut} className="rounded-lg p-2 text-[#f8f0df]/50 hover:bg-[#f8f0df]/10 hover:text-[#f04f38]" data-testid="button-logout"><LogOut className="h-4 w-4" /></button></div>
        </div>
      </div>
    </header>
    <div>{children}</div>
  </div>;
}

function WorldCard({ world }: { world: WorldLike }) {
  const published = world.status === 'PUBLISHED';
  return <article className="group relative overflow-hidden rounded-2xl border border-[#17162c]/10 bg-[#fffaf0] p-5 shadow-[0_10px_30px_-18px_#17162c] transition-transform hover:-translate-y-1" data-testid={`card-world-${world.id}`}>
    <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] ${published ? 'bg-[#50b88d]/15' : 'bg-[#f8e36b]/25'}`} />
    <div className="relative flex items-start justify-between"><span className="mono-label text-[#17162c]/45">{published ? 'LIVE WORLD' : 'DRAFT WORLD'}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${published ? 'bg-[#50b88d]/15 text-[#267653]' : 'bg-[#f8e36b]/50 text-[#755f00]'}`}>{world.status}</span></div>
    <h3 className="display relative mt-12 text-3xl font-semibold">{world.name}</h3>
    <p className="relative mt-2 font-mono text-xs text-[#17162c]/45">fansyclub.world/{world.slug}</p>
    <div className="relative mt-8 flex items-center justify-between border-t border-[#17162c]/10 pt-4"><span className="text-xs text-[#17162c]/45">Updated {new Date(world.updatedAt).toLocaleDateString()}</span><Link href={`/world/${world.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-[#f04f38] hover:gap-2" data-testid={`link-world-${world.id}`}>Open <ExternalLink className="h-3.5 w-3.5" /></Link></div>
  </article>;
}

function Studio() {
  return <AuthGate>{(user) => <PrivateShell user={user}><StudioContent user={user} /></PrivateShell>}</AuthGate>;
}

function StudioContent({ user }: { user: UserLike }) {
  const client = useQueryClient();
  const worlds = useListMyWorlds({ query: { enabled: true, queryKey: getListMyWorldsQueryKey(), retry: false } });
  const createWorld = useCreateWorld();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [showForm, setShowForm] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    createWorld.mutate({ data: { name, slug } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListMyWorldsQueryKey() }); setName(''); setSlug(''); setShowForm(false); } });
  };
  const list = (worlds.data || []) as WorldLike[];
  return <main className="mx-auto max-w-[1500px] px-5 py-10 lg:px-8 lg:py-14">
    <div className="flex flex-col justify-between gap-6 border-b border-[#17162c]/10 pb-10 md:flex-row md:items-end">
      <div><p className="mono-label text-[#f04f38]">GOOD TO SEE YOU / {user.username}</p><h1 className="display mt-4 text-6xl font-semibold leading-[.85] sm:text-8xl">Your studio.</h1><p className="mt-5 max-w-lg text-[#17162c]/55">This is the private side of the World. Name the next one, tune the signal, keep going.</p></div>
      <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#17162c] px-5 py-3 text-sm font-bold text-[#f8f0df] hover:-translate-y-0.5 hover:bg-[#272544] md:self-auto" data-testid="button-create-world"><Plus className="h-4 w-4" /> New World</button>
    </div>
    {showForm && <form onSubmit={submit} className="rise my-8 grid gap-4 rounded-2xl border border-[#f04f38]/30 bg-[#f04f38]/10 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end" data-testid="form-create-world"><FormField label="World name" name="world-name" value={name} onChange={setName} placeholder="A place worth returning to" /><FormField label="Slug" name="world-slug" value={slug} onChange={(value) => setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))} placeholder="your-world" /><button type="submit" disabled={createWorld.isPending} className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#f04f38] px-5 text-sm font-bold text-[#17162c] disabled:opacity-60" data-testid="button-submit-world">{createWorld.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {createWorld.isPending ? 'Creating…' : 'Create World'}</button>{createWorld.isError && <div className="md:col-span-3"><FormError message={getErrorMessage(createWorld.error, 'That World could not be created.')} /></div>}</form>}
    <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {worlds.isLoading && [1, 2, 3].map((item) => <div key={item} className="h-60 animate-pulse rounded-2xl bg-[#17162c]/[.06]" data-testid={`skeleton-world-${item}`} />)}
      {worlds.isError && <div className="rounded-2xl border border-[#f04f38]/30 bg-[#f04f38]/10 p-6 sm:col-span-2 xl:col-span-3"><p className="font-bold">The studio could not load.</p><p className="mt-2 text-sm text-[#17162c]/60">{getErrorMessage(worlds.error)}</p><button onClick={() => worlds.refetch()} className="mt-4 rounded-lg bg-[#17162c] px-4 py-2 text-sm font-bold text-[#f8f0df]" data-testid="button-retry-worlds">Try again</button></div>}
      {!worlds.isLoading && !worlds.isError && list.length === 0 && <div className="paper-grid rounded-2xl border border-dashed border-[#17162c]/20 p-10 sm:col-span-2 xl:col-span-3"><div className="max-w-md"><Radar className="h-8 w-8 text-[#5f6eea]" /><h2 className="display mt-8 text-4xl font-semibold">No Worlds yet.</h2><p className="mt-3 text-[#17162c]/55">The blank room is useful for exactly one minute. Give it a name and make it yours.</p><button onClick={() => setShowForm(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f04f38] px-4 py-3 text-sm font-bold" data-testid="button-empty-create-world"><Plus className="h-4 w-4" /> Create your first World</button></div></div>}
      {list.map((world) => <WorldCard key={world.id} world={world} />)}
    </div>
  </main>;
}

function ControlCenter() {
  return <AuthGate>{(user) => <PrivateShell user={user}><ControlCenterContent user={user} /></PrivateShell>}</AuthGate>;
}

function ControlCenterContent({ user }: { user: UserLike }) {
  const access = useCheckAccess({ permission: 'control-center' }, { query: { enabled: true, queryKey: getCheckAccessQueryKey({ permission: 'control-center' }), retry: false } });
  const health = useHealthCheck({ query: { retry: false, queryKey: getHealthCheckQueryKey() } });
  if (access.isLoading) return <LoadingScreen label="Checking your clearance" />;
  if (access.isError) return <main className="mx-auto max-w-3xl px-5 py-20 lg:px-8"><div className="rounded-3xl border border-[#f04f38]/30 bg-[#f04f38]/10 p-8"><LockKeyhole className="h-9 w-9 text-[#f04f38]" /><h1 className="display mt-8 text-5xl font-semibold">Clearance unavailable.</h1><p className="mt-4 text-[#17162c]/60">{getErrorMessage(access.error)}</p><button onClick={() => access.refetch()} className="mt-7 rounded-xl bg-[#17162c] px-5 py-3 text-sm font-bold text-[#f8f0df]" data-testid="button-retry-access">Check again</button></div></main>;
  if (!access.data?.allowed || (user.role !== 'OWNER' && user.role !== 'STAFF')) return <main className="mx-auto max-w-3xl px-5 py-20 lg:px-8"><div className="relative overflow-hidden rounded-3xl bg-[#17162c] p-8 text-[#f8f0df] sm:p-12"><div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[25px] border-[#f04f38]/50" /><ShieldCheck className="relative h-10 w-10 text-[#f8e36b]" /><p className="mono-label relative mt-10 text-[#f8f0df]/45">ACCESS CHECK / {access.data?.role || user.role}</p><h1 className="display relative mt-4 text-5xl font-semibold leading-[.9]">This room is not yours to open.</h1><p className="relative mt-5 max-w-md leading-relaxed text-[#f8f0df]/60">The control center is reserved for OWNER and STAFF roles. Your studio is still entirely yours.</p><Link href="/studio" className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-[#f8f0df] px-5 py-3 text-sm font-bold text-[#17162c]" data-testid="link-access-denied-studio">Back to studio <ArrowUpRight className="h-4 w-4" /></Link></div></main>;
  return <main className="mx-auto max-w-[1500px] px-5 py-10 lg:px-8 lg:py-14"><div className="border-b border-[#17162c]/10 pb-10"><p className="mono-label text-[#5f6eea]">FOUNDATION / {user.role}</p><h1 className="display mt-4 text-6xl font-semibold leading-[.85] sm:text-8xl">Control center.</h1><p className="mt-5 max-w-lg text-[#17162c]/55">A quiet view of the foundation beneath every World.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3"><div className="rounded-2xl bg-[#17162c] p-6 text-[#f8f0df]"><TerminalSquare className="h-6 w-6 text-[#f8e36b]" /><p className="mono-label mt-12 text-[#f8f0df]/45">SYSTEM STATUS</p><p className="display mt-3 text-4xl">{health.data?.status || (health.isLoading ? 'Checking…' : 'Offline')}</p></div><div className="rounded-2xl border border-[#17162c]/10 bg-[#fffaf0] p-6"><ShieldCheck className="h-6 w-6 text-[#50b88d]" /><p className="mono-label mt-12 text-[#17162c]/45">YOUR CLEARANCE</p><p className="display mt-3 text-4xl">{access.data.permission}</p><p className="mt-2 text-sm text-[#17162c]/50">Role: {access.data.role}</p></div><div className="rounded-2xl bg-[#5f6eea] p-6 text-[#f8f0df]"><CircleUserRound className="h-6 w-6" /><p className="mono-label mt-12 text-[#f8f0df]/60">SIGNED IN AS</p><p className="display mt-3 text-4xl">{user.username}</p><p className="mt-2 text-sm text-[#f8f0df]/60">{user.email}</p></div></div></main>;
}

function PublicWorld() {
  const { slug = '' } = useParams<{ slug: string }>();
  const world = useGetPublicWorld(slug, { query: { retry: false, queryKey: getGetPublicWorldQueryKey(slug) } });
  if (world.isLoading) return <LoadingScreen label="Finding the World" />;
  if (world.isError || !world.data) return <main className="grid min-h-[100dvh] place-items-center bg-[#17162c] p-5 text-[#f8f0df]"><div className="max-w-lg text-center"><Globe2 className="mx-auto h-10 w-10 text-[#f8e36b]" /><p className="mono-label mt-8 text-[#f8f0df]/45">WORLD NOT FOUND</p><h1 className="display mt-5 text-6xl font-semibold">This door is elsewhere.</h1><p className="mt-5 text-[#f8f0df]/55">{getErrorMessage(world.error, 'The World may still be private or the link may have changed.')}</p><ButtonLink href="/" variant="light" className="mt-8" testId="link-world-not-found-home">Return home</ButtonLink></div></main>;
  const data = world.data as WorldLike;
  return <main className="noise min-h-[100dvh] bg-[#f8f0df] text-[#17162c]"><header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10"><BrandMark /><span className="mono-label text-[#17162c]/40">PUBLIC WORLD / {data.status}</span></header><section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-20 lg:grid-cols-[.95fr_1.05fr] lg:px-10 lg:pt-28"><div><p className="mono-label text-[#f04f38]">A WORLD BY FANSYCLUB</p><h1 className="display mt-6 text-[clamp(4rem,9vw,9rem)] font-semibold leading-[.82]">{data.name}</h1><p className="mt-8 max-w-md text-lg leading-relaxed text-[#17162c]/60">You found the public room. It is still becoming, but the door is open.</p><div className="mt-10 flex items-center gap-2 text-sm font-bold"><span className="h-2 w-2 rounded-full bg-[#50b88d]" /> {data.status === 'PUBLISHED' ? 'Currently open' : 'A work in progress'}</div></div><div className="paper-grid relative min-h-[440px] overflow-hidden rounded-[2rem] bg-[#f04f38] p-7 sm:p-10"><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[35px] border-[#f8e36b]" /><div className="absolute bottom-8 left-8 h-24 w-24 rotate-12 bg-[#5f6eea]" /><div className="relative flex h-full min-h-[380px] flex-col justify-between"><div className="flex justify-between"><span className="mono-label">WORLD / {data.slug}</span><ArrowUpRight className="h-6 w-6" /></div><p className="display max-w-md text-5xl font-semibold leading-[.9] sm:text-7xl">There is more<br />to <span className="text-[#f8f0df]">come.</span></p><div className="flex justify-between border-t border-[#17162c]/20 pt-4 text-xs font-semibold uppercase tracking-[.1em]"><span>owned by an original</span><span>{new Date(data.createdAt).getFullYear()}</span></div></div></div></section><footer className="mx-auto flex max-w-7xl justify-between border-t border-[#17162c]/10 px-5 py-6 text-xs text-[#17162c]/45 lg:px-10"><span>FANSYCLUB FOUNDATION</span><Link href="/register" className="font-bold text-[#f04f38]" data-testid="link-public-world-join">Make your own World <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></Link></footer></main>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Landing} /><Route path="/login" component={Login} /><Route path="/register" component={Register} /><Route path="/studio" component={Studio} /><Route path="/control-center" component={ControlCenter} /><Route path="/world/:slug" component={PublicWorld} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;