import app from "./app.js";
import './cronjobs/workflowCron.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});