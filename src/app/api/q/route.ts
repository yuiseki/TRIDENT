import { NextResponse } from "next/server";
import { prisma } from "@/app/prisma";

export async function GET() {
  try {
    const tasks = await prisma.jGeoGLUETask.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching JGeoGLUE tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
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