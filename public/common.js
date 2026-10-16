// Shared helpers for the presenter deck and the student page.
// Every URL is relative to the page's folder, so the app works the same under the
// Flow preview prefix, a public share link, or a plain host. A flow_share token in the
// page URL is carried over to API calls and to the student link.
(function () {
  function baseHref () {
    let p = location.pathname
    if (!p.endsWith('/')) {
      const last = p.split('/').pop()
      p = (last.includes('.') || last === 'join') ? p.slice(0, p.lastIndexOf('/') + 1) : p + '/'
    }
    return location.origin + p
  }
  const share = new URLSearchParams(location.search).get('flow_share')
  function withShare (url) {
    if (!share || /[?&]flow_share=/.test(url)) return url
    return url + (url.includes('?') ? '&' : '?') + 'flow_share=' + encodeURIComponent(share)
  }
  function apiUrl (path) { return withShare(baseHref() + String(path).replace(/^\/+/, '')) }
  async function api (path, opts = {}) {
    const init = Object.assign({ credentials: 'same-origin' }, opts)
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
  window.Live = { baseHref, apiUrl, api, esc, withShare }
})()
