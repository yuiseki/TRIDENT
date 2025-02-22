import { NextResponse } from "next/server";
import { prisma } from "@/app/prisma";
import { auth } from "@/app/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to view tasks" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const isAdminQuery = searchParams.get("admin") === "true";

    if (isAdminQuery) {
      const allTasks = await prisma.jGeoGLUETask.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(allTasks);
    }

    const notYetAnsweredTasks = await prisma.jGeoGLUETask.findMany({
      where: {
        NOT: {
          JGeoGLUEAnswer: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const mistakenTasks = await prisma.jGeoGLUETask.findMany({
      where: {
        JGeoGLUEAnswer: {
          some: {
            userId: session.user.id,
            isCorrect: false,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const tasks = [...notYetAnsweredTasks, ...mistakenTasks].slice(0, 10);

    return NextResponse.json(tasks);
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

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have permission to create tasks" },
        { status: 403 }
      );
    }
    const body = await req.json();
    const { task } = body;
    const createdTask = await prisma.jGeoGLUETask.create({
      data: {
        ...task,
      },
    });

    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error("Error creating JGeoGLUE task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
