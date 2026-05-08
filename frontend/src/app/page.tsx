"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center grid-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-chart-2/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-destructive/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6 z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-bull">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M8 32 L16 20 L24 26 L32 12 L38 18" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 32 L16 20 L24 26 L32 12 L38 18" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" transform="translate(0,2)"/>
              <circle cx="38" cy="18" r="3" fill="#00C853"/>
            </svg>
          </div>
        </motion.div>

        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-primary/80 bg-clip-text text-transparent"
          >
            QTrading
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mt-2 text-lg"
          >
            Quantitative Options Intelligence Platform
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span>Loading market data...</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
