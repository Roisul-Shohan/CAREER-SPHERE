"use client";

import { format } from "date-fns";
import { Mail, Linkedin, Briefcase, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function UserCard({ user }) {
  if (!user) return null;

  const memberSince = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.profilePicture || user.imageUrl}
              alt={user.name || "User"}
            />
            <AvatarFallback className="text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {user.name || "Anonymous User"}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Member since {memberSince}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4" />
          <span className="truncate">{user.email}</span>
        </div>

        {user.linkedinId && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Linkedin className="h-4 w-4" />
            <a
              href={`https://linkedin.com/in/${user.linkedinId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate"
            >
              linkedin.com/in/{user.linkedinId}
            </a>
          </div>
        )}

        {user.currentJob && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Briefcase className="h-4 w-4" />
            <span className="truncate">{user.currentJob}</span>
          </div>
        )}

        {user.industry && (
          <div className="flex justify-center mt-4">
            <Badge variant="secondary" className="text-xs">
              {user.industry}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}