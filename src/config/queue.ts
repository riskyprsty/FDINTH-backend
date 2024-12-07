import Bull, { Queue } from "bull";

// Konfigurasi koneksi Redis
const redisConfig = {
  host: "127.0.0.1", // Sesuaikan dengan Redis Anda
  port: 6379,
};

// Definisi Queue untuk berbagai jenis task
export const fetchQueue: Queue = new Bull("fetch-task", { redis: redisConfig });
export const commentQueue: Queue = new Bull("comment-task", {
  redis: redisConfig,
});
export const likeQueue: Queue = new Bull("like-task", { redis: redisConfig });
