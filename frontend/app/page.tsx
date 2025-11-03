/**
 * Main page - Welcome to KontaFlow
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to KontaFlow</h1>
      <p className="text-gray-600 mb-8">Professional accounting system with double-entry bookkeeping</p>
      <div className="flex gap-4">
        <a href="/economic-groups" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
          Economic Groups
        </a>
      </div>
    </div>
  );
}
