"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import NavBar from "./NavBar";

export default function ContentWrapper({ children }: { children: ReactNode }) {
  const topNavRef = useRef<HTMLElement | null>(null);
  const bottomNavRef = useRef<HTMLElement | null>(null);
  const [topHeight, setTopHeight] = useState(0);
  const [bottomHeight, setBottomHeight] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      setTopHeight(topNavRef.current?.offsetHeight ?? 0);
      setBottomHeight(bottomNavRef.current?.offsetHeight ?? 0);
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (topNavRef.current) observer.observe(topNavRef.current);
    if (bottomNavRef.current) observer.observe(bottomNavRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <NavBar topRef={topNavRef} bottomRef={bottomNavRef} />
      <div style={{ paddingTop: topHeight, paddingBottom: bottomHeight }}>
        {children}
      </div>
    </>
  );
}
