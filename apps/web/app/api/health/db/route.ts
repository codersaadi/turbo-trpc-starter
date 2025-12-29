import { NextResponse } from "next/server";
import { serverDB } from "@repo/api/server/db/server";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const startTime = Date.now();

    // Execute simple query to check database connectivity
    await serverDB.execute(sql`SELECT 1`);

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
