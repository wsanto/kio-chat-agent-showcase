/**
 * Next.js API Route: Get Session Messages
 * Get all messages from a specific session
 */

import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/chat/sessions/[sessionId]/messages
 * Get messages from a session with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // Parse optional parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined

    // Call microservice
    const response = await apiClient.getSessionMessages(sessionId, {
      limit,
      offset,
    })

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error(
      "Error in GET /api/chat/sessions/[sessionId]/messages:",
      error
    )
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
