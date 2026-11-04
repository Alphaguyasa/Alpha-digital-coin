"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import {
  Shield,
  Coins,
  Globe,
  Zap,
  Lock,
  BarChart3,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Star,
  ArrowRight,
  Wallet,
} from "lucide-react"
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion"

export default function AboutUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 })
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 })

  // Parallax effect for decorative elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50])
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20])
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  }

  const services = [
    {
      icon: <Shield className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#FF9900]" />,
      title: "Secure",
      description:
        "Built on the Internet Computer Protocol, Alpha Coin leverages canister smart contracts to ensure every transaction is tamper-proof, transparent, and fully on-chain.",
      position: "left",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#FF9900]" />,
      title: "Fast",
      description:
        "Experience sub-second transaction finality with near-zero fees. Alpha Coin runs natively on ICP, eliminating the bottlenecks of traditional blockchain networks.",
      position: "left",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#FF9900]" />,
      title: "Borderless",
      description:
        "Send ALPHA to anyone, anywhere in the world instantly. No banks, no intermediaries — just peer-to-peer value transfer powered by decentralized infrastructure.",
      position: "left",
    },
    {
      icon: <Coins className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#FF9900]" />,
      title: "ICRC-1 Standard",
      description:
        "Alpha Coin follows the ICRC-1 token standard on ICP — the equivalent of ERC-20 on Ethereum — ensuring full compatibility with wallets, DEXs, and DeFi protocols.",
      position: "right",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#FF9900]" />,
      title: "Non-Custodial",
      description:
        "Your keys, your coins. Alpha Coin integrates with Internet Identity and Plug Wallet so you always remain in full control of your assets — no sign-up required.",
      position: "right",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#FF9900]" />,
      title: "Community Owned",
      description:
        "40% of the total supply is allocated to the community. Alpha Coin is governed by its holders, ensuring the protocol evolves in the best interest of its users.",
      position: "right",
    },
  ]

  const stats = [
    { icon: <Wallet />, value: 1000000000, label: "Total Supply", suffix: " ALPHA" },
    { icon: <Users />, value: 400, label: "Community Allocation", suffix: "M" },
    { icon: <Award />, value: 0, label: "Transaction Fees", suffix: "" },
    { icon: <TrendingUp />, value: 100, label: "On-Chain", suffix: "%" },
  ]

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="w-full py-24 px-4 overflow-hidden relative"
      style={{ background: "linear-gradient(180deg, #0A0500 0%, #1A0F00 50%, #2A1500 100%)", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
    >
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
        style={{ y: y1, rotate: rotate1, background: "rgba(255,153,0,0.06)" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl"
        style={{ y: y2, rotate: rotate2, background: "rgba(255,153,0,0.04)" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full"
        style={{ background: "rgba(255,153,0,0.3)" }}
        animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full"
        style={{ background: "rgba(255,153,0,0.2)" }}
        animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <motion.span
            className="font-medium mb-2 flex items-center gap-2"
            style={{ color: "#FF9900", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-4 h-4" />
            Alpha Coin
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-center" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            About{" "}
            <span style={{ background: "linear-gradient(90deg, #FF9900 0%, #FFB84D 50%, #FF9900 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 600 }}>
              Us
            </span>
          </h2>
          <motion.div
            className="w-24 h-1"
            style={{ background: "#FF9900" }}
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
        </motion.div>

        <motion.p className="text-center max-w-2xl mx-auto mb-16" style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.7 }} variants={itemVariants}>
          Alpha Coin is a decentralized token built on the Internet Computer Protocol using Motoko smart contracts.
          We are building a fast, borderless, and community-owned financial system for the next generation of Web3.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Left Column */}
          <div className="space-y-16">
            {services
              .filter((service) => service.position === "left")
              .map((service, index) => (
                <ServiceItem
                  key={`left-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="left"
                />
              ))}
          </div>

          {/* Center Image */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0">
            <motion.div className="relative w-full max-w-xs" variants={itemVariants}>
              <motion.div
                className="rounded-md overflow-hidden shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <img
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop"
                  alt="Alpha Coin on ICP"
                  className="w-full h-full object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-[#202e44]/50 to-transparent flex items-end justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <motion.button
                    className="px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
                    style={{ background: "#FF9900", color: "#0A0500" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get ALPHA <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute inset-0 border-4 rounded-md -m-3 z-[-1]"
              style={{ borderColor: "rgba(255,153,0,0.4)" }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.div>

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-8 w-16 h-16 rounded-full bg-[#88734C]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{ y: y1 }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-6 -left-10 w-20 h-20 rounded-full bg-[#A9BBC8]/15"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
                style={{ y: y2 }}
              ></motion.div>

              {/* Additional decorative elements */}
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#88734C]"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#A9BBC8]"
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              ></motion.div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-16">
            {services
              .filter((service) => service.position === "right")
              .map((service, index) => (
                <ServiceItem
                  key={`right-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="right"
                />
              ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <StatCounter
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </motion.div>


        {/* CTA Section */}
        <motion.div
          className="mt-20 p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "rgba(255,153,0,0.08)", border: "1px solid rgba(255,153,0,0.25)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-medium mb-2" style={{ color: "#FFFFFF" }}>Ready to join the Alpha economy?</h3>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>Connect your wallet and start transacting with ALPHA today.</p>
          </div>
          <motion.button
            className="px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
            style={{ background: "#FF9900", color: "#0A0500" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}

interface ServiceItemProps {
  icon: React.ReactNode
  secondaryIcon?: React.ReactNode
  title: string
  description: string
  variants: {
    hidden: { opacity: number; y?: number }
    visible: { opacity: number; y?: number; transition: { duration: number; ease: "easeOut" | "easeIn" | "easeInOut" | "linear" } }
  }
  delay: number
  direction: "left" | "right"
}

function ServiceItem({ icon, secondaryIcon, title, description, variants, delay, direction }: ServiceItemProps) {
  return (
    <motion.div
      className="flex flex-col group"
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="flex items-center gap-3 mb-3"
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          className="p-3 rounded-lg relative"
          style={{ background: "rgba(255,153,0,0.1)", color: "#FF9900" }}
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-xl font-medium" style={{ color: "#FFFFFF" }}>
          {title}
        </h3>
      </motion.div>
      <motion.p
        className="text-sm leading-relaxed pl-12"
        style={{ color: "rgba(255,255,255,0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>
    </motion.div>
  )
}

interface StatCounterProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix: string
  delay: number
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null)
  const isInView = useInView(countRef, { once: false })

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 10,
  })

  useEffect(() => {
    springValue.set(isInView ? value : 0)
  }, [isInView, value, springValue])

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest))

  return (
    <motion.div
      className="backdrop-blur-sm p-6 rounded-xl flex flex-col items-center text-center group transition-colors duration-300"
      style={{ background: "rgba(255,153,0,0.05)", border: "1px solid rgba(255,153,0,0.15)" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: "rgba(255,153,0,0.1)", color: "#FF9900" }}
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div ref={countRef} className="text-3xl font-bold flex items-center" style={{ color: "#FF9900" }}>
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
      <motion.div className="w-10 h-0.5 mt-3 group-hover:w-16 transition-all duration-300" style={{ background: "#FF9900" }} />
    </motion.div>
  )
}

