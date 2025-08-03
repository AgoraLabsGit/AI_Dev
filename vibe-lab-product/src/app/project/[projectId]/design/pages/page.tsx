export default async function PagesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A1C] rounded-lg border border-[#2A2A2E] p-6">
        <h1 className="text-2xl font-bold text-white">Page Layouts</h1>
        <p className="text-gray-400 mt-2">Stage 3: Page Structure and User Flows</p>
      </div>
    </div>
  );
}