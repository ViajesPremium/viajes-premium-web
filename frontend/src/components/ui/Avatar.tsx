"use client";

import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type AvatarProps = HTMLAttributes<HTMLDivElement>;

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10",
        className,
      )}
      {...props}
    />
  );
}

type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function AvatarImage({ className, alt = "", ...props }: AvatarImageProps) {
  return (
    <img
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

type AvatarFallbackProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-700",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
