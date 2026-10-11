
const express = require('express')
const crypto = require('crypto')
const processFeeReminders = require('../utils/processFeeReminders')

const router = express.Router()

const isValidSecret = (providedSecret, expectedSecret) => {
  if (
    typeof providedSecret !== 'string' ||
    typeof expectedSecret !== 'string' ||
    !providedSecret ||
    !expectedSecret
  ) {
    return false
  }

  const provided = Buffer.from(providedSecret, 'utf8')
  const expected = Buffer.from(expectedSecret, 'utf8')

  if (provided.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(provided, expected)
}

router.post('/fees/reminders/run', async (req, res) => {
  try {
    const expectedSecret = process.env.FEE_REMINDER_CRON_SECRET
    const providedSecret = req.get('x-fee-reminder-secret')

    if (!isValidSecret(providedSecret, expectedSecret)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized fee reminder request.',
      })
    }

    const mode = String(req.query.mode || 'scheduled').toLowerCase()

    if (!['bulk', 'scheduled'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Use bulk or scheduled.',
      })
    }

    // Safe default: no email is sent unless dryRun=false
    // is explicitly requested.
    const dryRunValue = String(req.query.dryRun ?? 'true').toLowerCase()

    if (!['true', 'false'].includes(dryRunValue)) {
      return res.status(400).json({
        success: false,
        message: 'dryRun must be true or false.',
      })
    }

    const dryRun = dryRunValue === 'true'

    const summary = await processFeeReminders({
      mode,
      dryRun,
    })

    return res.status(200).json({
      success: true,
      message: dryRun
        ? `Fee ${mode} reminder dry run completed. No emails were sent.`
        : `Fee ${mode} reminder processing completed.`,
      summary,
    })
  } catch (error) {
    console.error('Fee reminder processing error:', error)

    return res.status(500).json({
      success: false,
      message: 'Fee reminder processing failed.',
      error:
        process.env.NODE_ENV === 'production'
          ? undefined
          : error.message,
    })
  }
})

module.exports = router
