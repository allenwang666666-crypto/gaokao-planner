import { NextResponse } from "next/server";
import { APP_CODENAME, APP_VERSION } from "@/lib/version";

export async function GET() {
  return NextResponse.json({
    version: APP_VERSION,
    codename: APP_CODENAME,
    name: "gaokao-planner-ah"
  });
}
