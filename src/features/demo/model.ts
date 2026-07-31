export type Log = {
  level: "log" | "info" | "warn" | "error" | "result";
  text: string;
};

export type Result = {
  logs: Log[];
  html: string;
  error?: string;
};
