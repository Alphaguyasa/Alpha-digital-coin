"use client";

import { cn } from "@/lib/utils";
import { Layers, Search, Zap } from "lucide-react";
import type React from "react";

// The main props for the HowItWorks component
interface HowItWorksProps extends React.HTMLAttributes<HTMLElement> {}

// The props for a single step card
interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

/**
 * A single step card within the "How It Works" section.
 * It displays an icon, title, description, and a list of benefits.
 */
const StepCard: React.FC<StepCardProps> = ({
  icon,
  title,
  description,
  benefits,
}) => (
  <div
    className={cn(
      "relative rounded-2xl p-6 transition-all duration-300 ease-in-out hover:scale-105"
    )}
    style={{
      background: "rgba(255, 153, 0, 0.05)",
      border: "1px solid rgba(255, 153, 0, 0.2)",
      fontFamily: "Inter, sans-serif",
    }}
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: "rgba(255,153,0,0.15)", color: "#FF9900" }}>
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold" style={{ color: "#FFFFFF" }}>{title}</h3>
    <p className="mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>{description}</p>
    <ul className="space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(255,153,0,0.2)" }}>
            <div className="h-2 w-2 rounded-full" style={{ background: "#FF9900" }}></div>
          </div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * A responsive "How It Works" section that displays a 3-step process.
 * It is styled with shadcn/ui theme variables to support light and dark modes.
 */
export const HowItWorks: React.FC<HowItWorksProps> = ({
  className,
  ...props
}) => {
  const stepsData = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Connect Your Wallet",
      description:
        "Link your Internet Identity or ICP wallet in seconds to access the Alpha Coin ecosystem.",
      benefits: [
        "Supports Internet Identity & Plug Wallet",
        "No sign-up or email required",
        "Fully non-custodial and secure",
      ],
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Acquire Alpha Coin",
      description:
        "Buy, receive, or earn ALPHA tokens directly on the Internet Computer Protocol.",
      benefits: [
        "Instant on-chain transfers",
        "Zero gas fees on ICP",
        "ICRC-1 standard token",
      ],
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Send & Manage",
      description:
        "Send ALPHA to anyone, check your balance, and track your transaction history in real time.",
      benefits: [
        "Sub-second transaction finality",
        "Full transaction history on-chain",
        "Manage directly from your dashboard",
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn("w-full py-16 sm:py-24", className)}
      style={{ background: "linear-gradient(180deg, #0A0500 0%, #1A0F00 100%)", fontFamily: "Inter, sans-serif" }}
      {...props}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <p style={{ fontSize: "12px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: "16px" }}>
            Alpha Coin
          </p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            How It{" "}
            <span style={{ background: "linear-gradient(90deg, #FF9900 0%, #FFB84D 50%, #FF9900 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Works
            </span>
          </h2>
          <p className="mt-4 text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
            Get started with Alpha Coin in three simple steps — no banks, no middlemen, just Web3.
          </p>
        </div>

        {/* Step Indicators with Connecting Line */}
        <div className="relative mx-auto mb-8 w-full max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-0.5 w-[66.6667%] -translate-y-1/2"
            style={{ background: "rgba(255,153,0,0.3)" }}
          ></div>
          <div className="relative grid grid-cols-3">
            {stepsData.map((_, index) => (
              <div
                key={index}
                className="flex h-8 w-8 items-center justify-center justify-self-center rounded-full font-semibold"
                style={{ background: "#FF9900", color: "#0A0500", boxShadow: "0 0 20px rgba(255,153,0,0.5)" }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
