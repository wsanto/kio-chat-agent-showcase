import { NextRequest, NextResponse } from "next/server"

const MICROSERVICE_URL =
  process.env.ANIMA_MICROSERVICE_URL || "http://localhost:8001"

/**
 * POST /api/auth/logout - Logout user and revoke refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))

    const response = await fetch(`${MICROSERVICE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Logout failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
