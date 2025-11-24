"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: Date;
}

interface ExpenseCardProps {
    expense: Expense;
    onDelete: (id: string) => void;
    index: number;
}

const categoryIcons: Record<string, string> = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Entertainment: "🎮",
    Health: "💊",
    Other: "📦",
};

const categoryColors: Record<string, string> = {
    Food: "#d4af37",
    Transport: "#dc2626",
    Shopping: "#ededed",
    Entertainment: "#d4af37",
    Health: "#dc2626",
    Other: "#404040",
};

export function ExpenseCard({ expense, onDelete, index }: ExpenseCardProps) {
    const icon = categoryIcons[expense.category] || "📦";
    const color = categoryColors[expense.category] || "#404040";

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="glass-hover p-4 rounded-xl group font-mono"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    {/* Category Icon */}
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
                    >
                        {icon}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#ededed]/70">{expense.category}</span>
                            {expense.description && (
                                <>
                                    <span className="text-[#404040]">•</span>
                                    <span className="text-sm text-[#ededed]/50">{expense.description}</span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-[#404040] mt-1">
                            {new Date(expense.date).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>

                {/* Amount and Delete */}
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-white">
                        €{expense.amount.toFixed(2)}
                    </span>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(expense.id)}
                        className={cn(
                            "w-8 h-8 rounded-lg",
                            "bg-[#dc2626]/20 border border-[#dc2626]/40",
                            "flex items-center justify-center",
                            "opacity-0 group-hover:opacity-100",
                            "transition-opacity duration-200"
                        )}
                    >
                        <span className="text-[#dc2626]">×</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

interface ExpenseListProps {
    expenses: Expense[];
    onDeleteExpense: (id: string) => void;
}

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
    // Group expenses by date
    const groupedExpenses = expenses.reduce((groups, expense) => {
        const date = new Date(expense.date).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(expense);
        return groups;
    }, {} as Record<string, Expense[]>);

    const sortedDates = Object.keys(groupedExpenses).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    if (expenses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-12 rounded-2xl text-center font-mono"
            >
                <div className="text-6xl mb-4">💸</div>
                <h3 className="text-xl text-white mb-2">No expenses yet</h3>
                <p className="text-[#404040]">Add your first expense to start tracking</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {sortedDates.map((date) => {
                const dayExpenses = groupedExpenses[date];
                const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

                return (
                    <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {/* Date Header */}
                        <div className="flex items-center justify-between px-2 font-mono">
                            <h3 className="text-lg font-bold text-white">
                                {new Date(date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </h3>
                            <span className="text-[#d4af37] font-bold">
                                €{dayTotal.toFixed(2)}
                            </span>
                        </div>

                        {/* Expense Cards */}
                        <AnimatePresence>
                            <div className="space-y-2">
                                {dayExpenses.map((expense, index) => (
                                    <ExpenseCard
                                        key={expense.id}
                                        expense={expense}
                                        onDelete={onDeleteExpense}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
