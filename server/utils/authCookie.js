/** httpOnly cookie name for JWT (not readable by JS — mitigates XSS token theft). */
export const AUTH_COOKIE_NAME = 'ttm_at';

export function getAuthCookieOptions() {
  const cross = process.env.CROSS_ORIGIN_COOKIES === 'true';
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd || cross,
    sameSite: cross ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function attachAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

export function clearAuthCookie(res) {
  const o = getAuthCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, {
    path: o.path,
    httpOnly: o.httpOnly,
    sameSite: o.sameSite,
    secure: o.secure,
  });
}
