// Shared helpers for the presenter deck, the student page and the admin console.
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
  function plain (html) {
    return String(html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&[a-z#0-9]+;/gi, '').replace(/\s+/g, ' ').trim()
  }
  // A readable title for a slide definition, and a stable key used to hide slides per session.
  function slideTitle (def) {
    if (def.q) return 'Live question: ' + def.q
    const m = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/.exec(def.html || '')
    return m ? plain(m[1]) : plain(def.html).slice(0, 60) || 'Untitled slide'
  }
  function slideKey (def) {
    if (def.key) return def.key
    if (def.q) return 'q:' + def.q
    return 't:' + slideTitle(def).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
  }
  window.Live = { baseHref, apiUrl, api, esc, withShare, slideTitle, slideKey }
})()
