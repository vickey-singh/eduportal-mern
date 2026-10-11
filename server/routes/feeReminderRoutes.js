
const express = require('express')
const crypto = require('crypto')

const processFeeReminders = require('../utils/processFeeReminders')

const router = express.Router()

const VALID_MODES = new Set(['bulk', 'scheduled'])
const VALID_BOOLEAN_VALUES = new Set(['true', 'false'])

const ADMISSION_NUMBER_REGEX = /^[a-zA-Z0-9_-]{1,50}$/

// --------------------------------------------------
// CONSTANT-TIME SECRET COMPARISON
// --------------------------------------------------

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

// --------------------------------------------------
// POST /api/fees/reminders/run
// --------------------------------------------------

router.post('/fees/reminders/run', async (req, res) => {
  // Prevent browsers and intermediary caches from
  // storing operational responses.
  res.set('Cache-Control', 'no-store')

  try {
    // ----------------------------------------------
    // 1. AUTHENTICATION
    // ----------------------------------------------

    const expectedSecret =
      process.env.FEE_REMINDER_CRON_SECRET

    const providedSecret = req.get(
      'x-fee-reminder-secret'
    )

    if (!isValidSecret(providedSecret, expectedSecret)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized fee reminder request.',
      })
    }

    // ----------------------------------------------
    // 2. MODE VALIDATION
    // ----------------------------------------------

    const rawMode = req.query.mode ?? 'scheduled'

    if (typeof rawMode !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Use bulk or scheduled.',
      })
    }

    const mode = rawMode.trim().toLowerCase()

    if (!VALID_MODES.has(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Use bulk or scheduled.',
      })
    }

    // ----------------------------------------------
    // 3. DRY-RUN VALIDATION
    // Default: true, so accidental calls do not send
    // actual emails.
    // ----------------------------------------------

    const rawDryRun = req.query.dryRun ?? 'true'

    if (typeof rawDryRun !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'dryRun must be true or false.',
      })
    }

    const dryRunValue = rawDryRun.trim().toLowerCase()

    if (!VALID_BOOLEAN_VALUES.has(dryRunValue)) {
      return res.status(400).json({
        success: false,
        message: 'dryRun must be true or false.',
      })
    }

    const dryRun = dryRunValue === 'true'

    // ----------------------------------------------
    // 4. OPTIONAL STUDENT FILTER
    // ----------------------------------------------

    const rawAdmissionNumber =
      req.query.admissionNumber ?? ''

    if (typeof rawAdmissionNumber !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid admission number.',
      })
    }

    const admissionNumber = rawAdmissionNumber.trim()

    if (
      admissionNumber &&
      !ADMISSION_NUMBER_REGEX.test(admissionNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admission number.',
      })
    }

    // ----------------------------------------------
    // 5. PROCESS REMINDERS
    // ----------------------------------------------

    const summary = await processFeeReminders({
      mode,
      dryRun,
      admissionNumber,
    })

    // ----------------------------------------------
    // 6. RESPONSE
    // ----------------------------------------------

    const hasFailures = summary.emailsFailed > 0

    return res.status(hasFailures ? 207 : 200).json({
      success: !hasFailures,
      message: dryRun
        ? `Fee ${mode} reminder dry run completed. No emails were sent.`
        : `Fee ${mode} reminder processing completed.`,
      summary,
    })
  } catch (error) {
    console.error(
      'Fee reminder processing error:',
      error.message
    )

    return res.status(500).json({
      success: false,
      message: 'Fee reminder processing failed.',
    })
  }
})

module.exports = router
