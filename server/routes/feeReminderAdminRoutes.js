const express = require('express')
const router = express.Router()

const adminAuth = require('../middleware/adminAuth')
const processFeeReminders = require('../utils/processFeeReminders')

// ======================================
// ADMIN: PREVIEW CURRENTLY DUE STUDENTS
// ======================================

router.post(
  '/fee-reminders/preview',
  adminAuth,
  async (req, res) => {
    try {
      const summary = await processFeeReminders({
        mode: 'bulk',
        dryRun: true,
      })

      return res.status(200).json({
        success: true,
        message: 'Fee reminder preview generated.',
        summary,
      })
    } catch (error) {
      console.error('ADMIN FEE REMINDER PREVIEW ERROR:', error)

      return res.status(500).json({
        success: false,
        message: 'Could not generate fee reminder preview.',
      })
    }
  }
)

// ======================================
// ADMIN: SEND BULK FEE REMINDERS
// ======================================

router.post(
  '/fee-reminders/send',
  adminAuth,
  async (req, res) => {
    try {
      // Require an explicit confirmation flag from the UI.
      if (req.body?.confirmed !== true) {
        return res.status(400).json({
          success: false,
          message: 'Confirmation is required before sending emails.',
        })
      }

      const summary = await processFeeReminders({
        mode: 'bulk',
        dryRun: false,
      })

      return res.status(
        summary.emailsFailed > 0 ? 207 : 200
      ).json({
        success: summary.emailsFailed === 0,
        message: 'Bulk fee reminder process completed.',
        summary,
      })
    } catch (error) {
      console.error('ADMIN FEE REMINDER SEND ERROR:', error)

      return res.status(500).json({
        success: false,
        message: 'Could not send fee reminder emails.',
      })
    }
  }
)

module.exports = router