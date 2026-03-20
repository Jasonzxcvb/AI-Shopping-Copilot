const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
        enum: ["admin", "user"],
      },
      email: {
        type: String,
        required: true,
      },
      profile: {
        addresses: {
          type: [String],
          required: false,
        },
        paymentMethods: {
          type: [String],
          required: false,
        },
      },
      orderHistory: {
        type: [String],
        required: false,
      },
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };