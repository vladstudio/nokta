/// <reference path="../pb_data/types.d.ts" />

/**
 * Authentication Logging Hook
 *
 * Logs all authentication attempts (success and failure) for security auditing.
 * Logs include timestamp, user identity, IP address, and outcome.
 *
 * Logs appear in:
 * - Development: backend/pocketbase.log
 * - Production: systemd journal (sudo journalctl -u nokta-backend)
 */

// Log user authentication attempts
onRecordAuthWithPasswordRequest((e) => {
  const timestamp = new Date().toISOString()
  const identity = e.identity
  const ip = e.realIP || e.request?.remoteAddr || 'unknown'
  const userAgent = e.request?.header?.get('User-Agent') || 'unknown'

  try {
    e.next() // Attempt authentication

    // Log successful login
    console.log(`[AUTH SUCCESS] ${timestamp} | User: ${identity} | IP: ${ip} | UA: ${userAgent}`)

  } catch (err) {
    // Log failed login attempt
    console.log(`[AUTH FAILURE] ${timestamp} | User: ${identity} | IP: ${ip} | UA: ${userAgent} | Error: ${err.message}`)
    throw err // Re-throw to maintain proper error response to client
  }
}, "users")

// Log superuser (admin) authentication attempts
onRecordAuthWithPasswordRequest((e) => {
  const timestamp = new Date().toISOString()
  const identity = e.identity
  const ip = e.realIP || e.request?.remoteAddr || 'unknown'
  const userAgent = e.request?.header?.get('User-Agent') || 'unknown'

  try {
    e.next() // Attempt authentication

    // Log successful admin login
    console.log(`[ADMIN LOGIN SUCCESS] ${timestamp} | Admin: ${identity} | IP: ${ip} | UA: ${userAgent}`)

  } catch (err) {
    // Log failed admin login attempt (CRITICAL - potential breach attempt)
    console.log(`[ADMIN LOGIN FAILURE] ${timestamp} | Attempt: ${identity} | IP: ${ip} | UA: ${userAgent} | Error: ${err.message}`)
    throw err // Re-throw to maintain proper error response
  }
}, "_superusers")

// Log OTP authentication attempts (if OTP is enabled)
onRecordAuthWithOTPRequest((e) => {
  const timestamp = new Date().toISOString()
  const userId = e.record?.id || 'unknown'
  const userEmail = e.record?.email() || 'unknown'
  const ip = e.realIP || e.request?.remoteAddr || 'unknown'

  try {
    e.next()
    console.log(`[OTP AUTH SUCCESS] ${timestamp} | User: ${userEmail} (${userId}) | IP: ${ip}`)
  } catch (err) {
    console.log(`[OTP AUTH FAILURE] ${timestamp} | User: ${userEmail} (${userId}) | IP: ${ip} | Error: ${err.message}`)
    throw err
  }
}, "users")

// Log auth token refresh attempts (detects session hijacking patterns)
onRecordAuthRefreshRequest((e) => {
  const timestamp = new Date().toISOString()
  const userId = e.record?.id || 'unknown'
  const userEmail = e.record?.email() || 'unknown'
  const ip = e.realIP || e.request?.remoteAddr || 'unknown'

  try {
    e.next()
    console.log(`[TOKEN REFRESH] ${timestamp} | User: ${userEmail} (${userId}) | IP: ${ip}`)
  } catch (err) {
    console.log(`[TOKEN REFRESH FAILURE] ${timestamp} | User: ${userEmail} (${userId}) | IP: ${ip} | Error: ${err.message}`)
    throw err
  }
}, "users")
