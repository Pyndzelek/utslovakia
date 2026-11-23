import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * A signed "this form was rendered at <time>" stamp, embedded in the inquiry form as a
 * hidden field. On submit it proves the request came from a page this server rendered and
 * tells how long the visitor had the form open — scripts that post straight to the endpoint
 * have no stamp, and ones that fetch-and-submit instantly are too fast to be a person.
 * Not a CAPTCHA; it filters the bulk of automated spam with no visitor friction.
 */

const sign = (timestamp: string) =>
  createHmac('sha256', process.env.PAYLOAD_SECRET ?? '')
    .update(`inquiry-form:${timestamp}`)
    .digest('base64url')

export function createFormToken(now = Date.now()): string {
  const timestamp = String(now)
  return `${timestamp}.${sign(timestamp)}`
}

/** `null` when the token is missing, malformed or not signed by this server; otherwise its age. */
export function formTokenAge(token: unknown, now = Date.now()): number | null {
  if (typeof token !== 'string') return null
  const [timestamp, signature] = token.split('.')
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return null

  const expected = Buffer.from(sign(timestamp))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null

  return now - Number(timestamp)
}
