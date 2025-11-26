import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "./prisma";

export const checkUser = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // User exists in session but not in database - this shouldn't happen
    // with proper auth flow, but return null for safety
    return null;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
