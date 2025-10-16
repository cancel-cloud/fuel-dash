import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Fuel Dashboard</h1>
      <p className="mb-6">Go to your dashboard</p>
      <Link className="text-blue-600 underline" href="/dashboard">Open dashboard →</Link>
    </main>
  );
}
