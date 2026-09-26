"use client"
import { navItems} from 'apps/user-ui/src/configs/constants';
import { AlignLeft, ChevronDown, HeartIcon, Menu, ShoppingCart,} from 'lucide-react';
import React,{ useEffect,useState, useRef } from 'react'
import { getCartCount, onCartChange } from '../../utils/cart';
import Link from 'next/link';
import useUser from 'apps/user-ui/src/hooks/useUser';
import useAccount from 'apps/user-ui/src/hooks/useAccount';
import ProfileArea from './profile-area';

const HeaderButton = () => {
   const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
   const [isSticky, setIsSticky] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
   const { user, isLoading } = useUser();
  const { account } = useAccount();
  const [cartCount, setCartCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  const departments = [
    'Cannabis sativa',
    'Cannabis indica',
    'Cannabis ruderalis',
    'Cannabis hybrids',
  ];

   useEffect(() => {
     const handleScroll = () => {
       if (window.scrollY > 100) {
         setIsSticky(true);
       } else {
         setIsSticky(false);
       }
     };

     window.addEventListener('scroll', handleScroll);

     return () => {
       window.removeEventListener('scroll', handleScroll);
     };
   }, []);

    useEffect(() => {
      try { setCartCount(getCartCount()) } catch (e) {}
      const off = onCartChange((c) => setCartCount(c));
      const init = (e: Event) => { const d = (e as CustomEvent).detail; setCartCount(d?.count ?? getCartCount()) }
      window.addEventListener('oherbuy_cart_initialized', init as EventListener)
      return () => { off(); window.removeEventListener('oherbuy_cart_initialized', init as EventListener) }
    }, [])

  // close dropdown on outside click or Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (show) {
        if (dropdownRef.current && dropdownRef.current.contains(target)) return;
        if (buttonRef.current && buttonRef.current.contains(target)) return;
        setShow(false);
      }
      if (mobileNavOpen && mobileNavRef.current && !mobileNavRef.current.contains(target)) {
        setMobileNavOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShow(false);
        setMobileNavOpen(false);
      }
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [show, mobileNavOpen]);

  return (
  <div>
    <div
      className={`w-full flex transition-all transition-duration-300ms bg-white  ${
        isSticky
          ?  ' display-flex align-items-center justify-content-center fixed top-0 left-0 right-0 z-[500] bg-white shadow-lg h-[60px]'
          : 'relative'
      }`}
      style={isSticky ? { width: '100%' } : {}}
    >
      <div className={`w-[92%] max-w-7xl min-w-0 h-auto min-h-[45px] m-auto flex flex-wrap gap-2 justify-between items-center py-2 ${isSticky ? 'pt-0' : ''}`}>
        {/* All dropdown */}
        <div className="relative w-full sm:w-auto flex items-center gap-2">
          <div
            ref={buttonRef}
            tabIndex={0}
            role="button"
            aria-haspopup="true"
            aria-expanded={show}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShow(s => !s); } if (e.key === 'Escape') setShow(false); }}
            className={`flex-1 sm:flex-none sm:w-[260px] h-[40px] cursor-pointer flex items-center gap-3 px-3 rounded-md bg-green-700 transition-shadow hover:shadow-lg ${isSticky ? '' : ''}`}
            onClick={() => setShow(!show)}
          >
            <AlignLeft color="white" />
            <div className="flex-1">
              <span className='text-sm text-white font-bold'>All Department</span>
            </div>
            <ChevronDown color="white" />
          </div>

          {/* Dropdown panel */}
          {show && (
            <div
              ref={dropdownRef}
              role="menu"
              aria-label="All Departments"
              className={`absolute left-0 mt-2 w-[min(360px,calc(100vw-2rem))] max-h-[420px] bg-white border rounded-md shadow-lg z-50 transition transform origin-top-left animate-fade-in`}>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search departments..."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-auto pr-2">
                  {departments.filter(d => d.toLowerCase().includes(search.toLowerCase())).map((d, idx) => (
                    <a
                      key={idx}
                      role="menuitem"
                      tabIndex={0}
                      href="#"
                      onClick={(e) => { e.preventDefault(); setShow(false); /* TODO: navigate to department */ }}
                      className="block px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      {d}
                    </a>
                  ))}
                  {departments.filter(d => d.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <div className="col-span-2 text-sm text-gray-500 px-3 py-2">No departments found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={mobileNavRef} className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="h-[40px] flex items-center gap-2 px-3 rounded-md border border-green-700 text-green-700 hover:bg-green-50"
              aria-expanded={mobileNavOpen}
              aria-haspopup="true"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
              <span className="text-sm font-semibold">Menu</span>
            </button>

            {mobileNavOpen && (
              <nav className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-md border bg-white p-2 shadow-lg" aria-label="Mobile navigation">
                {navItems.map((item: NavItemsTypes, index: number) => {
                  const isSellerLink = item.title?.toLowerCase().includes('seller');
                  const href = isSellerLink
                    ? `${process.env.NEXT_PUBLIC_SELLER_UI_LINK || 'http://localhost:3001'}/${account && account.sellerId ? '' : 'signup'}`
                    : item.href;

                  return (
                    <Link
                      key={index}
                      href={href}
                      target={isSellerLink ? '_blank' : undefined}
                      rel={isSellerLink ? 'noopener noreferrer' : undefined}
                      onClick={() => setMobileNavOpen(false)}
                      className="block rounded px-3 py-2 font-medium hover:bg-green-50"
                    >
                      {isSellerLink && account?.sellerId ? 'Open Shop' : item.title}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* old dropdown placeholder removed */}

        {/* {navlinks} */}
        <div className="hidden sm:flex items-center gap-4 lg:gap-10">
          {navItems.map((i: NavItemsTypes, index: number) => {
            const sellerBase = process.env.NEXT_PUBLIC_SELLER_UI_LINK || 'http://localhost:3001';
            // For the Become A Seller item, open seller-ui in a new tab.
            if (i.title && i.title.toLowerCase().includes('seller')) {
                const href = account && account.sellerId ? `${sellerBase}/` : `${sellerBase}/signup`;
                const label = account && account.sellerId ? 'Open Shop' : i.title;
                return (
                  <a
                    key={index}
                    className="px-2 font-medium text-[1rem]"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                );
            }

            // override last item previously used for create-seller-shop; keep default internal links for others
            return (
              <Link className="px-2 font-medium text-[1rem]" href={i.href} key={index}>
                {i.title}
              </Link>
            );
          })}
        </div>
        <div className='hidden lg:flex items-center justify-center gap-10'>
          {isSticky && (
            <>
            <div className='flex items-center justify-center gap-10'> 
              <div className="flex items-center justify-center gap-2">
                <ProfileArea user={user} isLoading={isLoading} />
              </div>
            </div>
            <div className="flex gap-5 justify-center items-center">
                <Link href={"/watchlist"} className='relative'>
                  <HeartIcon />
                  <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute top-[-1.5px] right-[-1.5px]">
                     <span className="text-[0.7rem] leading-none flex items-center justify-center">0</span>
                  </div>
                </Link>
                <Link href={"/cart"} className='relative'>
                  <ShoppingCart />
                  <div className="w-[16px] h-[16px] rounded-full bg-green-700 flex items-center justify-center font-bold text-white absolute top-[-1.5px] right-[-1.5px] ">
                   <span className='text-[0.7rem] leading-none flex items-center justify-center'>{cartCount}</span>
                  </div>
                </Link>
            </div></>
          )}
        </div>
      </div>
    </div>
  </div>
  )
}

export default HeaderButton;

// The shared `ProfileArea` component is imported from `./profile-area`.
