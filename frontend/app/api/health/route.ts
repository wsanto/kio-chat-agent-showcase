/**
 * Next.js API Route: Health Check
 * Check microservice connectivity
 */

import { NextResponse } from "next/server"
import { apiClient } from "@/lib/api/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/health
 * Check if Next.js app and microservice are healthy
 */
export async function GET() {
  try {
    // Check microservice health
    const microserviceHealth = await apiClient.health()

    const response = {
      nextjs: "healthy",
      microservice: microserviceHealth.error
        ? "unhealthy"
        : microserviceHealth.data?.status,
      microservice_details: microserviceHealth.data,
      microservice_error: microserviceHealth.error,
      timestamp: new Date().toISOString(),
    }

    // Return 200 if Next.js is healthy, even if microservice is down
    // This allows the frontend to detect microservice issues
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error in /api/health:", error)
    return NextResponse.json(
      {
        nextjs: "healthy",
        microservice: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  }
}
