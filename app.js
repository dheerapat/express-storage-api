// ---import package
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
//const cors = require('cors')
require('dotenv').config()

// ---establish database connection
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log('Database connection established')
    }
})

// ---create table in database
db.run('CREATE TABLE IF NOT EXISTS addItem (name, type, lotNo, addDate, expiredDate)', (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Table addItem is ready')
  }
})

db.run('CREATE TABLE IF NOT EXISTS withdrawItem (name, withdrawDate)', (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Table withdrawItem is ready')
  }
})

// ---instantiate package
const app = express()
const port = process.env.PORT

// ---middleware funtion
app.use(bodyParser.urlencoded({extended: false}))
//app.use(cors())

// ---routing
app.get('/', (req, res) => {
  res.json({ping: 'pong'})
})

// ---add item to database
app.post('/add', (req, res) => {
  try {
    let item = [
      req.body.itemName,
      req.body.type,
      req.body.lotNo,
      Date.now(),
      Date.parse(req.body.expiredDate)
    ]
    db.run('INSERT INTO addItem (name, type, lotNo, addDate, expiredDate) VALUES(?,?,?,?,?)', item, (err) => {
      if (err) {
        console.error(err)
      } else {
        res.json({success: 'add item successfully'})
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({error : 'something wrong on POST at /add path'})
  }
})

app.post('/withdraw', (req, res) => {
  try {
    let withdraw = [
      req.body.itemName,
      Date.now()
    ]

    db.run('INSERT INTO withdrawItem (name, withdrawDate) VALUES(?,?)', withdraw, (err) => {
      if (err) {
        console.error(err)
      } else {
        res.json({success: 'withdraw item successfully'})
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({error : 'something wrong on POST at /withdraw path'})
  }
})

// ---retrieve data from database
app.get('/stock/:itemName?', (req, res) => {
  try {
    if (req.params.itemName) {

      db.get('SELECT name, COUNT(*) AS count FROM withdrawItem WHERE name = ?',[req.params.itemName], (err, wrow) => {
        if (err) {
          console.error(err)
        } else {
          db.get('SELECT name, COUNT(*) AS count FROM addItem WHERE name = ?',[req.params.itemName], (err, arow) => {
            if (err) {
              console.error(err)
            } else {
              let diff = arow.count - wrow.count
              db.all('SELECT name, expiredDate FROM addItem WHERE name = ? ORDER BY expiredDate DESC LIMIT ?',
              [req.params.itemName, diff], (err, rows) => {
                if (err) {
                  console.error(err)
                } else {
                  res.json(rows)
                }
              })
            }
          })
        }
      })
    } else {
      db.all('SELECT * FROM addItem', [], (err, rows) => {
        if (err) {
          console.error(err)
        } else {
          res.json(rows)
        }
      })
    }
/* 
    let sqlStmt;

    if (req.params.itemName) {
      sqlStmt = `SELECT * FROM addItem WHERE name = "${req.params.itemName}"`
    } else {
      sqlStmt = `SELECT * FROM addItem`
    }

    db.all(sqlStmt, [], (err, rows) => {
      if (err) {
        console.error(err)
      } else {
        res.json(rows)
      }
    })
     */
  } catch (err) {
    console.error(err)
    res.status(500).json({error: 'something wrong on GET at /stock path'})
  }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})