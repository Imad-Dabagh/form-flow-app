"use client";

import type { CSSProperties } from "react";
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="app-toaster"
      closeButton
      visibleToasts={3}
      icons={{
        success: <CircleCheck aria-hidden="true" />,
        error: <CircleX aria-hidden="true" />,
        info: <Info aria-hidden="true" />,
        warning: <TriangleAlert aria-hidden="true" />,
        loading: <LoaderCircle className="animate-spin" aria-hidden="true" />,
      }}
      style={
        {
          "--width": "360px",
          "--normal-bg": "#ffffff",
          "--normal-text": "#1f2937",
          "--normal-border": "#e5e7eb",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
