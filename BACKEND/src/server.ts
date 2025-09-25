import app from "./app.js";
import { PORT } from "./config/env.js";
import { TaskSchedulerService } from "./services/TaskSchedulerService.js";


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  TaskSchedulerService.startScheduler();
});
