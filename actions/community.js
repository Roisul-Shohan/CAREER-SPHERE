"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// Create a new post
export async function createPost(data) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message };
  }
}

// Delete a post (only by the creator)
export async function deletePost(postId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== session.user.id) {
      throw new Error("You can only delete your own posts");
    }

    // Delete related likes and comments first
    await prisma.like.deleteMany({
      where: { postId },
    });

    await prisma.like.deleteMany({
      where: {
        comment: {
          postId,
        },
      },
    });

    await prisma.comment.deleteMany({
      where: { postId },
    });

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: error.message };
  }
}

// Get all posts with pagination
export async function getPosts(page = 1, limit = 10, category = null) {
  try {
    const skip = (page - 1) * limit;

    const where = category ? { category } : {};

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPosts = await prisma.post.count({ where });

    return {
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { success: false, error: error.message };
  }
}

// Get a single post with comments
export async function getPost(id) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
            profilePicture: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
                profilePicture: true,
              },
            },
            likes: {
              include: {
                user: {
                  select: {
                    name: true,
                    imageUrl: true,
                    profilePicture: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, post };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { success: false, error: error.message };
  }
}

// Create a comment
export async function createComment(postId, content) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        postId,
        content,
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return { success: true, comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: error.message };
  }
}

// Like/unlike a post
export async function toggleLike(postId, commentId = null) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId: commentId ? null : postId,
        commentId,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { success: true, liked: false };
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: commentId ? null : postId,
          commentId,
        },
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, error: error.message };
  }
}

// Get user's like status for posts/comments
export async function getLikeStatus(userId, postIds = [], commentIds = []) {
  try {
    const likes = await prisma.like.findMany({
      where: {
        userId,
        OR: [
          { postId: { in: postIds } },
          { commentId: { in: commentIds } },
        ],
      },
      select: {
        postId: true,
        commentId: true,
      },
    });

    return {
      success: true,
      likes: likes.reduce((acc, like) => {
        if (like.postId) acc.posts[like.postId] = true;
        if (like.commentId) acc.comments[like.commentId] = true;
        return acc;
      }, { posts: {}, comments: {} }),
    };
  } catch (error) {
    console.error("Error fetching like status:", error);
    return { success: false, error: error.message };
  }
}

// Get all users
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        profilePicture: true,
        linkedinId: true,
        currentJob: true,
        industry: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message };
  }
}