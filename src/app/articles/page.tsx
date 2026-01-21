import Link from "next/link";
import { getGqlClient } from "@/services/graphql-client";
import { Q_ARTICLES } from "@/services/article.gql";
import { Button } from "@/components/ui/button";

export default async function AdminArticlesPage() {
  const client = getGqlClient();
  const data = await client.request(Q_ARTICLES, { take: 50, skip: 0 });

  const articleUrl = (article: any) => {
    const category = article.category?.slug ?? "news";
    const topic = article.topic ?? "latest";
    return `/${category}/${topic}/${article.slug}`;
  };

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Articles</h2>
          <p className="text-sm text-slate-600">Create, edit, publish.</p>
        </div>
        <Link href="/articles/new">
          <Button>New Article</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
          <div className="col-span-6">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Category</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

        {data.articles.map((a: any) => (
          <div key={a.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm border-b last:border-b-0">
            <div className="col-span-6">
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-slate-500">/{a.slug}</div>
            </div>
            <div className="col-span-2">
              <span className="rounded-full border border-slate-200 px-2 py-1 text-xs">{a.status}</span>
            </div>
            <div className="col-span-2 text-slate-600 text-xs">{a.category?.name ?? "—"}</div>
            <div className="col-span-2 text-right">
              <div className="flex justify-end gap-3 text-sm">
                <Link
                  className="text-slate-700 hover:text-slate-900 underline"
                  href={articleUrl(a)}
                >
                  View
                </Link>
                <Link
                  className="text-slate-700 hover:text-slate-900 underline"
                  href={`/articles/${a.id}/edit`}
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
