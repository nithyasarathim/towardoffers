import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'dsa_sheet.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const dsaSheet = JSON.parse(fileContents);
    const topics = Object.keys(dsaSheet);
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load topics" },
      { status: 500 }
    );
  }
}
