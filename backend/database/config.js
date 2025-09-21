const mongoose = require("mongoose");

module.exports.connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.DB_LOCAL_URL);
    console.log(`mongodb connected to the host ${con.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};
