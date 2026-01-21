// src/app/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Settings
        </h1>
        <p className="text-slate-600">
          Configure your system preferences and options.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          System Settings
        </h2>
        <p className="text-slate-600 mb-4">
          This page is under development. Settings functionality will be available soon.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-600">
          🏗️ Coming Soon
        </div>
      </div>
    </div>
  )
}
