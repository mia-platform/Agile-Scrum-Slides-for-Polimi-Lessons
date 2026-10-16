// Shared helpers for the presenter deck and the student page.
// Every URL is relative to the page's folder, so the app works the same under the
// Flow preview prefix, a public share link, or a plain host.
(function () {
  function baseHref () {
    let p = location.pathname
    if (!p.endsWith('/')) {
      const last = p.split('/').pop()
      p = last.includes('.') ? p.slice(0, p.lastIndexOf('/') + 1) : p + '/'
    }
    return location.origin + p
  }
  function apiUrl (path) { return baseHref() + String(path).replace(/^\/+/, '') }
  async function api (path, opts = {}) {
    const init = Object.assign({}, opts)
    if (init.body && typeof init.body !== 'string') {
      init.body = JSON.stringify(init.body)
      init.headers = Object.assign({ 'Content-Type': 'application/json' }, init.headers || {})
    }
    const res = await fetch(apiUrl(path), init)
    let data = null
    try { data = await res.json() } catch (_) { data = null }
    if (!res.ok) {
      const err = new Error((data && data.error) || ('Request failed: ' + res.status))
      err.status = res.status
      throw err
    }
    return data
  }
  function esc (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }
  window.Live = { baseHref, apiUrl, api, esc }
})()
