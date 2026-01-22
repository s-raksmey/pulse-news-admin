"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { getGqlClient } from "@/services/graphql-client";
import {
  Q_ARTICLE_BY_ID,
  M_UPSERT_ARTICLE,
  M_DELETE_ARTICLE,
} from "@/services/article.gql";
import { CategoryService, Category } from "@/services/category.gql";
import { getCategoriesWithFallback } from "@/utils/seed-categories";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import type { OutputData } from "@editorjs/editorjs";
import type { NewsEditorRef } from "@/components/editor/news-editor";

/* -------------------------
   Editor (client-only)
------------------------- */
const NewsEditor = dynamic(() => import("@/components/editor/news-editor"), {
  ssr: false,
});

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
export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const client = useMemo(() => getGqlClient(), []);
  const editorRef = useRef<NewsEditorRef>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [isBreaking, setIsBreaking] = useState(false);

  // Category and topic management
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  /** Editor initial content (ONE TIME) */
  const [initialContent, setInitialContent] = useState<OutputData>({
    blocks: [],
  });

  // Get topics for selected category
  const selectedCategory = categories.find(cat => cat.slug === categorySlug);
  const topicOptions = selectedCategory?.topics || [];

  /* -------------------------
     Load categories
  ------------------------- */
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      // Use the robust fallback mechanism
      const categoriesData = await getCategoriesWithFallback();
      setCategories(categoriesData);
      
      console.log(`📋 Loaded ${categoriesData.length} categories for article editing`);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategoriesError('Failed to load categories. Please try again.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  /* -------------------------
     Load article
  ------------------------- */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // Load categories and article in parallel
        const [categoriesData, articleData] = await Promise.all([
          getCategoriesWithFallback(),
          client.request(Q_ARTICLE_BY_ID, { id })
        ]);

        if (!active) return;

        // Set categories
        setCategories(categoriesData);
        setCategoriesLoading(false);

        // Set article data
        const article = articleData.articleById;
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt ?? "");
        setAuthorName(article.authorName ?? "");
        setCategorySlug(article.category?.slug ?? "");
        setTopic(article.topic ?? "");
        setStatus(article.status);
        setIsBreaking(article.isBreaking ?? false);
        setInitialContent(article.contentJson ?? { blocks: [] });

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setCategoriesError('Failed to load data');
        setCategoriesLoading(false);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [client, id]);

  /* -------------------------
     Actions
  ------------------------- */
  async function upsertArticle(nextStatus = status, redirectToList = false) {
    if (!title) {
      alert("Please enter a title.");
      return;
    }

    if (!categorySlug) {
      alert("Please select a category.");
      return;
    }

    setSaving(true);
    try {
      const contentJson = (await editorRef.current?.save()) ?? { blocks: [] };

      await client.request(M_UPSERT_ARTICLE, {
        id,
        input: {
          title,
          slug,
          excerpt,
          authorName,
          categorySlug,
          topic: topic || null,
          status: nextStatus,
          isBreaking,
          contentJson,
        },
      });

      setStatus(nextStatus);

      if (redirectToList) {
        router.push("/articles");
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    await upsertArticle(status, true);
  }

  async function togglePublish() {
    const nextStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await upsertArticle(nextStatus, false);
  }

  async function remove() {
    if (!confirm("Delete this article?")) return;
    setSaving(true);
    try {
      await client.request(M_DELETE_ARTICLE, { id });
      router.push("/articles");
    } finally {
      setSaving(false);
    }
  }

  function preview() {
    if (!slug) {
      alert("Please set a slug before previewing.");
      return;
    }
    window.open(`/preview/${slug}`, "_blank");
  }

  if (loading) {
    return <div className="text-sm text-slate-600">Loading…</div>;
  }

  return (
    <main className="space-y-4">
      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Edit Article</h2>
          <p className="text-sm text-slate-600">ID: {id}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={preview} disabled={!slug}>
            Preview
          </Button>
          <Button variant="outline" onClick={togglePublish} disabled={saving || !title || !categorySlug}>
            {status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={save} disabled={saving || !title || !categorySlug}>
            Save
          </Button>
          <Button variant="ghost" onClick={remove} disabled={saving}>
            Delete
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
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">Slug</label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>

        {/* ✅ AUTHOR FIELD — ADDED, NOTHING REMOVED */}
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">Author</label>
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">
            Excerpt
          </label>
          <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>

        {/* Categories Error Display */}
        {categoriesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-600 text-sm">⚠️ {categoriesError}</div>
            <button 
              onClick={loadCategories}
              className="text-red-700 underline text-sm mt-1"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Category
            </label>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                setTopic("");
              }}
              disabled={categoriesLoading || categories.length === 0}
            >
              {categoriesLoading ? (
                <option value="">Loading categories...</option>
              ) : categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                <>
                  <option value="">— Select Category —</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Topic (optional)
            </label>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50 disabled:text-slate-500"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={!categorySlug || topicOptions.length === 0}
            >
              <option value="">— No topic —</option>
              {topicOptions.map((topicItem) => (
                <option key={topicItem.slug} value={topicItem.slug}>
                  {topicItem.title}
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
              setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
            }
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
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
      <NewsEditor ref={editorRef} initialData={initialContent} />
    </main>
  );
}
