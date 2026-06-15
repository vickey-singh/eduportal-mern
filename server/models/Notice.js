const mongoose =
  require('mongoose')

const noticeSchema =
  new mongoose.Schema(

    {

      title: {

        type: String,

        required: true,

      },

      description: {

        type: String,

        required: true,

      },

      image: {

        type: String,

        default: '',

      },

      isImportant: {

        type: Boolean,

        default: false,

      },

      isPinned: {

        type: Boolean,

        default: false,

      },

    },

    {

      timestamps: true,

    }

  )

module.exports =
  mongoose.model(

    'Notice',

    noticeSchema

  )