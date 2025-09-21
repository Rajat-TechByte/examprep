// src/services/question.service.ts
import { prisma } from "../prisma.js";
import type { CreateQuestionInput, UpdateQuestionInput } from "../validators/question.schema.js";

export async function createQuestionWithVersion(topicId: string, input: CreateQuestionInput) {
  return prisma.$transaction(async (tx) => {
    // 1) create Question + Options
    const question = await tx.question.create({
      data: {
        text: input.text,
        topicId,
        options: {
          create: input.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
          })),
        },
      },
      include: { options: true },
    });

    // 2) create QuestionVersion snapshot with versionNumber = 1
    const version = await tx.questionVersion.create({
      data: {
        questionId: question.id,
        versionNumber: 1,
        text: question.text,
        options: question.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      },
    });

    return { question, version };
  });
}

export async function updateQuestionWithVersion(questionId: string, input: UpdateQuestionInput) {
  return prisma.$transaction(async (tx) => {
    // ensure question exists
    const existing = await tx.question.findUnique({ where: { id: questionId }, include: { options: true } });
    if (!existing) throw new Error("Question not found");

    // 1) Update question text if provided
    let updatedQuestion = existing;
    if (input.text !== undefined) {
      updatedQuestion = await tx.question.update({
        where: { id: questionId },
        data: { text: input.text },
        include: { options: true },
      });
    }

    // 2) Replace options if provided (simple approach):
    //    delete existing options and recreate from payload OR update selectively
    if (input.options) {
      // delete existing options
      await tx.option.deleteMany({ where: { questionId } });

      // create new options
      const createdOptions = await Promise.all(
        input.options.map((opt) =>
          tx.option.create({
            data: {
              text: opt.text,
              isCorrect: opt.isCorrect ?? false,
              questionId,
            },
          })
        )
      );

      // refresh question with new options
      updatedQuestion = await tx.question.findUnique({ where: { id: questionId }, include: { options: true } }) as typeof existing;
    }

    // 3) Get last versionNumber and increment
    const lastVersion = await tx.questionVersion.findFirst({
      where: { questionId },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });
    const nextVersionNumber = (lastVersion?.versionNumber ?? 0) + 1;

    // 4) Create version snapshot (options is JSON array)
    const version = await tx.questionVersion.create({
      data: {
        questionId,
        versionNumber: nextVersionNumber,
        text: updatedQuestion.text,
        options: updatedQuestion.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      },
    });

    return { question: updatedQuestion, version };
  });
}
