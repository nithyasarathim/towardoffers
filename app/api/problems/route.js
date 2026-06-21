import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'dsa_sheet.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const dsaSheet = JSON.parse(fileContents);
    return NextResponse.json(dsaSheet);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load problem data" },
      { status: 500 }
    );
  }
}
