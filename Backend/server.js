import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { initCronJobs } from "./src/services/cron.service.js";

connectDB();
initCronJobs();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})