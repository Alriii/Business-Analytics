import { cleanEnv, port, str, url } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
    PORT: port({ default: 7000 }),
    NODE_ENV: str({
        choices: ["development", "production", "test"],
        default: "development",
    }),
    DATABASE_URL: url(),
    AUTH_SECRET: str(),
    FRONTEND_URL: url({ default: "http://localhost:3000" }),
});
