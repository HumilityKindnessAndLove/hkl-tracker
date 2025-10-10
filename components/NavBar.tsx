"use client";

import {
  HomeIcon,
  PaperPlaneIcon,
  Pencil1Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/form", label: "HKL Form", icon: PaperPlaneIcon },
  { href: "/interaction", label: "Interaction", icon: Pencil1Icon },
  { href: "/profile", label: "Profile", icon: PersonIcon },
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
        className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-gray-6 bg-[var(--color-background)] backdrop-blur-sm"
      >
        <div className="mx-auto max-w-4xl">
          <ul className="flex items-center justify-between gap-1 p-3">
            {/* Home button - left aligned */}
            <li>
              <Button
                asChild
                variant={pathname === "/" ? "solid" : "soft"}
                highContrast={pathname === "/"}
                size="3"
              >
                <Link href="/" className="flex items-center px-3 py-2">
                  <HomeIcon />
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
                      <Button
                        asChild
                        variant={active ? "solid" : "soft"}
                        highContrast={active}
                        size="3"
                      >
                        <Link
                          href={href}
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <Icon />
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background)] backdrop-blur-sm pb-1 pt-1"
      >
        <div className="mx-auto max-w-4xl px-8">
          <ul className="flex items-center justify-center gap-4">
            {items.map(({ href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Button
                    asChild
                    variant={active ? "solid" : "soft"}
                    highContrast={active}
                    size="3"
                  >
                    <Link
                      href={href}
                      className="flex flex-col items-center gap-1 py-2 px-4"
                    >
                      <Icon />
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
