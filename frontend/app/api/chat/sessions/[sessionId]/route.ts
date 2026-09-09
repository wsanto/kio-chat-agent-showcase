/**
 * Next.js API Route: Get Session Details
 * Get a specific session with its messages
 */

import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/chat/sessions/[sessionId]
 * Get session with messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // Parse optional parameters
    const { searchParams } = new URL(request.url)
    const messageLimit = searchParams.get("message_limit")
      ? parseInt(searchParams.get("message_limit")!)
      : undefined

    // Call microservice
    const response = await apiClient.getSession(sessionId, {
      message_limit: messageLimit,
    })

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/chat/sessions/[sessionId]:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
