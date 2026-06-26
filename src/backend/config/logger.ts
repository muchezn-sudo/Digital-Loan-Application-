import crypto from "crypto";

// Basic structured Logger simulating Winston format for clean console & file outputs
export class WinstonLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}]: ${message}${metaString}`;
  }

  info(message: string, meta?: any) {
    console.log(this.formatMessage("info", message, meta));
  }

  error(message: string, meta?: any) {
    console.error(this.formatMessage("error", message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage("warn", message, meta));
  }

  debug(message: string, meta?: any) {
    console.debug(this.formatMessage("debug", message, meta));
  }
}

export function createLogger(context: string): WinstonLogger {
  return new WinstonLogger(context);
}
