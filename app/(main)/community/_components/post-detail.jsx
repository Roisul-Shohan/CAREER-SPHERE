"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send, User, ArrowLeft, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toggleLike, createComment, deletePost } from "@/actions/community";
import { toast } from "sonner";

export default function PostDetail({ post, userId, onBack }) {
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [isLiking, setIsLiking] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(post._count?.likes || 0);
  const [isPostLiked, setIsPostLiked] = useState(post.likes?.some(like => like.userId === userId) || false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (result.success) {
        toast.success("Post deleted successfully");
        onBack();
      } else {
        toast.error(result.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostLike = async () => {
    if (!userId) {
      toast.error("Please sign in to like posts");
      return;
    }

    setIsLiking(true);
    try {
      const result = await toggleLike(post.id);
      if (result.success) {
        setIsPostLiked(result.liked);
        setPostLikeCount(prev => result.liked ? prev + 1 : prev - 1);
      } else {
        toast.error(result.error || "Failed to like post");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!userId) {
      toast.error("Please sign in to comment");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const result = await createComment(post.id, comment.trim());
      if (result.success) {
        setComments(prev => [...prev, result.comment]);
        setComment("");
        toast.success("Comment added!");
      } else {
        toast.error(result.error || "Failed to add comment");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const CommentItem = ({ comment }) => {
    const [isLikingComment, setIsLikingComment] = useState(false);
    const [commentLikeCount, setCommentLikeCount] = useState(comment._count?.likes || 0);
    const [isCommentLiked, setIsCommentLiked] = useState(comment.likes?.some(like => like.userId === userId) || false);
    const [showCommentLikers, setShowCommentLikers] = useState(false);

    const handleCommentLike = async () => {
      if (!userId) {
        toast.error("Please sign in to like comments");
        return;
      }

      setIsLikingComment(true);
      try {
        const result = await toggleLike(null, comment.id);
        if (result.success) {
          setIsCommentLiked(result.liked);
          setCommentLikeCount(prev => result.liked ? prev + 1 : prev - 1);
        } else {
          toast.error(result.error || "Failed to like comment");
        }
      } catch (error) {
        toast.error("An error occurred");
      } finally {
        setIsLikingComment(false);
      }
    };

    return (
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.profilePicture || comment.user.imageUrl} alt={comment.user.name} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{comment.user.name}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-2 ml-3">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentLike}
                disabled={isLikingComment}
                className={`h-6 px-2 text-xs ${
                  isCommentLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-gray-600"
                }`}
              >
                <Heart className={`h-3 w-3 mr-1 ${isCommentLiked ? "fill-current" : ""}`} />
                {commentLikeCount}
              </Button>
              {comment.likes && comment.likes.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700">
                      <Users className="h-3 w-3 mr-1" />
                      Liked by {comment.likes.length}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>People who liked this comment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {comment.likes.map((like) => (
                        <div key={like.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={like.user.profilePicture || like.user.imageUrl} alt={like.user.name} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{like.user.name}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Community</span>
        </Button>

        {/* Delete button - only visible to post creator */}
        {userId && post.userId === userId && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Post"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
                  onClick={handleDeletePost}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.user.profilePicture || post.user.imageUrl} alt={post.user.name} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {post.user.name}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {post.title}
            </h1>

            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
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
                onClick={handlePostLike}
                disabled={isLiking}
                className={`flex items-center space-x-1 ${
                  isPostLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-gray-600"
                }`}
              >
                <Heart className={`h-4 w-4 ${isPostLiked ? "fill-current" : ""}`} />
                <span>{postLikeCount}</span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                    <Users className="h-4 w-4" />
                    <span>Liked by {post.likes.length}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>People who liked this post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {post.likes.length > 0 ? (
                      post.likes.map((like) => (
                        <div key={like.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={like.user.profilePicture || like.user.imageUrl} alt={like.user.name} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{like.user.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No one has liked this post yet.
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span>{comments?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

        {/* Add Comment Form */}
        {userId ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="mb-2"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!comment.trim() || isSubmittingComment}
                    size="sm"
                  >
                    {isSubmittingComment ? (
                      "Posting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 mb-6">
            Please sign in to comment on this post.
          </div>
        )}

        <Separator className="mb-4" />

        {/* Comments List */}
        <div className="space-y-4">
          {(comments?.length || 0) > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}