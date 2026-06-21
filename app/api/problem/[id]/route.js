import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const filePath = join(process.cwd(), 'public', 'dsa_sheet.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const dsaSheet = JSON.parse(fileContents);
    
    // Find the problem by ID
    let foundProblem = null;
    let topicName = null;
    let subtopicName = null;
    
    for (const topic in dsaSheet) {
      for (const subtopic in dsaSheet[topic]) {
        const subtopicData = dsaSheet[topic][subtopic];
        if (subtopicData.problems) {
          const found = subtopicData.problems.find(p => p.id === id);
          if (found) {
            foundProblem = found;
            topicName = topic;
            subtopicName = subtopic;
            break;
          }
        }
      }
      if (foundProblem) break;
    }
    
    if (!foundProblem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      problem: foundProblem,
      topic: topicName,
      subtopic: subtopicName
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load problem data" },
      { status: 500 }
    );
  }
}
