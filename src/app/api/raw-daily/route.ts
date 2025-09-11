import { NextResponse } from "next/server";
import { rawDaily } from "@/lib/analytics";

// ダミーデータを返却する API ルート
export async function GET() {
  return NextResponse.json(rawDaily);
}
