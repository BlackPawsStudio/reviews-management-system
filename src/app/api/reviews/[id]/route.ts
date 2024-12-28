import { PrismaClient } from "@prisma/client";
import type { Review } from "~/app/page";

export const GET = async (req: Request) => {
  const id = req.url.split("/").pop();

  const prisma = new PrismaClient();

  if (Number.isNaN(Number(id))) {
    return new Response("Wrong id format", { status: 400 });
  }

  const data: Review | null = await prisma.review.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (data) {
    return Response.json({ data });
  } else {
    return new Response("Review not found", { status: 404 });
  }
};

interface BodyData {
  title: string;
  content: string;
  author: string;
  rating: number;
}

export const PUT = async (req: Request) => {
  const id = req.url.split("/").pop();
  const body = (await req.json()) as BodyData;

  if (Number.isNaN(Number(id))) {
    return new Response("Wrong id format", { status: 400 });
  }

  if (!body) {
    return new Response("Invalid body", { status: 400 });
  }

  const prisma = new PrismaClient();

  const review = await prisma.review.update({
    where: {
      id: Number(id),
    },
    data: body,
  });

  return Response.json({ data: review });
};

export const DELETE = async (req: Request) => {
  const id = req.url.split("/").pop();

  if (Number.isNaN(Number(id))) {
    return new Response("Wrong id format", { status: 400 });
  }

  const prisma = new PrismaClient();

  await prisma.review.delete({
    where: {
      id: Number(id),
    },
  });

  return new Response("Review deleted", { status: 200 });
};
