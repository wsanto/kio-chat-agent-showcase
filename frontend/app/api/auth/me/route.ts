import { NextRequest, NextResponse } from "next/server"

const MICROSERVICE_URL =
  process.env.ANIMA_MICROSERVICE_URL || "http://localhost:8001"

/**
 * GET /api/auth/me - Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    const response = await fetch(`${MICROSERVICE_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to get user info" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting user info:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
