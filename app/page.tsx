import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8 font-mono text-white">Ronin_Mind_OS</h1>
      <p className="text-[#404040] font-mono mb-8">"A Ronin lives by discipline."</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard" className="p-4 glass-hover rounded font-mono text-white">Dashboard</Link>
        <Link href="/journal" className="p-4 glass-hover rounded font-mono text-white">Journal</Link>
        <Link href="/expenses" className="p-4 glass-hover rounded font-mono text-white">Expenses</Link>
        <Link href="/workouts" className="p-4 glass-hover rounded font-mono text-white">Workouts</Link>
        <Link href="/reading" className="p-4 glass-hover rounded font-mono text-white">Reading</Link>
        <Link href="/goals" className="p-4 glass-hover rounded font-mono text-white">Goals</Link>
        <Link href="/coach" className="p-4 glass-hover rounded font-mono text-white">Coach</Link>
      </div>
    </main>
  );
}
