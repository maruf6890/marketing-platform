import cron from "node-cron";

cron.schedule("* * * * *", () => {
  console.log("Runs every 1 minute");
});