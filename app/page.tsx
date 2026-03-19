"use client";

import { useRouter } from "next/navigation";
import { Web3MediaHero } from "@/components/web3media-hero";
import { Tokenomics } from "@/components/tokenomics";
import { HowItWorks } from "@/components/how-it-works";
import AboutUsSection from "@/components/about-us-section";

export default function Page() {
  const router = useRouter();
  return (
    <>
    <Web3MediaHero
      logo="Alpha Coin"
      navigation={[
        { label: "Home", onClick: () => console.log("Home") },
        { label: "Tokenomics", onClick: () => console.log("Tokenomics") },
        { label: "How It Works", onClick: () => console.log("How It Works") },
        { label: "About", onClick: () => console.log("About") },
      ]}
      contactButton={{
        label: "Connect Wallet",
        onClick: () => router.push("/dashboard"),
      }}
      title="The Future of Finance,"
      highlightedText="Powered by Alpha"
      subtitle="Alpha Coin is a decentralized token built on the Internet Computer Protocol. Fast, borderless, and community-owned — redefining what money can do in the Web3 era."
      ctaButton={{
        label: "Get Alpha Coin",
        onClick: () => console.log("Get Alpha Coin clicked"),
      }}
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
        {
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FF9900" />
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                fill="white"
              />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          ),
          label: "DeFi",
          position: { x: "80%", y: "25%" },
        },
        {
          icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#FF9900" />
              <path
                d="M6 12H18M6 8H18M6 16H14"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ),
          label: "Web3",
          position: { x: "75%", y: "65%" },
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
        {
          name: "Web3",
          logo: (
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
              <text x="0" y="18" fill="rgba(255,255,255,0.5)" fontSize="16" fontWeight="600">
                Web3
              </text>
            </svg>
          ),
        },
        {
          name: "DeFi",
          logo: (
            <svg width="50" height="24" viewBox="0 0 50 24" fill="none">
              <text x="0" y="18" fill="rgba(255,255,255,0.5)" fontSize="16" fontWeight="600">
                DeFi
              </text>
            </svg>
          ),
        },
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
      ]}
    />
    <Tokenomics />
    <HowItWorks />
    <AboutUsSection />
    </>
  );
}
