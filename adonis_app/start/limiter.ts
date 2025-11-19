/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import app from '@adonisjs/core/services/app'

const shouldUseMemoryStore = app.inTest

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 second')
})

export const loginThrottle = limiter.define('auth.login', (ctx) => {
  const request = ctx.request
  const emailInput = request.input('email')
  const normalizedEmail =
    typeof emailInput === 'string' && emailInput.trim().length > 0
      ? emailInput.toLowerCase().trim()
      : 'anonymous'
  const identifier = [request.ip(), normalizedEmail].filter(Boolean).join(':')

  const httpLimiter = limiter
    .allowRequests(5)
    .every('2 minutes')
    .blockFor('10 minutes')
    .usingKey(identifier)

  httpLimiter.limitExceeded((error) => {
    error.setMessage('Trop de tentatives de connexion. Réessayez dans quelques minutes.')
  })

  if (shouldUseMemoryStore) {
    httpLimiter.store('memory')
  }

  return httpLimiter
})

export const taskMutationsThrottle = limiter.define('tasks.mutations', (ctx) => {
  const user = ctx.auth.user
  if (!user) {
    return limiter.noLimit()
  }

  const httpLimiter = limiter
    .allowRequests(40)
    .every('10 minutes')
    .blockFor('15 minutes')
    .usingKey(`tasks:${user.id}`)

  httpLimiter.limitExceeded((error) => {
    error.setMessage('Quota de modifications atteint. Patientez avant de retenter votre action.')
  })

  if (shouldUseMemoryStore) {
    httpLimiter.store('memory')
  }

  return httpLimiter
})
