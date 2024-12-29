import { PrismaClient } from "@prisma/client";
import type { Review } from "~/app/page";
import { schema } from "~/components/ReviewForm";

const pageSize = 10;

export const GET = async (req: Request) => {
  const page = Number(new URL(req.url).searchParams.get("page")) ?? 1;
  const search = new URL(req.url).searchParams.get("search");
  const author = new URL(req.url).searchParams.get("author");
  const rating = new URL(req.url).searchParams.get("rating");

  const prisma = new PrismaClient();

  const where = {
    ...(search
      ? {
          title: {
            contains: search,
          },
        }
      : {}),
    ...(author
      ? {
          author,
        }
      : {}),
    ...(rating
      ? {
          rating: Number(rating),
        }
      : {}),
  };

  const data: Review[] = await prisma.review.findMany({
    take: pageSize,
    skip: page * pageSize - pageSize,
    where,
  });

  const total = await prisma.review.count({ where });

  const uniqueAuthors = (
    await prisma.review.findMany({
      select: {
        author: true,
      },
      distinct: ["author"],
    })
  ).map((el) => el.author);

  return Response.json({
    data,
    pages: Math.ceil(total / pageSize),
    uniqueAuthors,
  });
};

export interface BodyData {
  title: string;
  content: string;
  author: string;
  rating: number;
}

export const POST = async (req: Request) => {
  const body = (await req.json()) as BodyData;

  try {
    if (!schema.parse(body)) {
      return new Response("Invalid body", { status: 400 });
    } else {
      const prisma = new PrismaClient();

      const review = await prisma.review.create({
        data: {
          ...body,
          createdAt: new Date().toLocaleDateString(),
        },
      });

      return Response.json({ data: review });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return new Response("Invalid body", { status: 400 });
  }
};
