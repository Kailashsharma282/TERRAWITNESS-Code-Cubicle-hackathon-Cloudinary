import { NextResponse } from "next/server";
import { StoryCompiler } from "@/lib/stories/story-compiler";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      const stories = await db.story.findMany({
        include: { project: true, scenes: true },
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json({ stories });
    }

    const story = await StoryCompiler.compileStory(projectId);
    return NextResponse.json({ story });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 });
    }

    const compiled = await StoryCompiler.compileStory(projectId);

    // Save or update story in DB
    const existing = await db.story.findFirst({ where: { projectId } });
    let storyRecord;

    if (existing) {
      storyRecord = await db.story.update({
        where: { id: existing.id },
        data: {
          title: `Impact Story — ${compiled.projectTitle}`,
          storyboardJson: JSON.stringify(compiled.scenes),
          status: "COMPILED",
        },
      });
      // Delete old scenes
      await db.storyScene.deleteMany({ where: { storyId: existing.id } });
    } else {
      storyRecord = await db.story.create({
        data: {
          projectId,
          title: `Impact Story — ${compiled.projectTitle}`,
          storyboardJson: JSON.stringify(compiled.scenes),
          status: "COMPILED",
        },
      });
    }

    // Insert scenes
    for (const sc of compiled.scenes) {
      await db.storyScene.create({
        data: {
          storyId: storyRecord.id,
          sequence: sc.sequence,
          sceneType: sc.sceneType,
          assetIds: JSON.stringify(sc.assetIds),
          title: sc.title,
          text: sc.narrativeText,
          duration: sc.durationSeconds,
          evidenceReferences: JSON.stringify(sc.evidenceCitations),
        },
      });
    }

    return NextResponse.json({ story: compiled, storyRecord }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
