"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, User, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getPosts, toggleLike, getLikeStatus, deletePost } from "@/actions/community";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Career Advice",
  "Job Search",
  "Interview Tips",
  "Resume Help",
  "Networking",
  "Industry Insights",
  "General Discussion",
];

export default function PostList({ onPostClick, userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likeStatuses, setLikeStatuses] = useState({ posts: {}, comments: {} });

  const fetchPosts = async (pageNum = 1, category = selectedCategory) => {
    try {
      const categoryFilter = category === "All" ? null : category;
      const result = await getPosts(pageNum, 10, categoryFilter);

      if (result.success) {
        if (pageNum === 1) {
          setPosts(result.posts);
        } else {
          setPosts(prev => [...prev, ...result.posts]);
        }
        setHasMore(result.posts.length === 10);
        setPage(pageNum);

        // Fetch like statuses if user is logged in
        if (userId) {
          const postIds = result.posts.map(post => post.id);
          const likeResult = await getLikeStatus(userId, postIds);
          if (likeResult.success) {
            setLikeStatuses(likeResult.likes);
          }
        }
      } else {
        toast.error(result.error || "Failed to load posts");
      }
    } catch (error) {
      toast.error("An error occurred while loading posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, selectedCategory);
  }, [selectedCategory, userId]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setLoading(true);
  };

  const handleLoadMore = () => {
    fetchPosts(page + 1);
  };

  const handleLike = async (postId, index) => {
    if (!userId) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const result = await toggleLike(postId);
      if (result.success) {
        setLikeStatuses(prev => ({
          ...prev,
          posts: {
            ...prev.posts,
            [postId]: result.liked
          }
        }));

        // Update the post's like count
        setPosts(prev => prev.map((post, i) =>
          i === index
            ? {
                ...post,
                _count: {
                  ...post._count,
                  likes: result.liked ? post._count.likes + 1 : post._count.likes - 1
                }
              }
            : post
        ));
      } else {
        toast.error(result.error || "Failed to like post");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (postId) => {
    try {
      const result = await deletePost(postId);
      if (result.success) {
        toast.success("Post deleted successfully");
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        toast.error(result.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the post");
    }
  };
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onPostClick(post)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.user.profilePicture || post.user.imageUrl} alt={post.user.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {post.user.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {/* Delete button - only visible to post creator */}
                    {userId && post.userId === userId && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this post? This action cannot be undone.
                              All comments and likes on this post will also be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(post.id);
                              }}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {post.category && (
                    <Badge variant="secondary" className="mb-3">
                      {post.category}
                    </Badge>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id, index);
                      }}
                      className={`flex items-center space-x-1 ${
                        likeStatuses.posts[post.id] ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-gray-600"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likeStatuses.posts[post.id] ? "fill-current" : ""}`} />
                      <span>{post._count.likes}</span>
                    </Button>

                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post._count.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCategory === "All"
                ? "Be the first to start a discussion in the community!"
                : `No posts in the ${selectedCategory} category yet.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && posts.length > 0 && (
        <div className="text-center">
          <Button onClick={handleLoadMore} variant="outline">
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
}