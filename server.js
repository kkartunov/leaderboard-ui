const express = require('express')
const next = require('next')
const contentful = require('contentful')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
})

const port = process.env.PORT

app.prepare()
  .then(() => {
    const server = express()

    // Endpoint that loads the list of tracks
    server.get('/track/:trackId', async (req, res) => {
      const contentfulEntryId = req.params.trackId

      const actualPage = '/tracks'

      const queryParams = { contentfulEntryId }

      app.render(req, res, actualPage, queryParams)
    })

    // Endpoint that lists the pages in each track
    server.get('/page/:pageName/:entryId', async (req, res) => {
      const contentfulEntryId = req.params.entryId

      const actualPage = `/${req.params.pageName}`

      const queryParams = { contentfulEntryId }

      app.render(req, res, actualPage, queryParams)
    })

    // Endpoint that gets the content from contentful for a given entry id
    server.get('/contentful/:entryId', async (req, res) => {
      const data = await client.getEntry(req.params.entryId)

      res.send(data)
    })

    // Endpoint that gets the content from contentful for an entry id configured in environment variable
    // (meant to be used for the ROOT page, to get the root page contents)
    server.get('/content/:pageName', async (req, res) => {
      const pageName = req.params.pageName

      const data = await client.getEntry(process.env[pageName])

      res.send(data)
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on ${port}`)
    })
  })
  .catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  })
