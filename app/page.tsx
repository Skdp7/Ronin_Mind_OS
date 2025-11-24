import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Ronin_Mind_OS — Core initialized.</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard" className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
        <Link href="/journal" className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Journal</Link>
        <Link href="/expenses" className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Expenses</Link>
        <Link href="/workouts" className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Workouts</Link>
        <Link href="/reading" className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Reading</Link>
        <Link href="/goals" className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Goals</Link>
        <Link href="/coach" className="p-4 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">Coach</Link>
      </div>
    </main>
  );
}
