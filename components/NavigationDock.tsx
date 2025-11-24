"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const modules = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Journal", href: "/journal", icon: "📝" },
    { name: "Expenses", href: "/expenses", icon: "💰" },
    { name: "Workouts", href: "/workouts", icon: "💪" },
    { name: "Reading", href: "/reading", icon: "📚" },
    { name: "Goals", href: "/goals", icon: "🎯" },
    { name: "Coach", href: "/coach", icon: "🤖" },
];

export function NavigationDock() {
    return (
        <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
            <div className="glass px-4 py-3 rounded-2xl flex gap-2">
                {modules.map((module, index) => (
                    <motion.div
                        key={module.href}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 1.2 + index * 0.1,
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                    >
                        <Link
                            href={module.href}
                            className={cn(
                                "group relative flex flex-col items-center justify-center",
                                "w-16 h-16 rounded-xl",
                                "glass-hover",
                                "transition-all duration-300"
                            )}
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                                {module.icon}
                            </span>

                            {/* Tooltip */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "absolute -top-12 px-3 py-1.5 rounded-lg",
                                    "glass text-sm font-medium whitespace-nowrap",
                                    "pointer-events-none"
                                )}
                            >
                                {module.name}
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.nav>
    );
}
