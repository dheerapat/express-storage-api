// import package
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
//const cors = require('cors')
require('dotenv').config()

// establish database connection
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log('Database connection established')
    }
})

// create table in database
db.run('CREATE TABLE IF NOT EXISTS addItem (name, type, lotNo, addDate, expiredDate)', (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Table addItem is ready')
  }
})

db.run('CREATE TABLE IF NOT EXISTS retrieveItem (name, retrieveDate)', (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Table retrieveItem is ready')
  }
})

// instantiate package
const app = express()
const port = process.env.PORT

// middleware funtion
app.use(bodyParser.urlencoded({extended: false}))
//app.use(cors())

// routing
app.get('/', (req, res) => {
  res.json({ping: 'pong'})
})

app.post('/add', (req, res) => {
  try {
    res.json({
      itemName: req.body.itemName,
      type: req.body.type,
      lotNo: req.body.lotNo,
      addDate: Date.now(),
      expiredDate: Date.parse(req.body.expiredDate)
    })
  } catch (err) {
    console.error(err)
    res.json({error : 'something wrong on POST at /add path'})
  }
})

app.post('/retrive', (req, res) => {

})

app.get('/stock/:itemName', (req, res) => {
  
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})