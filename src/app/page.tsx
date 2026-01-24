// src/app/page.tsx
'use client';

import { RoleDashboard } from "@/components/dashboard/RoleDashboard"

export default function DashboardPage() {
  // In the future, you can fetch role-specific data here and pass it to RoleDashboard
  // For now, we'll let each dashboard component handle its own mock data
  
  return <RoleDashboard />
}

