import { PrismaClient } from "@prisma/client";
import type { Review } from "~/app/page";

export const GET = async () => {
  const prisma = new PrismaClient();

  const data: Review[] = await prisma.review.findMany();

  return Response.json({ data });
};

interface BodyData {
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
