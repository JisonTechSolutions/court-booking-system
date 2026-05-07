const express = require('express')
const cors    = require('cors')

const app = express()
const PORT = 3001

app.use(cors({
    origin: 'https://jisontechsolutions.github.io'
}))
app.use(express.json())

app.post('/api/bookings', (req, res) => {
  const { date, time, playerName } = req.body

  if (!playerName || !date || !time) {
    return res.status(400).json({
      error: 'Missing required fields: playerName, date, and time.',
    })
  } else {
      res.status(201).json({
        message: 'Booking received successfully for',
        booking: { playerName, date, time },
      })
  }

})

app.listen(PORT, () => {
  console.log(`\nServer running at http://localhost:${PORT}`)
  console.log(`POST /api/bookings is ready to receive data.\n`)
})
