const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    sessions: [
      {
        loginTime: {
          type: Date,
          required: true,
        },

        logoutTime: {
          type: Date,
          default: null,
        },

       
      },
    ],

    totalWorkingSeconds: {
      type: Number,
      default: 0,
    },

    totalWorkingHours: {
      type: String,
      default: "00:00:00",
    },
   
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;