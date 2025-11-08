"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use Gemini 2.5 Flash for more reliable JSON outputs and lower latency
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateQuiz() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${user.industry
    } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("Raw AI response:", text); // Debug log

    // Remove common code fences and surrounding whitespace
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    console.log("Cleaned text:", cleanedText); // Debug log

    // Try to parse JSON directly, if it fails attempt to extract the first JSON object block
    let quiz;
    try {
      quiz = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn("Initial JSON.parse failed, attempting to extract JSON block:", parseError.message);
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          quiz = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error("Failed to parse extracted JSON block:", innerErr.message);
          throw new Error("AI returned invalid JSON for quiz generation");
        }
      } else {
        console.error("No JSON object found in AI response");
        throw new Error("AI returned non-JSON response for quiz generation");
      }
    }

    if (!quiz || !Array.isArray(quiz.questions)) {
      console.error("Parsed quiz JSON does not contain questions array:", quiz);
      throw new Error("AI returned JSON without questions array");
    }

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    console.error("Error details:", error.message);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) throw new Error("User not found");

  // Ensure questions and answers are plain objects
  const plainQuestions = JSON.parse(JSON.stringify(questions));
  const plainAnswers = JSON.parse(JSON.stringify(answers));

  const questionResults = plainQuestions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: plainAnswers[index],
    isCorrect: q.correctAnswer === plainAnswers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    // Convert Prisma object to plain object to avoid serialization issues
    return JSON.parse(JSON.stringify(assessment));
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Convert Prisma objects to plain objects to avoid serialization issues
    return JSON.parse(JSON.stringify(assessments));
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
