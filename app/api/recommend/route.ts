import { NextResponse } from "next/server";
import { generateStrategyPlans } from "@/lib/recommendation";
import { mergeUserProfile } from "@/lib/merge-profile";
import type { UserProfile } from "@/lib/types";
import { APP_VERSION } from "@/lib/version";

/** V2：服务端推荐接口，便于后续接真实库、小程序或第三方调用 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<UserProfile>;
    const profile = mergeUserProfile(body);
    const plans = generateStrategyPlans(profile);
    return NextResponse.json({
      version: APP_VERSION,
      profile,
      plans
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
