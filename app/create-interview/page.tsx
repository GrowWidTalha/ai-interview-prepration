"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Briefcase, MessageSquare, Languages, Upload } from "lucide-react"
import { createInterviewAction } from "@/actions"
import { toast } from "sonner"

// Define the form schema
const formSchema = z.object({
    type: z.enum(["job", "sales", "english"]),
    subType: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    projectDetails: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    questionCount: z.number().min(3).max(20),
    difficulty: z.enum(["easy", "medium", "hard"]),
})

export default function CreateInterview() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [interviewType, setInterviewType] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "job",
            questionCount: 5,
            difficulty: "medium",
        },
    })

    // Watch form values
    const watchType = form.watch("type")

    // Handle form submission
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)

        try {
            // Convert form values to FormData
            const formData = new FormData()

            // Add all form values to FormData
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach((item) => formData.append(key, item))
                    } else {
                        formData.append(key, value.toString())
                    }
                }
            })

            // Call server action
              const result = await createInterviewAction(formData)

            if (result.success) {
                toast.success("Interview created", {
                    description: "Your interview has been created successfully.",
                })
                router.push(`/interview?id=${result.interviewId}`)
            } else {
                toast.error("Error", {
                    description: result.error || "Failed to create interview",
                })
            }
        } catch (error) {
            console.error("Error creating interview:", error)
            toast.error("Error", {
                description: "Something went wrong. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle next step
    const handleNext = async () => {
        if (step === 1) {
            setStep(2)
        } else if (step === 2) {
            form.handleSubmit(onSubmit)()
        }
    }

    // Handle previous step
    const handlePrevious = () => {
        if (step === 2) {
            setStep(1)
        }
    }

    // Handle interview type selection
    const handleTypeSelect = (type: string) => {
        form.setValue("type", type as "job" | "sales" | "english")
        setInterviewType(type)
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Your Interview</CardTitle>
                    <CardDescription>Customize your interview experience to match your needs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="text-lg font-medium">Step 1: Choose Interview Type</div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card
                                            className={`cursor-pointer hover:border-primary transition-colors ${watchType === "job" ? "border-2 border-primary" : ""
                                                }`}
                                            onClick={() => handleTypeSelect("job")}
                                        >
                                            <CardContent className="p-6 flex flex-col items-center text-center">
                                                <Briefcase className="h-10 w-10 mb-4 text-primary" />
                                                <h3 className="font-medium text-lg mb-2">Job Interview</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Practice for technical or behavioral job interviews
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            className={`cursor-pointer hover:border-primary transition-colors ${watchType === "sales" ? "border-2 border-primary" : ""
                                                }`}
                                            onClick={() => handleTypeSelect("sales")}
                                        >
                                            <CardContent className="p-6 flex flex-col items-center text-center">
                                                <MessageSquare className="h-10 w-10 mb-4 text-primary" />
                                                <h3 className="font-medium text-lg mb-2">Sales Call</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Practice pitching and closing deals as a freelancer
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            className={`cursor-pointer hover:border-primary transition-colors ${watchType === "english" ? "border-2 border-primary" : ""
                                                }`}
                                            onClick={() => handleTypeSelect("english")}
                                        >
                                            <CardContent className="p-6 flex flex-col items-center text-center">
                                                <Languages className="h-10 w-10 mb-4 text-primary" />
                                                <h3 className="font-medium text-lg mb-2">English Practice</h3>
                                                <p className="text-sm text-muted-foreground">Improve your English speaking skills</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {watchType === "job" && (
                                        <div className="space-y-4 mt-6">
                                            <FormField
                                                control={form.control}
                                                name="subType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Interview Focus</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select interview focus" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="technical">Technical</SelectItem>
                                                                <SelectItem value="behavioral">Behavioral</SelectItem>
                                                                <SelectItem value="mixed">Mixed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>Choose what type of questions you want to focus on</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {form.watch("subType") === "technical" && (
                                                <FormField
                                                    control={form.control}
                                                    name="technologies"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Technologies</FormLabel>
                                                            <Select onValueChange={(value) => field.onChange([value])}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select primary technology" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="react">React</SelectItem>
                                                                    <SelectItem value="nextjs">Next.js</SelectItem>
                                                                    <SelectItem value="node">Node.js</SelectItem>
                                                                    <SelectItem value="python">Python</SelectItem>
                                                                    <SelectItem value="java">Java</SelectItem>
                                                                    <SelectItem value="csharp">C#</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription>
                                                                Select the main technology you want to be interviewed on
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {watchType === "sales" && (
                                        <div className="space-y-4 mt-6">
                                            <FormField
                                                control={form.control}
                                                name="projectDetails"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Project Details</FormLabel>
                                                        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground mb-1">
                                                                Upload your project details or job description
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">PDF format, max 5MB</p>
                                                            <Input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".pdf"
                                                                onChange={(e) => {
                                                                    // In a real app, you would handle file upload here
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        field.onChange(URL.createObjectURL(e.target.files[0]))
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <FormDescription>
                                                            This helps our AI understand your project to simulate a realistic sales call
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {watchType === "english" && (
                                        <div className="space-y-4 mt-6">
                                            <FormField
                                                control={form.control}
                                                name="level"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>English Level</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select your English level" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                                <SelectItem value="advanced">Advanced</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription>Choose your current English proficiency level</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="text-lg font-medium">Step 2: Interview Settings</div>

                                    <FormField
                                        control={form.control}
                                        name="questionCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Questions: {field.value}</FormLabel>
                                                <FormControl>
                                                    <Slider
                                                        min={3}
                                                        max={20}
                                                        step={1}
                                                        value={[field.value]}
                                                        onValueChange={(value) => field.onChange(value[0])}
                                                        className="py-4"
                                                    />
                                                </FormControl>
                                                <FormDescription>Choose how many questions you want in your interview</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="difficulty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Difficulty Level</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select difficulty" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="easy">Easy</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="hard">Hard</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Choose how challenging you want the interview to be</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 ? (
                        <Button variant="outline" onClick={handlePrevious}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : (
                        <div></div>
                    )}
                    <Button onClick={handleNext} disabled={(!interviewType && step === 1) || isSubmitting}>
                        {isSubmitting ? (
                            "Processing..."
                        ) : (
                            <>
                                {step === 2 ? "Start Interview" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
