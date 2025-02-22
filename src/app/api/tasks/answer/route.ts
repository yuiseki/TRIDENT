import { auth } from "@/app/auth";
import { prisma } from "@/app/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to anser to tasks" },
        { status: 403 }
      );
    }
    if (session.user.id === undefined) {
      return NextResponse.json(
        { error: "Please log in to anser to tasks" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { answer } = body;
    const createdAnswer = await prisma.jGeoGLUEAnswer.upsert({
      where: {
        taskId_userId: {
          taskId: answer.taskId,
          userId: session.user.id,
        },
      },
      update: {
        answer: answer.answer,
        isCorrect: answer.isCorrect,
      },
      create: {
        userId: session.user.id,
        taskId: answer.taskId,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
      },
    });

    return NextResponse.json(createdAnswer, { status: 201 });
  } catch (error) {
    console.error("Error creating JGeoGLUE task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
