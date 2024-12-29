import { PrismaClient } from "@prisma/client";
import type { Review } from "~/app/page";

const pageSize = 10;

export const GET = async (req: Request) => {
  const page = Number(new URL(req.url).searchParams.get("page")) ?? 1;

  const prisma = new PrismaClient();

  const data: Review[] = await prisma.review.findMany({
    take: pageSize,
    skip: page * pageSize - pageSize,
  });

  const total = await prisma.review.count();

  return Response.json({ data, pages: Math.ceil(total / pageSize) });
};

export interface BodyData {
  title: string;
  content: string;
  author: string;
  rating: number;
}

export const POST = async (req: Request) => {
  const body = (await req.json()) as BodyData;

  if (body) {
    const prisma = new PrismaClient();

    const review = await prisma.review.create({
      data: {
        ...body,
        createdAt: new Date().toLocaleDateString(),
      },
    });

    return Response.json({ data: review });
  }

  return Response.error();
};
