"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Target,
  Calendar,
  ArrowLeft,
  Camera,
  Edit3,
  Save,
  Crown,
  Trophy,
  Activity,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    age: "28",
    height: "5'10\"",
    weight: "165 lbs",
    fitnessLevel: "intermediate",
    goals: "Build muscle and improve endurance",
    bio: "Passionate about fitness and healthy living. Love trying new workouts and challenging myself!",
  })

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    mealReminders: true,
    progressUpdates: true,
    communityActivity: false,
    weeklyReports: true,
    achievements: true,
  })

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Save profile logic would go here
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-[#e3372e]/20 text-[#e3372e] border border-[#e3372e]/30 hover:border-[#e3372e]/50 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative logo-container">
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="Top Coach"
                  width={36}
                  height={36}
                  className="rounded-xl border-2 border-[#e3372e]/30 logo-header shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#e3372e] rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#e3372e] to-white bg-clip-text text-transparent">
                Profile & Settings
              </h1>
            </div>
          </div>
          <Badge variant="secondary" className="bg-[#e3372e]/20 text-[#e3372e] border-[#e3372e]/30">
            <Crown className="h-3 w-3 mr-1" />
            Pro Member
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-border/20">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card/50 border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#e3372e]">Personal Information</CardTitle>
                    <CardDescription>Manage your profile details and preferences</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    className={`gap-2 ${isEditing ? "bg-[#e3372e] hover:bg-[#e3372e]/80 text-white" : "border-[#e3372e]/50 text-[#e3372e] hover:bg-[#e3372e]/10"}`}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Image
                      src="/user-avatar.png"
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-[#e3372e]/40 shadow-lg"
                    />
                    {isEditing && (
                      <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[#e3372e] hover:bg-[#e3372e]/80 text-white shadow-lg">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{profileData.name}</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        <Activity className="h-3 w-3 mr-1" />
                        {profileData.fitnessLevel}
                      </Badge>
                      <Badge variant="secondary" className="bg-accent/20">
                        <Trophy className="h-3 w-3 mr-1" />
                        15 Achievements
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background border-border/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background border-border/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background border-border/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={profileData.height}
                      onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background border-border/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={profileData.weight}
                      onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background border-border/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fitness-level">Fitness Level</Label>
                    <Select value={profileData.fitnessLevel} disabled={!isEditing}>
                      <SelectTrigger className="bg-background border-border/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    className="bg-background border-border/20 min-h-[100px]"
                    placeholder="Tell us about yourself and your fitness journey..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-card/50 border-border/20">
              <CardHeader>
                <CardTitle className="text-[#e3372e]">Fitness Goals</CardTitle>
                <CardDescription>Set and track your fitness objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-background/50 border-border/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Primary Goal</h3>
                      </div>
                      <Select defaultValue="muscle-gain">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                          <SelectItem value="endurance">Improve Endurance</SelectItem>
                          <SelectItem value="strength">Build Strength</SelectItem>
                          <SelectItem value="maintenance">Maintain Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Target Timeline</h3>
                      </div>
                      <Select defaultValue="6-months">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="6-months">6 Months</SelectItem>
                          <SelectItem value="1-year">1 Year</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Specific Targets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Target Weight</Label>
                      <Input placeholder="170 lbs" className="bg-background border-border/20" />
                    </div>
                    <div className="space-y-2">
                      <Label>Weekly Workouts</Label>
                      <Input placeholder="4-5 times" className="bg-background border-border/20" />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Steps</Label>
                      <Input placeholder="10,000 steps" className="bg-background border-border/20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card/50 border-border/20">
              <CardHeader>
                <CardTitle className="text-[#e3372e]">Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you'd like to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/20"
                  >
                    <div>
                      <h3 className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {key === "workoutReminders" && "Get reminded about your scheduled workouts"}
                        {key === "mealReminders" && "Receive notifications for meal times"}
                        {key === "progressUpdates" && "Weekly progress summaries and insights"}
                        {key === "communityActivity" && "Updates from your fitness community"}
                        {key === "weeklyReports" && "Comprehensive weekly fitness reports"}
                        {key === "achievements" && "Celebrate your fitness milestones"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [key]: checked }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-card/50 border-border/20">
              <CardHeader>
                <CardTitle className="text-[#e3372e]">Privacy & Security</CardTitle>
                <CardDescription>Manage your privacy settings and account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/20">
                    <div>
                      <h3 className="font-medium">Profile Visibility</h3>
                      <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                    </div>
                    <Select defaultValue="friends">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/20">
                    <div>
                      <h3 className="font-medium">Activity Sharing</h3>
                      <p className="text-sm text-muted-foreground">Share your workouts with the community</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/20">
                    <div>
                      <h3 className="font-medium">Data Analytics</h3>
                      <p className="text-sm text-muted-foreground">Allow anonymous data collection for insights</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <h3 className="font-medium mb-4">Account Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Download My Data
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-card/50 border-border/20">
              <CardHeader>
                <CardTitle className="text-[#e3372e]">Subscription & Billing</CardTitle>
                <CardDescription>Manage your Top Coach Pro subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg border border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Crown className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Top Coach Pro</h3>
                        <p className="text-muted-foreground">Premium AI fitness coaching</p>
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Active</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Next billing date</p>
                      <p className="font-medium">March 15, 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">$29.99/month</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Payment Method</h3>
                  <Card className="bg-background/50 border-border/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/26</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    View Billing History
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Update Payment Method
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive bg-transparent">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
