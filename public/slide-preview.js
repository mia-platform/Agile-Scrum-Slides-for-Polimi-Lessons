// Read-only, single-slide previews shared by the presenter and admin console.
(function () {
  const { baseHref, withShare } = window.Live
  function url (key, session, preview = true) {
    const u = new URL(withShare(baseHref() + 'index.html'))
    u.searchParams.set('v',new URLSearchParams(location.search).get('v') || 'polimi-nav-20261019-2')
    u.searchParams.set(preview ? 'preview' : 'slide', key)
    if (session) u.searchParams.set('session', session)
    return u.href
  }
  const style = document.createElement('style')
  style.textContent = `
    #single-slide-dialog { width:min(1160px,94vw); max-height:95dvh; padding:20px; border:0; border-radius:18px; background:#F2F7F9; color:#0B2540; box-shadow:0 20px 80px #0B254055; font-family:'IBM Plex Sans',sans-serif; }
    #single-slide-dialog::backdrop { background:#0B2540bb; }
    #single-slide-dialog .preview-heading { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
    #single-slide-dialog h2 { flex:1; font-size:22px; margin:0; }
    #single-slide-dialog iframe { display:block; border:0; width:min(1100px,calc(94vw - 40px),calc((95dvh - 150px)*16/9)); aspect-ratio:16/9; margin:auto; background:#F2F7F9; }
    #single-slide-dialog .preview-actions { display:flex; justify-content:flex-end; align-items:center; gap:12px; margin-top:14px; }
    #single-slide-dialog button,#single-slide-dialog a { font:inherit; font-size:15px; padding:8px 14px; border:1px solid #C5D7E0; border-radius:8px; background:white; color:#0B2540; cursor:pointer; text-decoration:none; }
    .sl-row .sl-preview { flex:none; font-size:12px; padding:4px 8px; }
  `
  document.head.appendChild(style)
  const dialog = document.createElement('dialog')
  dialog.id = 'single-slide-dialog'
  dialog.innerHTML = '<div class="preview-heading"><h2 id="single-preview-title">Slide preview</h2><button type="button" id="single-preview-close" aria-label="Close slide preview">Close</button></div><iframe id="single-preview-frame" title="Single slide preview"></iframe><div class="preview-actions"><button type="button" id="single-preview-replay">Replay animation</button><a id="single-preview-open" target="_blank" rel="noopener">Open presenter here</a></div>'
  document.body.appendChild(dialog)
  const frame = dialog.querySelector('iframe')
  document.getElementById('single-preview-close').onclick = () => dialog.close()
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) dialog.close() } })
  dialog.addEventListener('close', () => { frame.src = 'about:blank' })
  document.getElementById('single-preview-replay').onclick = () => { const u=new URL(frame.src); u.searchParams.set('replay',Date.now()); frame.src=u.href }
  window.SlidePreview = {
    url,
    open ({ key, session, title, included = true }) {
      document.getElementById('single-preview-title').textContent = title || 'Slide preview'
      frame.src = url(key,session)
      const link=document.getElementById('single-preview-open')
      link.href=url(key,session,false)
      link.hidden=!included
      dialog.showModal()
    }
  }
})()
