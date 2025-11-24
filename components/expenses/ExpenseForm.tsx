"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
    { name: "Food", icon: "🍔", color: "#d4af37" },
    { name: "Transport", icon: "🚗", color: "#dc2626" },
    { name: "Shopping", icon: "🛍️", color: "#ededed" },
    { name: "Entertainment", icon: "🎮", color: "#d4af37" },
    { name: "Health", icon: "💊", color: "#dc2626" },
    { name: "Other", icon: "📦", color: "#404040" },
];

interface ExpenseFormProps {
    onAddExpense: (expense: { amount: number; category: string; description: string }) => void;
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(categories[0].name);
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        onAddExpense({
            amount: parseFloat(amount),
            category,
            description,
        });

        setAmount("");
        setDescription("");
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="glass p-6 rounded-2xl space-y-4 font-mono"
        >
            <h2 className="text-2xl font-bold text-white mb-4">Add Expense</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm text-[#ededed]/70 mb-2">Amount (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={cn(
                            "w-full px-4 py-3 rounded-lg",
                            "bg-[#171717] border border-[#262626]",
                            "text-white font-mono text-lg",
                            "focus:outline-none focus:border-[#d4af37]",
                            "transition-colors duration-200"
                        )}
                        required
                    />
                </div>

                {/* Category Selector */}
                <div>
                    <label className="block text-sm text-[#ededed]/70 mb-2">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                        {categories.map((cat) => (
                            <motion.button
                                key={cat.name}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCategory(cat.name)}
                                className={cn(
                                    "p-3 rounded-lg border transition-all duration-200",
                                    "flex flex-col items-center gap-1",
                                    category === cat.name
                                        ? "bg-[#d4af37]/20 border-[#d4af37]"
                                        : "bg-[#171717] border-[#262626] hover:border-[#404040]"
                                )}
                            >
                                <span className="text-2xl">{cat.icon}</span>
                                <span className="text-xs text-[#ededed]/70">{cat.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Description Input */}
            <div>
                <label className="block text-sm text-[#ededed]/70 mb-2">Description (optional)</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What did you buy?"
                    className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "bg-[#171717] border border-[#262626]",
                        "text-white font-mono",
                        "focus:outline-none focus:border-[#d4af37]",
                        "transition-colors duration-200"
                    )}
                />
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "w-full px-6 py-3 rounded-lg font-semibold",
                    "bg-gradient-to-r from-[#d4af37] to-[#dc2626]",
                    "text-[#0a0a0a] font-mono",
                    "transition-all duration-300",
                    "hover:shadow-lg hover:shadow-[#d4af37]/20"
                )}
            >
                Add Expense
            </motion.button>
        </motion.form>
    );
}
