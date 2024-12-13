import Bull, { Queue } from "bull";

const redisConfig = {
  host: "127.0.0.1", 
  port: 6379,
};

export const fetchQueue: Queue = new Bull("fetch-task", {
  redis: redisConfig,
  limiter: {
    max: 1, 
    duration: 15000, 
    groupKey: "userId"
  },
});
export const commentQueue: Queue = new Bull("comment-task", {
  redis: redisConfig,
  limiter: {
    max: 1,
    duration: 15000,
    groupKey: "userId",
  },
});
export const likeQueue: Queue = new Bull("like-task", {
  redis: redisConfig,
  limiter: {
    max: 1,
    duration: 15000,
    groupKey: "userId",
  },
});
