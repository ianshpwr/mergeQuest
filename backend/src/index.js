import  dotenv from "dotenv";
import {app} from './app.js'

// Temporarily comment out MongoDB connection for OAuth testing
// import connectDB from "./db/index.js";

dotenv.config({
    path: '.env'
})

// connectDB()
// .then(() => {
    app.listen(process.env.PORT || 4000,"0.0.0.0", () => {
        console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`);
      });
// })
// .catch((error) => {
//     console.error("Database connection failed:", error.message);
//   })


