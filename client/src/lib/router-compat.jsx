'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

export const OutletContext = createContext(null);

export const Link = React.forwardRef(({ to, href, children, ...props }, ref) => {
  const target = href || to || '#';
  return (
    <NextLink ref={ref} href={target} {...props}>
      {children}
    </NextLink>
  );
});
Link.displayName = 'Link';

export const NavLink = React.forwardRef(({ to, href, className, children, ...props }, ref) => {
  const target = href || to || '#';
  const pathname = usePathname();
  const isActive = pathname === target;
  
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <NextLink ref={ref} href={target} className={resolvedClassName} {...props}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </NextLink>
  );
});
NavLink.displayName = 'NavLink';

export function useNavigate() {
  const router = useRouter();
  return React.useCallback((to, options) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      else if (to === 1) router.forward();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router]);
}

export function useLocation() {
  const pathname = usePathname() || '/';
  
  return useMemo(() => ({
    pathname,
    search: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
    key: 'default',
  }), [pathname]);
}

export function useParams() {
  const params = useNextParams();
  return params || {};
}

export function useSearchParams() {
  const nextParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = React.useCallback((newParams, options) => {
    const searchString = typeof newParams === 'string'
      ? newParams
      : new URLSearchParams(newParams).toString();
    const query = searchString ? `?${searchString}` : '';
    const target = `${pathname}${query}`;
    if (options?.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  }, [router, pathname]);

  return [nextParams, setSearchParams];
}

export function Navigate({ to, replace = false }) {
  const router = useRouter();
  useEffect(() => {
    if (to) {
      if (replace) router.replace(to);
      else router.push(to);
    }
  }, [to, replace, router]);
  return null;
}

export function Outlet() {
  const context = useContext(OutletContext);
  return context?.children || null;
}

export function useOutletContext() {
  const context = useContext(OutletContext);
  return context?.data;
}

export default {
  Link,
  NavLink,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  Outlet,
  useOutletContext,
};
