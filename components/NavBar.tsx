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

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-gray-6 bg-[var(--color-background)] backdrop-blur-sm">
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
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[var(--color-background)] border-t border-gray-6 backdrop-blur-sm"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
      >
        <div className="mx-auto max-w-sm">
          <ul className="flex items-center justify-center gap-4 py-2">
            {items.map(({ href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href} className="w-auto">
                  <Button
                    asChild
                    variant={active ? "solid" : "soft"}
                    highContrast={active}
                    size="4"
                  >
                    <Link
                      href={href}
                      className="flex flex-col items-center gap-1 py-2 px-3"
                    >
                      <Icon className="w-6 h-6" />
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
