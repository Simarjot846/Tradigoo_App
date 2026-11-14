'use client';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrandLogo } from '@/components/ui/brand-logo';
import { getRoleDisplayLabel } from '@/lib/roles';
import {
  Search,
  Menu,
  ShoppingCart,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Truck,
  ShoppingBag,
  X,
  ShieldCheck,
  Headphones,
  PlusSquare,
  Store,
  Building2,
  Award,
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

function getTrustTierStyles(score: number) {
  if (score >= 750) {
    return {
      label: 'Premier',
      badgeClass:
        'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-500/30 hover:bg-amber-100/80',
      iconClass: 'text-amber-600 dark:text-amber-400',
    };
  }
  if (score >= 550) {
    return {
      label: 'Verified',
      badgeClass:
        'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-500/30 hover:bg-emerald-100/80',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (score >= 400) {
    return {
      label: 'Standard',
      badgeClass:
        'bg-blue-50 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 hover:bg-blue-100/80',
      iconClass: 'text-blue-600 dark:text-blue-400',
    };
  }
  return {
    label: 'Watch',
    badgeClass:
      'bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100/80',
    iconClass: 'text-rose-600 dark:text-rose-400',
  };
}

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(decodeURIComponent(searchFromUrl));
    } else if (pathname !== '/marketplace') {
      setSearchQuery('');
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname, searchParams]);

  if (!mounted) {
    return (
      <div className="w-full h-14 sm:h-16 sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800" />
    );
  }

  if (pathname === '/' || pathname.startsWith('/auth')) return null;

  const role = user?.role || 'retailer';
  const isWholesaler = role === 'wholesaler';
  const isFounder = role === 'founder';
  const isEmployee = role === 'employee';
  const showSearch = !isEmployee;

  const currentTrustScore = typeof user?.trust_score === 'number' ? user.trust_score : 500;
  const trustStyles = getTrustTierStyles(currentTrustScore);

  const isNavPathActive = (targetPath: string) => {
    const [basePath, queryString] = targetPath.split('?');
    if (pathname !== basePath) return false;
    if (!queryString) {
      if (basePath === '/inventory' && searchParams.get('action') === 'add') return false;
      return true;
    }
    const targetParams = new URLSearchParams(queryString);
    for (const [k, v] of targetParams.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    await signOut();
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/marketplace?search=${encodeURIComponent(q)}`);
    } else {
      router.push('/marketplace');
    }
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (pathname === '/marketplace') {
      router.push('/marketplace');
    }
  };

  const navLinks = isFounder
    ? [
        { label: 'Console', path: '/dashboard', icon: ShieldCheck },
        { label: 'Marketplace', path: '/marketplace', icon: Store },
        { label: 'Profile', path: '/profile', icon: User },
      ]
    : isEmployee
    ? [
        { label: 'Operations Desk', path: '/dashboard', icon: Headphones },
        { label: 'Marketplace', path: '/marketplace', icon: Store },
        { label: 'Profile', path: '/profile', icon: User },
      ]
    : isWholesaler
    ? [
        { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Inventory', path: '/inventory', icon: Package },
        { label: 'Add SKU', path: '/inventory?action=add', icon: PlusSquare },
        { label: 'Orders', path: '/orders-received', icon: Truck },
        { label: 'Business', path: '/profile?tab=business', icon: Building2 },
      ]
    : [
        { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
        { label: 'Orders', path: '/my-orders', icon: Package },
        { label: 'Cart', path: '/cart', icon: ShoppingCart, badge: cartCount },
        { label: 'Profile', path: '/profile', icon: User },
      ];

  const mobileTabs = isFounder
    ? [
        { label: 'Console', path: '/dashboard', icon: ShieldCheck },
        { label: 'Catalog', path: '/marketplace', icon: Store },
        { label: 'Profile', path: '/profile', icon: User },
      ]
    : isEmployee
    ? [
        { label: 'Tickets', path: '/dashboard', icon: Headphones },
        { label: 'Catalog', path: '/marketplace', icon: Store },
        { label: 'Profile', path: '/profile', icon: User },
      ]
    : isWholesaler
    ? [
        { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Inventory', path: '/inventory', icon: Package },
        { label: 'Add SKU', path: '/inventory?action=add', icon: PlusSquare },
        { label: 'Orders', path: '/orders-received', icon: Truck },
        { label: 'Business', path: '/profile?tab=business', icon: Building2 },
      ]
    : [
        { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
        { label: 'Orders', path: '/my-orders', icon: Package },
        { label: 'Cart', path: '/cart', icon: ShoppingCart, badge: cartCount },
        { label: 'Profile', path: '/profile', icon: User },
      ];

  return (
    <>
      {/* Branded Single-Row Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Hamburger (mobile) + Single Brand Logo + Role Tag */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => router.push(user ? '/dashboard' : '/')}
              className="flex items-center gap-2 focus:outline-none"
              aria-label="Tradigoo Home"
            >
              <BrandLogo size="md" />
            </button>

            {user && (
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 whitespace-nowrap shrink-0">
                {getRoleDisplayLabel(role)}
              </span>
            )}
          </div>

          {/* Center: Prominent Search Bar (Desktop) */}
          {showSearch && (
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-md lg:max-w-lg items-center h-9 sm:h-10 rounded-xl bg-slate-100/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 overflow-hidden transition-all"
            >
              <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, suppliers..."
                className="flex-1 min-w-0 bg-transparent px-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="h-full px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Search
              </button>
            </form>
          )}

          {/* Right: Desktop Role Nav Links + Prominent Trust Score Badge + Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <nav className="hidden lg:flex items-center gap-0.5 mr-1">
              {navLinks.map((link) => {
                const active = isNavPathActive(link.path);
                const badgeCount = (link as any).badge;
                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => router.push(link.path)}
                    className={`relative px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{link.label}</span>
                    {typeof badgeCount === 'number' && badgeCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold inline-flex items-center justify-center tabular-nums">
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Prominent Live Trust Score Badge (Mobile + Desktop) */}
            {!loading && user && (
              <button
                type="button"
                onClick={() => router.push('/profile?tab=trust')}
                title={`Tradigoo Trust Score: ${currentTrustScore}/1000 (${trustStyles.label})`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-colors whitespace-nowrap shrink-0 tabular-nums ${trustStyles.badgeClass}`}
                aria-label={`Trust Score ${currentTrustScore} out of 1000`}
              >
                {currentTrustScore >= 750 ? (
                  <Award className={`w-3.5 h-3.5 shrink-0 ${trustStyles.iconClass}`} />
                ) : (
                  <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${trustStyles.iconClass}`} />
                )}
                <span className="hidden sm:inline font-semibold opacity-80">Trust</span>
                <span>{currentTrustScore}</span>
                <span className="hidden xl:inline text-[10px] font-semibold opacity-75">
                  · {trustStyles.label}
                </span>
              </button>
            )}

            {/* Mobile Search Toggle */}
            {showSearch && (
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen((v) => !v)}
                className="md:hidden p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 min-h-[38px] min-w-[38px] flex items-center justify-center"
                aria-label="Toggle search"
              >
                {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            )}

            {/* Compact Cart Icon on Mobile & Tablet (Desktop has Cart in nav or here) */}
            {!isWholesaler && !isFounder && !isEmployee && (
              <button
                type="button"
                onClick={() => router.push('/cart')}
                className="lg:hidden relative p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 min-h-[38px] min-w-[38px] flex items-center justify-center"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {loading ? (
              <div className="w-16 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden md:flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-blue-900 text-white text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs xl:text-sm font-semibold text-slate-800 dark:text-zinc-200 max-w-[90px] truncate">
                      {user.name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                >
                  <DropdownMenuLabel>
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 font-normal flex items-center gap-1.5 mt-0.5">
                      <span>{getRoleDisplayLabel(role)}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-200 tabular-nums">
                        Trust {currentTrustScore}/1000
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Home Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile?tab=trust')} className="cursor-pointer">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Trust Score &amp; GST
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" /> Profile Settings
                  </DropdownMenuItem>
                  {isWholesaler && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/inventory')} className="cursor-pointer">
                        <Package className="w-4 h-4 mr-2" /> Inventory
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/inventory?action=add')} className="cursor-pointer">
                        <PlusSquare className="w-4 h-4 mr-2" /> Add SKU
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/orders-received')} className="cursor-pointer">
                        <Truck className="w-4 h-4 mr-2" /> Orders Received
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isWholesaler && !isFounder && !isEmployee && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/marketplace')} className="cursor-pointer">
                        <ShoppingBag className="w-4 h-4 mr-2" /> Marketplace
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/my-orders')} className="cursor-pointer">
                        <Package className="w-4 h-4 mr-2" /> My Orders
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 dark:text-rose-400 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => router.push('/auth/login')}>
                  Sign In
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push('/auth/signup')}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Mobile Search Bar */}
        {isMobileSearchOpen && showSearch && (
          <div className="md:hidden px-3 pb-3 pt-1 border-t border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
            <form
              onSubmit={handleSearch}
              className="flex items-center h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
              <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, suppliers..."
                className="flex-1 px-2.5 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={handleClearSearch} className="p-1.5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="submit" className="h-full px-3.5 bg-blue-600 text-white text-xs font-semibold">
                Go
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Slide-Out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[82%] max-w-[300px] bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl pt-safe pb-safe">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
                <BrandLogo size="md" />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {user ? (
                <div className="py-4 border-b border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-900 text-white font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {getRoleDisplayLabel(role)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/profile?tab=trust');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${trustStyles.badgeClass}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className={`w-4 h-4 ${trustStyles.iconClass}`} />
                      Trust Score ({trustStyles.label})
                    </span>
                    <span className="tabular-nums">{currentTrustScore}/1000</span>
                  </button>
                </div>
              ) : (
                <div className="py-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                  <Button onClick={() => { setIsMobileMenuOpen(false); router.push('/auth/login'); }}>
                    Sign In
                  </Button>
                  <Button variant="outline" onClick={() => { setIsMobileMenuOpen(false); router.push('/auth/signup'); }}>
                    Register Business
                  </Button>
                </div>
              )}

              <div className="py-4 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isNavPathActive(link.path);
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push(link.path);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </span>
                      {typeof (link as any).badge === 'number' && (link as any).badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tabular-nums">
                          {(link as any).badge}
                        </span>
                      )}
                    </button>
                  );
                })}
                {user && isWholesaler && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/profile');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      pathname === '/profile' && !searchParams.get('tab')
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile &amp; Settings
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-medium text-slate-500">Theme</span>
                <ModeToggle />
              </div>
              {user && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar — Role-Separated 5-Item Alignment */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 pb-safe">
        <div className="grid grid-flow-col auto-cols-fr h-16 px-1">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isNavPathActive(tab.path);
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => router.push(tab.path)}
                className={`relative flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors px-1 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {typeof (tab as any).badge === 'number' && (tab as any).badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                      {(tab as any).badge}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-full leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
