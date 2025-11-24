"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { NavigationDock } from "@/components/NavigationDock";

interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: Date;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load expenses from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("ronin_expenses");
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert date strings back to Date objects
            const withDates = parsed.map((exp: any) => ({
                ...exp,
                date: new Date(exp.date),
            }));
            setExpenses(withDates);
        }
        setMounted(true);
    }, []);

    // Save expenses to localStorage whenever they change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("ronin_expenses", JSON.stringify(expenses));
        }
    }, [expenses, mounted]);

    const handleAddExpense = (expenseData: {
        amount: number;
        category: string;
        description: string;
    }) => {
        const newExpense: Expense = {
            id: Date.now().toString(),
            ...expenseData,
            date: new Date(),
        };
        setExpenses([newExpense, ...expenses]);
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(expenses.filter((exp) => exp.id !== id));
    };

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-8"
            >
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-mono mb-2">
                        Expense Tracker
                    </h1>
                    <p className="text-[#404040] font-mono">
                        Track your daily expenses and maintain financial discipline
                    </p>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="px-6 max-w-6xl mx-auto space-y-8">
                {/* Summary Statistics */}
                <ExpenseSummary expenses={expenses} />

                {/* Add Expense Form */}
                <ExpenseForm onAddExpense={handleAddExpense} />

                {/* Expense List */}
                <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
            </main>

            {/* Navigation Dock */}
            <NavigationDock />
        </div>
    );
}
