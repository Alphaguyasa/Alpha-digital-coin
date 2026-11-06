"use client";

import { useRouter } from "next/navigation";
import { Web3MediaHero } from "@/components/web3media-hero";
import { Tokenomics } from "@/components/tokenomics";
import { HowItWorks } from "@/components/how-it-works";
import AboutUsSection from "@/components/about-us-section";
import { ExperimentalNotice } from "@/components/experimental-notice";

export default function Page() {
  const router = useRouter();
  return (
    <>
    <Web3MediaHero
      logo="Alpha Coin"
      navigation={[
        { label: "Home", href: "#top" },
        { label: "Tokenomics", href: "#tokenomics" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "About", href: "#about-section" },
      ]}
      contactButton={{
        label: "Open Dashboard",
        onClick: () => router.push("/dashboard"),
      }}
      title="An experimental token"
      highlightedText="on the Internet Computer"
      subtitle="Alpha Coin is a development project: a token canister written in Motoko, with a small dashboard. It runs on a local development network, has no price and is not an investment."
      cryptoIcons={[
        {
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FF9900" />
              <text
                x="12"
                y="16"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                α
              </text>
            </svg>
          ),
          label: "ALPHA",
          position: { x: "10%", y: "20%" },
        },
        {
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FF9900" />
              <path
                d="M12 6V18M8 9H13.5C14.163 9 14.7989 9.26339 15.2678 9.73223C15.7366 10.2011 16 10.837 16 11.5C16 12.163 15.7366 12.7989 15.2678 13.2678C14.7989 13.7366 14.163 14 13.5 14H8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          label: "ICP",
          position: { x: "15%", y: "60%" },
        },
      ]}
      trustedByText="Built on"
      brands={[
        {
          name: "Internet Computer",
          logo: (
            <svg width="130" height="24" viewBox="0 0 130 24" fill="none">
              <text x="0" y="18" fill="rgba(255,255,255,0.5)" fontSize="13" fontWeight="600">
                Internet Computer
              </text>
            </svg>
          ),
        },
        {
          name: "Motoko",
          logo: (
            <svg width="70" height="24" viewBox="0 0 70 24" fill="none">
              <text x="0" y="18" fill="rgba(255,255,255,0.5)" fontSize="16" fontWeight="600">
                Motoko
              </text>
            </svg>
          ),
        },
        {
          name: "DFINITY",
          logo: (
            <svg width="70" height="24" viewBox="0 0 70 24" fill="none">
              <text x="0" y="18" fill="rgba(255,255,255,0.5)" fontSize="16" fontWeight="600">
                DFINITY
              </text>
            </svg>
          ),
        },
      ]}
    />
    <Tokenomics />
    <HowItWorks />
    <AboutUsSection />
    <ExperimentalNotice />
    </>
  );
}
