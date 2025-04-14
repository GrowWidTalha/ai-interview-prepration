"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, User } from "lucide-react"
import { getCurrentUser, updateUserProfile } from "@/lib/db"
import { toast } from "sonner"

// Define the form schema
const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    bio: z
        .string()
        .max(500, {
            message: "Bio must not be longer than 500 characters.",
        })
        .optional(),
})

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Initialize the form
    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: "",
            email: "",
            bio: "",
        },
    })

    // Fetch user data
    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await getCurrentUser()

                if (!userData) {
                    toast.error("Failed to load user profile")
                    router.push("/dashboard")
                    return
                }

                setUser(userData)

                // Set form default values
                form.reset({
                    name: userData.name || "",
                    email: userData.email || "",
                    bio: userData.bio || "",
                })
            } catch (error) {
                console.error("Error fetching user:", error)
                toast.error("Failed to load user profile")
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [router, form])

    // Handle form submission
    async function onSubmit(values: z.infer<typeof profileFormSchema>) {
        setIsSaving(true)

        try {
            // Update user profile
            await updateUserProfile(values)

            toast.success("Profile updated", {
                description: "Your profile has been updated successfully.",
            })

            // Update local user state
            setUser((prev: any) => ({
                ...prev,
                ...values,
            }))
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Error", {
                description: "Failed to update profile",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 px-4 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading your profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-1">
                                <CardHeader>
                                    <CardTitle>Your Photo</CardTitle>
                                    <CardDescription>This is how others will recognize you.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center">
                                    <Avatar className="h-32 w-32 mb-4">
                                        <AvatarImage
                                            src={user?.imageUrl || "/placeholder.svg?height=128&width=128"}
                                            alt={user?.name || "User"}
                                        />
                                        <AvatarFallback>
                                            <User className="h-12 w-12" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline" className="w-full">
                                        Change Photo
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your name" {...field} />
                                                        </FormControl>
                                                        <FormDescription>This is your public display name.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your email" {...field} />
                                                        </FormControl>
                                                        <FormDescription>We'll never share your email with anyone else.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="bio"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bio</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Tell us a little about yourself"
                                                                className="resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>Brief description for your profile. Max 500 characters.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? (
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
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="account">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Settings</CardTitle>
                                <CardDescription>Manage your account settings and preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Connected Accounts</h3>
                                    <p className="text-sm text-muted-foreground">Manage your connected accounts and services.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Password</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Change your password or enable two-factor authentication.
                                    </p>
                                    <Button variant="outline">Change Password</Button>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Delete Account</h3>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and all your data.</p>
                                    <Button variant="destructive">Delete Account</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preferences">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                                <CardDescription>Manage your notification and display preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Notifications</h3>
                                    <p className="text-sm text-muted-foreground">Configure how you receive notifications.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Appearance</h3>
                                    <p className="text-sm text-muted-foreground">Customize the appearance of the application.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Language</h3>
                                    <p className="text-sm text-muted-foreground">Choose your preferred language.</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Preferences</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
