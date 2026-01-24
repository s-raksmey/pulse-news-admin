"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";

import { getAuthenticatedGqlClient } from "@/services/graphql-client";
import { M_UPSERT_ARTICLE } from "@/services/article.gql";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MEGA_NAV } from "@/data/mega-nav";

import type { OutputData } from "@editorjs/editorjs";
import type { NewsEditorRef } from "@/components/editor/news-editor";

/* -------------------------
   Editor (client only)
------------------------- */
const NewsEditor = dynamic(
  () => import("@/components/editor/news-editor"),
  { ssr: false }
);

/* -------------------------
   Helpers
------------------------- */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function titleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* =========================
   Page
========================= */
export default function NewArticlePage() {
  const client = useMemo(() => getAuthenticatedGqlClient(), []);
  const editorRef = useRef<NewsEditorRef>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");

  /* ✅ ADDED */
  const [authorName, setAuthorName] = useState("");

  const [categorySlug, setCategorySlug] = useState<string>(
    Object.keys(MEGA_NAV)[0]
  );
  const [topic, setTopic] = useState<string>("");

  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [isBreaking, setIsBreaking] = useState(false);
  const [saving, setSaving] = useState(false);

  const categoryOptions = Object.keys(MEGA_NAV);
  const topicOptions = useMemo(() => {
    if (!categorySlug) return [];

    const cfg = MEGA_NAV[categorySlug];
    if (!cfg) return [];

    const allItems = [
      ...cfg.explore.items,
      ...cfg.shop.items,
      ...cfg.more.items,
    ];

    return Array.from(
      new Set(
        allItems
          .map((i) => i.href.split("/").pop())
          .filter((t): t is string => Boolean(t))
      )
    );
  }, [categorySlug]);

  /* -------------------------
     Save
  ------------------------- */
  async function save() {
    if (!title) return;

    setSaving(true);
    try {
      const contentJson: OutputData =
        (await editorRef.current?.save()) ?? { blocks: [] };

      await client.request(M_UPSERT_ARTICLE, {
        input: {
          title,
          slug: slug || slugify(title),
          excerpt,
          authorName, // ✅ ADDED
          categorySlug,
          topic: topic || null,
          status,
          isBreaking,
          contentJson,
        },
      });

      window.location.href = "/articles";
    } finally {
      setSaving(false);
    }
  }

  /* -------------------------
     Preview
  ------------------------- */
  async function previewNewArticle() {
    if (!title) {
      alert("Please enter a title before previewing.");
      return;
    }

    const contentJson: OutputData =
      (await editorRef.current?.save()) ?? { blocks: [] };

    sessionStorage.setItem(
      "preview:new-article",
      JSON.stringify({
        title,
        slug: slug || slugify(title),
        excerpt,
        authorName, // ✅ ADDED
        categorySlug,
        topic,
        content: contentJson,
      })
    );

    window.open("/preview/new", "_blank");
  }

  return (
    <main className="space-y-4">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">New Article</h2>
          <p className="text-sm text-slate-600">
            Draft first, publish when ready.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={previewNewArticle} disabled={!title}>
            Preview
          </Button>
          <Button onClick={save} disabled={saving || !title}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* ---------- Meta ---------- */}
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">Title</label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(slugify(e.target.value));
            }}
            placeholder="Article title"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">Slug</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="welcome-to-pulse-news"
          />
        </div>

        {/* ✅ AUTHOR FIELD — ADDED ONLY */}
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">Author</label>
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">Excerpt</label>
          <Input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short description for cards and SEO."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Category
            </label>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                setTopic("");
              }}
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {MEGA_NAV[cat].root.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Topic (optional)
            </label>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">— No topic —</option>
              {topicOptions.map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2 sm:w-1/2">
          <label className="text-xs font-semibold text-slate-600">Status</label>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "DRAFT" | "PUBLISHED")
            }
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="breaking-news"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-red-600"
            checked={isBreaking}
            onChange={(e) => setIsBreaking(e.target.checked)}
          />
          <label
            htmlFor="breaking-news"
            className="text-xs font-semibold text-slate-600"
          >
            Mark as breaking news
          </label>
        </div>
      </div>

      {/* ---------- Editor ---------- */}
      <NewsEditor ref={editorRef} />
    </main>
  );
}
