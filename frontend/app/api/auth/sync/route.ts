import { NextRequest, NextResponse } from "next/server"

const MICROSERVICE_URL =
  process.env.ANIMA_MICROSERVICE_URL || "http://localhost:8001"

/**
 * POST /api/auth/sync - Sync Supabase user with ANIMA microservice
 * Creates or updates user in ANIMA based on Supabase auth
 * Falls back to Supabase data if ANIMA is unavailable
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supabase_id, email, name, avatar_url, provider } = body

    if (!supabase_id || !email) {
      return NextResponse.json(
        { error: "supabase_id and email are required" },
        { status: 400 }
      )
    }

    // Create a fallback user object from Supabase data
    // This is used if ANIMA microservice is unavailable
    const fallbackUser = {
      user_id: supabase_id,
      email: email,
      name: name || email.split("@")[0],
      avatar_url: avatar_url,
      provider: provider || "google",
      created_at: new Date().toISOString(),
    }

    try {
      // Try to find existing user by supabase_id
      const findResponse = await fetch(
        `${MICROSERVICE_URL}/api/v1/auth/find-by-supabase?supabase_id=${supabase_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )

      if (findResponse.ok) {
        // User exists in ANIMA, return it
        const data = await findResponse.json()
        return NextResponse.json({ user: data.user })
      }

      // User doesn't exist in ANIMA, try to create them
      const createResponse = await fetch(
        `${MICROSERVICE_URL}/api/v1/auth/register-oauth`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supabase_id,
            email,
            name: name || email.split("@")[0],
            avatar_url,
            provider,
          }),
        }
      )

      if (createResponse.ok) {
        const data = await createResponse.json()
        return NextResponse.json({ user: data.user })
      }

      // If creation failed due to duplicate, try to fetch by email
      if (createResponse.status === 409) {
        const retryFind = await fetch(
          `${MICROSERVICE_URL}/api/v1/auth/find-by-email?email=${email}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        )

        if (retryFind.ok) {
          const data = await retryFind.json()
          return NextResponse.json({ user: data.user })
        }
      }

      // ANIMA responded but with an error - use fallback
      console.warn("ANIMA sync failed, using fallback user")
      return NextResponse.json({ user: fallbackUser })

    } catch (fetchError) {
      // Network error - ANIMA microservice is not reachable
      // Return fallback user so the app can still function
      console.warn("ANIMA microservice unreachable, using fallback user:", fetchError)
      return NextResponse.json({ user: fallbackUser })
    }

  } catch (error) {
    console.error("Error in sync endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
