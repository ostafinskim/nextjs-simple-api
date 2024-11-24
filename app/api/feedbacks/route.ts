import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const page_str = request.nextUrl.searchParams.get("page");
  const limit_str = request.nextUrl.searchParams.get("limit");

  const page = page_str ? parseInt(page_str, 10) : 1;
  const limit = limit_str ? parseInt(limit_str, 10) : 10;
  const skip = (page - 1) * limit;

  const feedbacks = await prisma.feedback.findMany({
    skip,
    take: limit,
  });

  const json_response = {
    status: "success",
    results: feedbacks.length,
    feedbacks,
  };
  return NextResponse.json(json_response);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    const feedback = await prisma.feedback.create({
      data: json,
    });

    const json_response = {
      status: "success",
      data: {
        feedback,
      },
    };
    return new NextResponse(JSON.stringify(json_response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      const error_response = {
        status: "fail",
        message: "Feedback with title already exists",
      };
      return new NextResponse(JSON.stringify(error_response), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const error_response = {
      status: "error",
      message: (error as Error).message,
    };
    return new NextResponse(JSON.stringify(error_response), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
