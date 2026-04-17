/**
 * Session Management Utility
 * Handles session creation, validation, and cleanup
 */

export interface SessionData {
  sessionId: string
  email: string
  role: string
  name: string
  loginTime: string
  isActive: boolean
}

const SESSION_KEY = "gs_session_id"
const USER_KEY = "gs_user"
const AUTH_KEY = "isAuthenticated"

/**
 * Save session to localStorage
 */
export function saveSession(session: SessionData): void {
  try {
    localStorage.setItem(SESSION_KEY, session.sessionId)
    localStorage.setItem(USER_KEY, JSON.stringify(session))
    localStorage.setItem(AUTH_KEY, "true")
    console.log(`[SESSION] Session saved: ${session.sessionId}`)
  } catch (error) {
    console.error("[SESSION] Failed to save session:", error)
  }
}

/**
 * Get session from localStorage
 */
export function getSession(): SessionData | null {
  try {
    const sessionId = localStorage.getItem(SESSION_KEY)
    const userJson = localStorage.getItem(USER_KEY)
    const isAuth = localStorage.getItem(AUTH_KEY)

    if (!sessionId || !userJson || isAuth !== "true") {
      return null
    }

    const user = JSON.parse(userJson)
    return {
      sessionId,
      ...user,
    }
  } catch (error) {
    console.error("[SESSION] Failed to get session:", error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  try {
    const sessionId = localStorage.getItem(SESSION_KEY)
    const isAuth = localStorage.getItem(AUTH_KEY)
    return !!sessionId && isAuth === "true"
  } catch {
    return false
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(AUTH_KEY)
    console.log("[SESSION] Session cleared")
  } catch (error) {
    console.error("[SESSION] Failed to clear session:", error)
  }
}

/**
 * Get session ID only
 */
export function getSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

/**
 * Get user info from session
 */
export function getUserInfo() {
  try {
    const userJson = localStorage.getItem(USER_KEY)
    if (!userJson) return null
    return JSON.parse(userJson)
  } catch {
    return null
  }
}
