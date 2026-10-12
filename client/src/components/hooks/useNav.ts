import { useEffect, useState } from 'react';

/**
 * Tracks whether the page has scrolled past the nav threshold,
 * and whether the mobile menu is open. Replaces the old
 * `.nav`/`.nav-toggle`/`.nav-links` DOM code in main.js.
 *
 * Usage:
 *   const { scrolled, menuOpen, toggleMenu, closeMenu } = useNav();
 *   <nav className={scrolled ? 'nav scrolled' : 'nav'}>
 *   <ul className={menuOpen ? 'nav-links open' : 'nav-links'}>
 *   <button onClick={toggleMenu} />
 *   <a onClick={closeMenu} href="#features">Features</a>
 */
export function useNav(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return { scrolled, menuOpen, toggleMenu, closeMenu };
}
