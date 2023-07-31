const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const {detect} = require('@tonaljs/chord-detect')
const pMemoize = require('p-memoize')

// put server express routes at the beginning //
const app = express()

//Serve the static files from the React app
app.use(express.static(path.join(__dirname, '/')))
// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'//mandolin.html'));
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = process.env.port || 3300

// TODO: investigate caching on req.body specifically at handler level
const detectM = pMemoize(async function (body) {
  console.log('ok', body);
  return Promise.resolve(detect(body))
}, {
  cacheKey: arguments_ => JSON.stringify(arguments_)
})

app.post('/rest/chord-detection', function(req, res) {
  res.send(detectM(req.body))
})

app.listen(port, () => {
    console.log("Hi This port is running", port);
})