"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HeroSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.6, -0.05, 0.01, 0.99],
            },
        },
    };

    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/20 via-[#0a0a0a] to-[#0a0a0a]" />

            {/* Floating orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
                className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-3xl"
            />

            <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
                <motion.div variants={itemVariants} className="space-y-4">
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter font-mono">
                        <span className="text-white">
                            RONIN
                        </span>
                    </h1>
                    <p className="text-2xl md:text-3xl text-[#404040] font-light tracking-wide font-mono">
                        MIND_OS
                    </p>
                </motion.div>

                <motion.p
                    variants={itemVariants}
                    className="text-xl md:text-2xl text-[#ededed]/80 max-w-2xl mx-auto font-light italic font-mono"
                >
                    "A Ronin lives by discipline."
                </motion.p>

                <motion.div variants={itemVariants} className="pt-8">
                    <p className="text-[#404040] mb-8 text-lg font-mono">
                        Your personal AI-powered Operating System for discipline, self-mastery, and mental clarity.
                    </p>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "px-8 py-4 rounded-lg font-semibold text-lg font-mono",
                            "bg-gradient-to-r from-[#d4af37] to-[#dc2626]",
                            "text-[#0a0a0a]",
                            "transition-all duration-300"
                        )}
                    >
                        Initialize System
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "px-8 py-4 rounded-lg font-semibold text-lg font-mono",
                            "glass-hover",
                            "text-[#ededed]"
                        )}
                    >
                        Learn More
                    </motion.button>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                variants={itemVariants}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 border-2 border-[#d4af37]/50 rounded-full p-1"
                >
                    <motion.div className="w-1 h-2 bg-[#d4af37] rounded-full mx-auto" />
                </motion.div>
            </motion.div>
        </motion.section>
    );
}
