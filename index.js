const express = require('express')
const app = express()
const routes = require('./routes/routes')
const cors = require('cors')
const port = process.env.PORT || 3002
app.use(cors())
app.use('/api/v1', cors(), routes)


app.listen(port, () => {

    console.log('server is running');

})