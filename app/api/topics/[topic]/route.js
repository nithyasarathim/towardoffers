import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request, { params }) {
  try {
    const { topic } = await params;
    const filePath = join(process.cwd(), 'public', 'dsa_sheet.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const dsaSheet = JSON.parse(fileContents);
    const topicData = dsaSheet[topic];
    
    if (!topicData) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(topicData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load topic data" },
      { status: 500 }
    );
  }
}
