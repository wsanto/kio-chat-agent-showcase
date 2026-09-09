/**
 * Next.js API Route: Send Chat Message
 * Proxies requests to ANIMA microservice
 */

import { NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api/client"
import type { SendMessageRequest } from "@/lib/types/api"

export const runtime = "nodejs" // Use Node.js runtime for server-side fetch
export const dynamic = "force-dynamic" // Disable static optimization

/**
 * POST /api/chat/message
 * Send a message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as SendMessageRequest

    // Validate required fields
    if (!body.user_id || !body.message) {
      return NextResponse.json(
        {
          error: "Missing required fields: user_id and message are required",
        },
        { status: 400 }
      )
    }

    // Call microservice
    const response = await apiClient.sendMessage(body)

    // Handle microservice errors
    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    // Return successful response
    return NextResponse.json(response.data, { status: 200 })
  } catch (error) {
    console.error("Error in /api/chat/message:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
