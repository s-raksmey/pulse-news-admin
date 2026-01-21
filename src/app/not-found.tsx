import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-slate-600">Page not found.</p>
      <Link href="/"><Button>Go Home</Button></Link>
    </main>
  );
}
