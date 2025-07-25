export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold">AI-First Development System</h1>
        <p className="mt-4 text-xl text-gray-400">
          Your new project template is ready.
        </p>
        <div className="mt-8 flex justify-center gap-4">
           <code className="rounded bg-gray-800 p-2 text-gray-300">npm install</code>
           <code className="rounded bg-gray-800 p-2 text-gray-300">task-master parse-prd</code>
           <code className="rounded bg-gray-800 p-2 text-gray-300">task-master next</code>
        </div>
      </div>
    </main>
  )
} 