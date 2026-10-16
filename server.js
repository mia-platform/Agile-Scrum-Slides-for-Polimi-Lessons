const express = require('express')

const app = express()
app.use(express.json())

// "/" is deliberately left unmapped so the preview shows the runner's API portal.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`)
})
