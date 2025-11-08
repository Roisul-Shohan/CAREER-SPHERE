"use server";

import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) throw new Error("User not found");

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, generate insights (prefer AI) and create it
        if (!industryInsight) {
          let insights = null;
          try {
            insights = await generateAIInsights(data.industry);
          } catch (aiError) {
            console.warn("AI insights generation failed during onboarding, falling back to defaults:", aiError.message);
          }

          // Use tx to create within the same transaction
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              salaryRanges: insights?.salaryRanges || [],
              growthRate: insights?.growthRate ?? 5.0,
              demandLevel: insights?.demandLevel || "Medium",
              topSkills: insights?.topSkills || ["Communication", "Problem Solving"],
              marketOutlook: insights?.marketOutlook || "Neutral",
              keyTrends: insights?.keyTrends || ["Digital Transformation", "Remote Work"],
              recommendedSkills: insights?.recommendedSkills || ["Communication", "Problem Solving"],
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    return result.user;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
