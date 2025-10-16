"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";

export const Logo: React.FC = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Dynamic text based on language
  const mainText = language === "en" ? "HOUR NEWS" : "घण्टा समाचार";
  const numberText = language === "en" ? "24" : "२४";
  const poweredText = language === "en" ? "Powered by" : "द्वारा संचालित";
  const companyText = "Astavision Infosys";

  // Dynamic color based on theme
  const textColor = theme === "dark" ? "#f9fafb" : "#1f2937";
  const subTextColor = theme === "dark" ? "#9ca3af" : "#6b7280";
  const lineColor = theme === "dark" ? "#374151" : "#e5e7eb";

  return (
    <Link
      href="/"
      className="cursor-pointer transition-opacity hover:opacity-80"
    >
      <svg
        width="320"
        height="64"
        viewBox="0 0 320 64"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-auto sm:h-14 md:h-16"
      >
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
              .logo-number { font-family: 'Poppins', sans-serif; }
              .logo-text { font-family: 'Poppins', sans-serif; }
              .logo-subtext { font-family: 'Poppins', sans-serif; }
            `}
          </style>
        </defs>

        {/* Icon box - even larger */}
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          rx="13"
          fill="url(#iconGradient)"
          filter="url(#glow)"
        />

        {/* "24" or "२४" Text - much larger */}
        <text
          x="32"
          y="40"
          className="logo-number"
          fontSize="28"
          fontWeight="800"
          fill="#ffffff"
          textAnchor="middle"
          key={`number-${language}`}
        >
          {language === "en" ? "24" : "२४"}
        </text>

        {/* Main brand text - much larger */}
        <text
          x="70"
          y="30"
          className="logo-text"
          fontSize="24"
          fontWeight="700"
          fill={textColor}
          letterSpacing="-0.5"
          key={`main-${language}`}
        >
          {language === "en" ? "HOUR NEWS" : "घण्टा समाचार"}
        </text>

        {/* LIVE indicator */}
        <circle cx="240" cy="26" r="4" fill="#ef4444">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="249"
          y="30"
          className="logo-text"
          fontSize="11"
          fontWeight="600"
          fill="#ef4444"
          letterSpacing="0.5"
        >
          LIVE
        </text>

        {/* Divider line */}
        <line
          x1="70"
          y1="40"
          x2="280"
          y2="40"
          stroke={lineColor}
          strokeWidth="1"
        />

        {/* Powered by text - larger */}
        <text
          x="70"
          y="54"
          className="logo-subtext"
          fontSize="11"
          fontWeight="400"
          fill={subTextColor}
          letterSpacing="0.3"
          key={`powered-${language}`}
        >
          {language === "en" ? (
            <>
              Powered by{" "}
              <tspan fontWeight="600" fill="#3b82f6">
                Astavision Infosys
              </tspan>
            </>
          ) : (
            <>
              <tspan fontWeight="600" fill="#3b82f6">
                Astavision Infosys
              </tspan>{" "}
              द्वारा संचालित
            </>
          )}
        </text>
      </svg>
    </Link>
  );
};
