import AuthButtons from "@/components/AuthButtons";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to Vibe Lab</h1>
      <p className="mb-8">Your AI-powered software architect. Press Cmd+K to open the Vibe Chat.</p>
      <AuthButtons />
    </div>
  );
}
