"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Save, CheckCircle, Upload, Camera } from "lucide-react";
import { getCurrentUser, updateUser } from "@/actions/user";
import useFetch from "@/hooks/use-fetch";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  industry: z.string().optional(),
  subIndustry: z.string().optional(),
  bio: z.string().optional(),
  experience: z.number().min(0).max(50).optional(),
  skills: z.string().optional(),
  currentJob: z.string().optional(),
  profilePicture: z.string().optional(),
});

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const {
    loading: loadingProfile,
    fn: getProfileFn,
    data: profileData,
  } = useFetch(getCurrentUser);

  const {
    loading: updatingProfile,
    fn: updateProfileFn,
    data: updateResult,
  } = useFetch(updateUser);

  useEffect(() => {
    getProfileFn();
  }, []);

  useEffect(() => {
    if (profileData) {
      setUserData(profileData);
      reset({
        name: profileData.name || "",
        email: profileData.email || "",
        industry: profileData.industry || "",
        subIndustry: profileData.subIndustry || "",
        bio: profileData.bio || "",
        experience: profileData.experience || 0,
        skills: profileData.skills?.join(", ") || "",
        currentJob: profileData.currentJob || "",
        profilePicture: profileData.profilePicture || "",
      });
    }
  }, [profileData, reset]);

  useEffect(() => {
    if (updateResult) {
      console.log("Update result received:", updateResult);
      setUserData(updateResult);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    }
  }, [updateResult]);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      await updateProfileFn(formattedData);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      setValue("profilePicture", result.imageUrl);
      setUserData(prev => ({ ...prev, profilePicture: result.imageUrl }));
      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    }
  };

  const calculateProfileCompletion = () => {
    if (!userData) return 0;
    const fields = ['name', 'email', 'industry', 'subIndustry', 'bio', 'experience', 'skills', 'currentJob', 'profilePicture'];
    const completedFields = fields.filter(field => {
      const value = userData[field];
      return value !== null && value !== undefined && value !== "" &&
             (Array.isArray(value) ? value.length > 0 : true);
    });
    return (completedFields.length / fields.length) * 100;
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Failed to load profile data</p>
      </div>
    );
  }

  const completionPercentage = calculateProfileCompletion();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-title flex items-center gap-2">
          <User className="h-8 w-8" />
          My Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and career details
        </p>
      </div>

      {/* Profile Completion */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={!isEditing}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={!isEditing}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentJob">Current Job</Label>
                <Input
                  id="currentJob"
                  {...register("currentJob")}
                  disabled={!isEditing}
                  placeholder="e.g., Software Engineer at Google"
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture (max 5MB, JPEG/PNG/GIF only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="profilePicture" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        <Upload className="w-4 h-4" />
                        <span className="text-gray-700">Upload Image</span>
                      </div>
                    </Label>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max 5MB, JPEG/PNG/GIF only
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Career Information */}
          <Card>
            <CardHeader>
              <CardTitle>Career Information</CardTitle>
              <CardDescription>
                Your industry, experience, and professional background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  {...register("industry")}
                  disabled={!isEditing}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Input
                  id="subIndustry"
                  {...register("subIndustry")}
                  disabled={!isEditing}
                  placeholder="e.g., Software Development, Nursing, Investment Banking"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  {...register("experience", { valueAsNumber: true })}
                  disabled={!isEditing}
                />
                {errors.experience && (
                  <p className="text-sm text-red-500">{errors.experience.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Background */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Professional Background</CardTitle>
              <CardDescription>
                Your bio and key skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  disabled={!isEditing}
                  placeholder="Tell us about your professional background..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  {...register("skills")}
                  disabled={!isEditing}
                  placeholder="List your key skills (comma-separated)"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Separate skills with commas (e.g., JavaScript, React, Node.js)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          {!isEditing ? (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatingProfile}>
                {updatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}