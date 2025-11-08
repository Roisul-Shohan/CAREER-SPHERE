"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateAIInsights = async (industry) => {
  if (!industry) throw new Error("Industry is required to generate insights");

  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("Raw AI response for industry insights:", text);

    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    console.log("Cleaned AI response:", cleanedText);

    // Parse JSON robustly (direct parse, fallback to first JSON object)
    let insights;
    try {
      insights = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.warn("Initial JSON.parse failed for industry insights, attempting to extract JSON block:", parseErr.message);
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          insights = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error("Failed to parse extracted JSON block for industry insights:", innerErr.message);
          throw new Error("AI returned invalid JSON for industry insights");
        }
      } else {
        console.error("No JSON object found in AI response for industry insights");
        throw new Error("AI returned non-JSON response for industry insights");
      }
    }

    // Normalize and validate fields to match Prisma schema
    const salaryRangesRaw = Array.isArray(insights.salaryRanges) ? insights.salaryRanges : [];
    const salaryRanges = salaryRangesRaw.map((sr) => ({
      role: sr.role || sr.title || "Unknown",
      min: typeof sr.min === "number" ? sr.min : parseFloat(String(sr.min || 0)) || 0,
      max: typeof sr.max === "number" ? sr.max : parseFloat(String(sr.max || 0)) || 0,
      median: typeof sr.median === "number" ? sr.median : parseFloat(String(sr.median || 0)) || 0,
      location: sr.location || sr.locationName || "",
    }));

    let growthRate = null;
    if (typeof insights.growthRate === "string") {
      const m = insights.growthRate.match(/[\d\.]+/);
      growthRate = m ? parseFloat(m[0]) : null;
    } else if (typeof insights.growthRate === "number") {
      growthRate = insights.growthRate;
    }

    const demandLevel = insights.demandLevel || "Medium";
    const topSkills = Array.isArray(insights.topSkills)
      ? insights.topSkills.map(String)
      : typeof insights.topSkills === "string"
        ? insights.topSkills.split(/,\s*/).map(String)
        : [];

    const marketOutlook = insights.marketOutlook || "Neutral";

    const keyTrends = Array.isArray(insights.keyTrends)
      ? insights.keyTrends.map(String)
      : typeof insights.keyTrends === "string"
        ? insights.keyTrends.split(/,\s*/).map(String)
        : [];

    const recommendedSkills = Array.isArray(insights.recommendedSkills)
      ? insights.recommendedSkills.map(String)
      : typeof insights.recommendedSkills === "string"
        ? insights.recommendedSkills.split(/,\s*/).map(String)
        : [];

    return {
      salaryRanges,
      growthRate: growthRate ?? 0,
      demandLevel,
      topSkills,
      marketOutlook,
      keyTrends,
      recommendedSkills,
    };
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw new Error("Failed to generate industry insights");
  }
};

export async function getIndustryInsights() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  // If insights exist but look like placeholders or are stale, refresh them
  try {
    const now = new Date();
    const nextUpdate = user.industryInsight.nextUpdate ? new Date(user.industryInsight.nextUpdate) : new Date(0);

    const salaryRanges = Array.isArray(user.industryInsight.salaryRanges) ? user.industryInsight.salaryRanges : [];

    const needsRefresh =
      salaryRanges.length === 0 ||
      nextUpdate <= now;

    if (needsRefresh) {
      try {
        const fresh = await generateAIInsights(user.industry);
        const updated = await db.industryInsight.update({
          where: { industry: user.industry },
          data: {
            ...fresh,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
        return updated;
      } catch (refreshErr) {
        console.warn("Failed to refresh industry insights:", refreshErr.message);
        // fallthrough to return existing insight
      }
    }
  } catch (err) {
    console.warn("Error checking industry insight freshness:", err.message);
  }

  return user.industryInsight;
}
