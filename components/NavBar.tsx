"use client";

import { Home, Send, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/form", label: "HKL Form", icon: Send },
  // { href: "/interaction", label: "Interaction", icon: Pencil },
  { href: "/profile", label: "Profile", icon: User },
];

export default function NavBar({
  topRef,
  bottomRef,
}: {
  topRef: React.RefObject<HTMLElement | null>;
  bottomRef: React.RefObject<HTMLElement | null>;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav
        ref={topRef}
        className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-border bg-[var(--color-background)] backdrop-blur-sm"
      >
        <div className="mx-auto max-w-4xl">
          <ul className="flex items-center justify-between gap-1 p-3">
            {/* Home button - left aligned */}
            <li>
              <Button
                asChild
                variant={pathname === "/" ? "default" : "outline"}
              >
                <Link href="/" className="flex items-center px-3 py-2">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
            </li>

            {/* Main navigation items - centered */}
            <li className="flex gap-1">
              <ul className="flex items-center gap-1">
                {items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Button asChild variant={active ? "default" : "outline"}>
                        <Link
                          href={href}
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Empty space for balance */}
            <li className="w-12"></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav
        aria-label="Primary"
        ref={bottomRef}
        className="md:hidden fixed bottom-10 left-0 right-0 z-50 bg-[var(--color-background)] backdrop-blur-sm rounded-full shadow-2xl pb-3 pt-3 mx-6"
      >
        <div className="mx-auto max-w-4xl px-4">
          <ul className="flex items-center justify-around">
            {items.map(({ href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Button
                    asChild
                    variant={active ? "default" : "outline"}
                    className="h-16 w-16 rounded-full flex items-center justify-center"
                  >
                    <Link href={href}>
                      <Icon className="!h-10 !w-9" />
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
