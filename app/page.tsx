import dynamic from "next/dynamic";
const PhotoConversation = dynamic(() => import("@/components/PhotoConversation"), { ssr: false });

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Photobot</h1>
      <PhotoConversation />
    </main>
  );
}
