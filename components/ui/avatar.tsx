"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function Avatar({ className, fallback, alt, ...props }: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  return (
    <div
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      {!errored && props.src ? (
        <img
          alt={alt}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : (
        <span className="text-sm font-medium text-muted-foreground">
          {fallback?.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
