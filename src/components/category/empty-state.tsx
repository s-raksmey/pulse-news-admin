"use client";

import { FileText } from "lucide-react";

export function EmptyState({
  title = "No articles yet",
  description = "There are no published articles in this section.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="py-24 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FileText className="w-7 h-7 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title}
      </h3>

      <p className="text-sm text-gray-500 max-w-sm">
        {description}
      </p>
    </div>
  );
}
