"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { saveSession, isAuthenticated } from "@/lib/session"

const ADMIN_EMAIL = "admin@goldmansachs.com"
const ADMIN_PASSWORD = "goldmansachs_admin"

// Demo credentials for quick testing
const DEMO_CREDENTIALS = [
  { email: "pranav@goldmansachs.com", password: "pranav123", role: "Sales", name: "Pranav" },
  { email: "abhinav@goldmansachs.com", password: "abhinav123", role: "Financial", name: "Abhinav" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if already logged in
  useEffect(() => {
    setMounted(true)
    if (isAuthenticated()) {
      console.log("[LOGIN] User already authenticated, redirecting to dashboard")
      // Redirect based on stored role
      const userJson = localStorage.getItem("gs_user")
      if (userJson) {
        try {
          const user = JSON.parse(userJson)
          if (user.role.toLowerCase().includes("financial")) {
            router.push("/dashboard/financial")
          } else {
            router.push("/dashboard")
          }
        } catch {
          router.push("/dashboard")
        }
      }
    }
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Admin shortcut: redirect to admin page
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        router.push("/admin")
        return
      }

      // Check demo credentials first
      const demoUser = DEMO_CREDENTIALS.find(d => d.email === email && d.password === password)
      if (demoUser) {
        // Create server-side session for demo user
        const sessionRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            email: demoUser.email,
            role: demoUser.role,
            name: demoUser.name,
          }),
        })

        const sessionData = await sessionRes.json()
        if (!sessionData.success || !sessionData.session) {
          setError("Failed to create session")
          setLoading(false)
          return
        }

        // Store session using utility function
        saveSession(sessionData.session)

        console.log(`[LOGIN] Demo user logged in: ${demoUser.email} (${demoUser.role})`)

        // Redirect based on role
        if (demoUser.role.toLowerCase().includes("financial")) {
          router.push("/dashboard/financial")
        } else if (demoUser.role.toLowerCase().includes("sales")) {
          router.push("/dashboard")
        } else {
          router.push("/dashboard")
        }
        return
      }

      // Regular auth flow
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.message || "Invalid credentials")
        setLoading(false)
        return
      }

      // Create server-side session
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          email,
          role: data.user?.role,
          name: data.user?.name,
        }),
      })

      const sessionData = await sessionRes.json()
      if (!sessionData.success || !sessionData.session) {
        setError("Failed to create session")
        setLoading(false)
        return
      }

      // Store session using utility function
      saveSession(sessionData.session)

      console.log(`[LOGIN] User logged in: ${email} (${data.user?.role})`)

      const role = (data.user?.role || "").toLowerCase()

      if (role.includes("financial")) {
        router.push("/dashboard/financial")
      } else if (role.includes("sales")) {
        router.push("/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("[LOGIN] Error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#080808] to-gray-900 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/Goldman Sachs.jpg" 
              alt="Goldman Sachs Logo" 
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold">Goldman Sachs — Enterprise Access</h1>
          <p className="text-sm text-gray-400">Secure sign in</p>
        </div>

        <div className="glass-card p-6 rounded-xl backdrop-blur-md bg-black/40 border border-gray-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-red-900/60 text-red-300 p-2 rounded">{error}</div>}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-[#0b0b0b] border border-gray-700 p-3 outline-none focus:ring-2 focus:ring-amber-400 transition"
                type="email"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-[#0b0b0b] border border-gray-700 p-3 outline-none focus:ring-2 focus:ring-amber-400 transition"
                type="password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:scale-[1.01] transition-transform disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-2 text-xs text-gray-400">
            <p className="font-semibold text-gray-300">Demo Credentials:</p>
            <p>Sales: pranav@goldmansachs.com / pranav123</p>
            <p>Financial: abhinav@goldmansachs.com / abhinav123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
