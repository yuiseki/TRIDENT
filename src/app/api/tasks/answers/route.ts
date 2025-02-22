import { auth } from "@/app/auth";
import { prisma } from "@/app/prisma";
import { NextRequest, NextResponse } from "next/server";

// 自分が答えたAnswerの一覧
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to view answers of tasks" },
        { status: 403 }
      );
    }

    const answers = await prisma.jGeoGLUEAnswer.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        task: true,
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching JGeoGLUE tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to answer to tasks" },
        { status: 403 }
      );
    }
    if (session.user.id === undefined) {
      return NextResponse.json(
        { error: "Please log in to answer to tasks" },
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
