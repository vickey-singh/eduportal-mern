
const express = require('express')
const crypto = require('crypto')

const router = express.Router()
const processFeeReminders = require('../utils/processFeeReminders')

router.post('/fees/reminders/run', async (req, res) => {
  try {
    const configuredSecret = process.env.FEE_REMINDER_CRON_SECRET
    const providedSecret = req.get('x-fee-reminder-secret')

    if (!configuredSecret) {
      return res.status(500).json({
        success: false,
        message: 'Fee reminder secret is not configured on the server.',
      })
    }

    if (
      !providedSecret ||
      Buffer.byteLength(providedSecret) !==
        Buffer.byteLength(configuredSecret) ||
      !crypto.timingSafeEqual(
        Buffer.from(providedSecret),
        Buffer.from(configuredSecret)
      )
    ) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      })
    }

    // Safe by default: preview only unless dryRun=false is explicit.
    const dryRun = req.query.dryRun !== 'false'

    const summary = await processFeeReminders({ dryRun })

    return res.status(200).json({
      success: true,
      message: dryRun
        ? 'Fee reminder dry run completed. No emails were sent.'
        : 'Fee reminder processing completed.',
      summary,
    })
  } catch (error) {
    console.error('Fee reminder route error:', error)

    return res.status(500).json({
      success: false,
      message: 'Fee reminder processing failed.',
    })
  }
})

module.exports = router
