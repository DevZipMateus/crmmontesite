
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps as NextThemeProviderProps } from "next-themes";

// Define the Attribute type to match what next-themes expects
type Attribute = "class" | "data-theme" | "data-mode";

// Define the ThemeProviderProps locally
interface ThemeProviderProps extends React.PropsWithChildren {
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  forcedTheme?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider forcedTheme="light" {...props}>{children}</NextThemesProvider>;
}
