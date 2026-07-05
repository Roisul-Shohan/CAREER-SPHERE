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
    // Generate AI insights outside the transaction to avoid timeouts
    let insights = null;
    const existingIndustry = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    if (!existingIndustry) {
      try {
        insights = await generateAIInsights(data.industry);
      } catch (aiError) {
        console.warn("AI insights generation failed during onboarding, falling back to defaults:", aiError.message);
      }
    }

    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists (in case it was created concurrently)
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with pre-generated insights
        if (!industryInsight) {
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
        let linkedinId = data.linkedinId?.trim();
        if (linkedinId) {
          linkedinId = linkedinId.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "");
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            name: data.name,
            email: data.email,
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
            linkedinId,
            currentJob: data.currentJob,
            profilePicture: data.profilePicture,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    console.log("User updated successfully:", result.updatedUser);
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw new Error("Failed to update profile");
  }
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) throw new Error("User not found");

  return user;
}

export async function getUserOnboardingStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { isOnboarded: false };
  }

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
    return { isOnboarded: false };
  }
}

export async function getUserAvatar() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { profilePicture: true }
  });

  return user?.profilePicture;
}
