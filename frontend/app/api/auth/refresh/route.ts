import { NextRequest, NextResponse } from "next/server"

const MICROSERVICE_URL =
  process.env.ANIMA_MICROSERVICE_URL || "http://localhost:8001"

/**
 * POST /api/auth/refresh - Refresh access token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.refresh_token) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${MICROSERVICE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Token refresh failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
