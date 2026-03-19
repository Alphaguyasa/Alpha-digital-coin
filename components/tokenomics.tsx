"use client";

import { motion } from "framer-motion";
import { CardStack } from "@/components/card-stack";
import type { CardStackItem } from "@/components/card-stack";
import { Vo2MaxCard } from "@/components/progress";
import { Users, Code, Briefcase, Megaphone, Shield } from "lucide-react";

interface StatCard extends CardStackItem {
  value: string;
  suffix: string;
}

const stats: StatCard[] = [
  { id: 1, title: "Total Supply", value: "1,000,000,000", suffix: "ALPHA" },
  { id: 2, title: "Circulating Supply", value: "400,000,000", suffix: "ALPHA" },
  { id: 3, title: "Token Standard", value: "ICRC-1", suffix: "ICP Native" },
  { id: 4, title: "Network", value: "ICP", suffix: "Internet Computer" },
];

const distribution = [
  {
    label: "Community & Public",
    percent: 40,
    color: "#FF9900",
    icon: <Users size={14} />,
    status: "Largest",
    description: <>400M ALPHA allocated to <span style={{ fontWeight: 600, color: "#FF9900" }}>community</span> holders & public sale</>,
  },
  {
    label: "Development Fund",
    percent: 25,
    color: "#FFB84D",
    icon: <Code size={14} />,
    status: "Active",
    description: <>250M ALPHA reserved for <span style={{ fontWeight: 600, color: "#FFB84D" }}>protocol</span> development & upgrades</>,
  },
  {
    label: "Team & Founders",
    percent: 20,
    color: "#CC7A00",
    icon: <Briefcase size={14} />,
    status: "Vested",
    description: <>200M ALPHA with <span style={{ fontWeight: 600, color: "#CC7A00" }}>4-year</span> vesting & 1-year cliff</>,
  },
  {
    label: "Marketing",
    percent: 10,
    color: "#FFD080",
    icon: <Megaphone size={14} />,
    status: "Growth",
    description: <>100M ALPHA for <span style={{ fontWeight: 600, color: "#FFD080" }}>campaigns</span>, partnerships & awareness</>,
  },
  {
    label: "Reserve",
    percent: 5,
    color: "#7A4A00",
    icon: <Shield size={14} />,
    status: "Locked",
    description: <>50M ALPHA in <span style={{ fontWeight: 600, color: "#7A4A00" }}>cold storage</span> for emergencies</>,
  },
];

export function Tokenomics() {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, #2A1500 0%, #1A0F00 50%, #0A0500 100%)",
        padding: "100px 32px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "72px" }}
      >
        <p style={{ fontSize: "12px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: "16px" }}>
          Alpha Coin
        </p>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 500,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Token{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #FF9900 0%, #FFB84D 50%, #FF9900 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 600,
            }}
          >
            Economics
          </span>
        </h2>
        <p style={{ marginTop: "16px", color: "rgba(255,255,255,0.6)", fontSize: "15px", maxWidth: "480px", margin: "16px auto 0" }}>
          A transparent and fair distribution designed for long-term growth and community ownership.
        </p>
      </motion.div>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Stats CardStack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: "64px" }}
        >
          <CardStack
            items={stats}
            cardWidth={380}
            cardHeight={200}
            maxVisible={3}
            overlap={0.1}
            spreadDeg={18}
            depthPx={60}
            tiltXDeg={6}
            activeLiftPx={30}
            activeScale={1.05}
            inactiveScale={0.88}
            autoAdvance
            intervalMs={2500}
            showDots
            className="[&_button]:bg-orange-500/30"
            renderCard={(item, { active }) => {
              const stat = item as StatCard;
              return (
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    background: active
                      ? "linear-gradient(135deg, rgba(255,153,0,0.18) 0%, rgba(255,153,0,0.06) 100%)"
                      : "rgba(255,153,0,0.04)",
                    border: `1px solid ${ active ? "rgba(255,153,0,0.5)" : "rgba(255,153,0,0.15)"}`,
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: active ? "0 0 40px rgba(255,153,0,0.2)" : "none",
                  }}
                >
                  <p style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                    {stat.title}
                  </p>
                  <p style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#FF9900", lineHeight: 1 }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                    {stat.suffix}
                  </p>
                </div>
              );
            }}
          />
        </motion.div>

        {/* Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#FFFFFF", marginBottom: "32px", textAlign: "center" }}>
            Distribution
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "16px",
            }}
          >
            {distribution.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Vo2MaxCard
                  title={item.label}
                  value={item.percent}
                  status={item.status}
                  progress={item.percent}
                  icon={item.icon}
                  description={item.description}
                  strokeColor={item.color}
                  className="border-0 w-full max-w-full"
                  style={{
                    background: "rgba(255,153,0,0.05)",
                    border: `1px solid ${item.color}44`,
                    color: "#FFFFFF",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
