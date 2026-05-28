import { supabase } from "@/lib/supabase/client";

export default async function Home() {
  const { data, error } = await supabase.from("reviews").select("*").limit(5);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Supabase Test</h1>
      <pre className="mt-4 rounded bg-gray-100 p-4 text-xs">
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  );
}