/**
 * Next.js API Route: Chat Sessions
 * Handle session creation and listing
 */

import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api/client"
import type { CreateSessionRequest } from "@/lib/types/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateSessionRequest

    // Validate required fields
    if (!body.user_id) {
      return NextResponse.json(
        { error: "Missing required field: user_id" },
        { status: 400 }
      )
    }

    // Call microservice
    const response = await apiClient.createSession(body)

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error("Error in POST /api/chat/sessions:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chat/sessions?user_id={userId}
 * Get all sessions for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: user_id" },
        { status: 400 }
      )
    }

    // Parse optional parameters
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined
    const includeInactive = searchParams.get("include_inactive") === "true"

    // Call microservice
    const response = await apiClient.getUserSessions(userId, {
      limit,
      include_inactive: includeInactive,
    })

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/chat/sessions:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
