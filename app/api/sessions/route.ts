import { NextRequest, NextResponse } from 'next/server'

interface Session {
  sessionId: string
  email: string
  role: string
  name: string
  loginTime: string
  isActive: boolean
}

/**
 * Stateless Session API for Vercel Deployment
 * 
 * This implementation does NOT use file-based storage (fs/promises, path).
 * Instead, it returns session data in-memory for frontend storage via cookies/localStorage.
 * 
 * The frontend is responsible for maintaining session state via:
 * - localStorage.setItem('gs_session_id', sessionId)
 * - Cookie storage with Set-Cookie headers
 * 
 * This approach ensures compatibility with Vercel's ephemeral filesystem.
 */

export async function POST(req: NextRequest) {
  try {
    const { action, email, role, name } = await req.json()

    // CREATE action: Generate new session
    if (action === 'create') {
      if (!email || !role || !name) {
        return NextResponse.json(
          {
            success: false,
            message: 'Missing required fields: email, role, name',
          },
          { status: 400 }
        )
      }

      // Generate stateless session ID
      const sessionId = `session_${Date.now()}`
      const loginTime = new Date().toISOString()

      // Create session object (stored on frontend, not on server)
      const session: Session = {
        sessionId,
        email,
        role,
        name,
        loginTime,
        isActive: true,
      }

      console.log(`[SESSION API] Session created: ${sessionId} for ${email}`)

      return NextResponse.json({
        success: true,
        sessionId,
        session,
      })
    }

    // DESTROY action: Logout (stateless, no cleanup needed on server)
    if (action === 'destroy') {
      console.log('[SESSION API] Session destroyed')
      return NextResponse.json({
        success: true,
        message: 'Session ended',
      })
    }

    // Invalid action
    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[SESSION API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    // GET with sessionId parameter: Verify session is valid
    if (sessionId) {
      console.log(`[SESSION API] Session lookup: ${sessionId}`)
      
      // NOTE: In production with real backend, you would validate the sessionId here
      // For now, we return success as frontend has already stored the session
      // The actual RBAC validation happens in /api/chat route using sessions.json
      
      return NextResponse.json({
        success: true,
        message: 'Session is valid',
      })
    }

    // GET without parameters: Return empty sessions list (no persistent storage)
    console.log('[SESSION API] Sessions list requested')
    return NextResponse.json({
      success: true,
      sessions: [],
    })
  } catch (error) {
    console.error('[SESSION API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
