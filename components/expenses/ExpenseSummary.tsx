"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: Date;
}

interface ExpenseSummaryProps {
    expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayExpenses = expenses.filter((e) => new Date(e.date) >= today);
    const weekExpenses = expenses.filter((e) => new Date(e.date) >= weekAgo);
    const monthExpenses = expenses.filter((e) => new Date(e.date) >= monthStart);

    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    const stats = [
        { label: "Today", amount: todayTotal, color: "#d4af37" },
        { label: "This Week", amount: weekTotal, color: "#ededed" },
        { label: "This Month", amount: monthTotal, color: "#dc2626" },
    ];

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass p-6 rounded-xl font-mono"
                    >
                        <p className="text-sm text-[#ededed]/70 mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">
                            €{stat.amount.toFixed(2)}
                        </p>
                        <div
                            className="h-1 w-full rounded-full mt-3"
                            style={{ backgroundColor: `${stat.color}40` }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: stat.color }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Top Categories */}
            {sortedCategories.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-6 rounded-xl font-mono"
                >
                    <h3 className="text-lg font-bold text-white mb-4">Top Categories</h3>
                    <div className="space-y-3">
                        {sortedCategories.map(([category, amount], index) => {
                            const percentage = (amount / monthTotal) * 100;
                            return (
                                <div key={category}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-[#ededed]/70">{category}</span>
                                        <span className="text-sm font-bold text-white">
                                            €{amount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-[#171717] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                            className="h-full bg-gradient-to-r from-[#d4af37] to-[#dc2626]"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
