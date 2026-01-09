"use client";

// Note: This component requires the sonner package to be installed
// import { Toaster as Sonner } from "sonner";
// import type { ToasterProps } from "sonner";

export function Toaster({ ...props }) {
  // Note: next-themes package is required for theme support
  // const { theme = "system" } = useTheme();

  // For now, return null until sonner package is installed
  return null;
  
  // Uncomment when sonner package is installed:
  // return (
  //   <Sonner
  //     theme={theme}
  //     className="toaster group"
  //     style={{
  //       "--normal-bg": "var(--popover)",
  //       "--normal-text": "var(--popover-foreground)",
  //       "--normal-border": "var(--border)",
  //     }}
  //     {...props}
  //   />
  // );
}
