"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CreatePostForm from "./_components/create-post-form";
import PostList from "./_components/post-list";
import PostDetail from "./_components/post-detail";
import { getPost, getAllUsers } from "@/actions/community";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UserCard from "./_components/user-card";

export default function CommunityPage() {
  const { data: session } = useSession();
  const [selectedPost, setSelectedPost] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");

  const handlePostClick = async (post) => {
    try {
      const result = await getPost(post.id);
      if (result.success) {
        setSelectedPost(result.post);
      } else {
        toast.error(result.error || "Failed to load post");
      }
    } catch (error) {
      toast.error("An error occurred while loading the post");
    }
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers();
        if (result.success) {
          setUsers(result.users);
        } else {
          toast.error(result.error || "Failed to load users");
        }
      } catch (error) {
        toast.error("An error occurred while loading users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with fellow professionals, share insights, and grow together.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {selectedPost ? (
              <PostDetail
                post={selectedPost}
                userId={session?.user?.id}
                onBack={handleBackToList}
              />
            ) : (
              <>
                {session?.user && <CreatePostForm />}
                <PostList
                  onPostClick={handlePostClick}
                  userId={session?.user?.id}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}