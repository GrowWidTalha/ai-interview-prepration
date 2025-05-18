"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Briefcase, MessageSquare, Languages, Check, X, Loader2 } from "lucide-react"
import { createInterviewAction } from "@/actions"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { FileUpload } from "@/components/file-upload"

// Define the form schema
const formSchema = z.object({
    type: z.enum(["job", "sales", "english"]),
    subType: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    jobDescription: z.string().optional(),
    projectDetails: z.string().optional(),
    pdfUrl: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    questionCount: z.number().min(3).max(20),
    difficulty: z.enum(["easy", "medium", "hard"]),
})

// Technology options
const technologyOptions = [
    { id: "react", label: "React" },
    { id: "nextjs", label: "Next.js" },
    { id: "node", label: "Node.js" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "csharp", label: "C#" },
    { id: "typescript", label: "TypeScript" },
    { id: "angular", label: "Angular" },
    { id: "vue", label: "Vue.js" },
    { id: "php", label: "PHP" },
    { id: "ruby", label: "Ruby" },
    { id: "go", label: "Go" },
    { id: "aws", label: "AWS" },
    { id: "azure", label: "Azure" },
    { id: "docker", label: "Docker" },
    { id: "kubernetes", label: "Kubernetes" },
]

export default function CreateInterview() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [interviewType, setInterviewType] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])

    // Initialize the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "job",
            questionCount: 5,
            difficulty: "medium",
            technologies: [],
            pdfUrl: "",
        },
    })

    // Watch form values
    const watchType = form.watch("type")
    const watchSubType = form.watch("subType")
    const watchPdfUrl = form.watch("pdfUrl")

    // Update form when technologies change
    useEffect(() => {
        const initialTechnologies = form.getValues("technologies") || []
        if (initialTechnologies.length > 0) {
            setSelectedTechnologies(initialTechnologies)
        }
    }, [])

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
            const isValid = await form.trigger([
                "type",
                "subType",
                "technologies",
                "jobDescription",
                "projectDetails",
                "pdfUrl",
                "level",
            ])
            if (isValid) {
                setStep(2)
            }
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

        // Reset related fields when changing type
        if (type === "job") {
            form.setValue("level", undefined)
        } else if (type === "sales") {
            form.setValue("subType", undefined)
            form.setValue("technologies", [])
            setSelectedTechnologies([])
        } else if (type === "english") {
            form.setValue("subType", undefined)
            form.setValue("technologies", [])
            setSelectedTechnologies([])
        }
    }

    // Handle technology selection
    const handleTechnologyToggle = (tech: string) => {
        const newTechnologies = selectedTechnologies.includes(tech)
            ? selectedTechnologies.filter((t) => t !== tech)
            : [...selectedTechnologies, tech]

        setSelectedTechnologies(newTechnologies)
        form.setValue("technologies", newTechnologies, { shouldValidate: true })
    }

    // Remove a technology badge
    const removeTechnology = (tech: string) => {
        const newTechnologies = selectedTechnologies.filter((t) => t !== tech)
        setSelectedTechnologies(newTechnologies)
        form.setValue("technologies", newTechnologies, { shouldValidate: true })
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="max-w-4xl mx-auto shadow-lg border-2">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-2xl">Create Your Interview</CardTitle>
                    <CardDescription>Customize your interview experience to match your needs.</CardDescription>

                    {/* Progress indicator */}
                    <div className="mt-6 flex items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                                    <div
                                        style={{ width: step === 1 ? "50%" : "100%" }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                    <span className={step >= 1 ? "text-primary font-medium" : ""}>Interview Type</span>
                                    <span className={step >= 2 ? "text-primary font-medium" : ""}>Settings</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="text-lg font-medium">Step 1: Choose Interview Type</div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Card
                                                className={`cursor-pointer hover:shadow-md transition-all ${watchType === "job"
                                                        ? "border-2 border-primary ring-2 ring-primary/20"
                                                        : "hover:border-primary/50"
                                                    }`}
                                                onClick={() => handleTypeSelect("job")}
                                            >
                                                <CardContent className="p-6 flex flex-col items-center text-center">
                                                    <div
                                                        className={`rounded-full p-3 mb-4 ${watchType === "job" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                                                    >
                                                        <Briefcase className="h-10 w-10" />
                                                    </div>
                                                    <h3 className="font-medium text-lg mb-2">Job Interview</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Practice for technical or behavioral job interviews
                                                    </p>
                                                    {watchType === "job" && (
                                                        <div className="absolute top-2 right-2">
                                                            <Check className="h-5 w-5 text-primary" />
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Card
                                                className={`cursor-pointer hover:shadow-md transition-all ${watchType === "sales"
                                                        ? "border-2 border-primary ring-2 ring-primary/20"
                                                        : "hover:border-primary/50"
                                                    }`}
                                                // onClick={() => handleTypeSelect("sales")}
                                            >
                                                <CardContent className="p-6 flex flex-col items-center text-center">
                                                    <div
                                                        className={`rounded-full p-3 mb-4 ${watchType === "sales" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                                                    >
                                                        <MessageSquare className="h-10 w-10" />
                                                    </div>
                                                    <h3 className="font-medium text-lg mb-2">Sales Call</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Practice pitching and closing deals as a freelancer
                                                        <br />
                                                        Coming Soon
                                                    </p>
                                                    {watchType === "sales" && (
                                                        <div className="absolute top-2 right-2">
                                                            <Check className="h-5 w-5 text-primary" />
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Card
                                                className={`cursor-pointer hover:shadow-md transition-all ${watchType === "english"
                                                        ? "border-2 border-primary ring-2 ring-primary/20"
                                                        : "hover:border-primary/50"
                                                    }`}
                                                // onClick={() => handleTypeSelect("english")}
                                            >
                                                <CardContent className="p-6 flex flex-col items-center text-center">
                                                    <div
                                                        className={`rounded-full p-3 mb-4 ${watchType === "english" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                                                    >
                                                        <Languages className="h-10 w-10" />
                                                    </div>
                                                    <h3 className="font-medium text-lg mb-2">English Practice</h3>
                                                    <p className="text-sm text-muted-foreground">Improve your English speaking skills <br /> Coming Soon</p>
                                                    {watchType === "english" && (
                                                        <div className="absolute top-2 right-2">
                                                            <Check className="h-5 w-5 text-primary" />
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </div>

                                    {watchType === "job" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6 mt-6 bg-muted/20 p-6 rounded-lg border"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="subType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Interview Focus</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
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

                                            {watchSubType === "technical" && (
                                                <FormField
                                                    control={form.control}
                                                    name="technologies"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Technologies</FormLabel>
                                                            <FormDescription className="mb-3">
                                                                Select the technologies you want to be interviewed on
                                                            </FormDescription>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                                                {technologyOptions.map((tech) => (
                                                                    <div
                                                                        key={tech.id}
                                                                        className={`
                                      flex items-center space-x-2 border rounded-md p-2 cursor-pointer transition-colors
                                      ${selectedTechnologies.includes(tech.id)
                                                                                ? "bg-primary/10 border-primary"
                                                                                : "hover:bg-muted"
                                                                            }
                                    `}
                                                                        onClick={() => handleTechnologyToggle(tech.id)}
                                                                    >
                                                                        <Checkbox
                                                                            checked={selectedTechnologies.includes(tech.id)}
                                                                            onCheckedChange={() => handleTechnologyToggle(tech.id)}
                                                                            id={`tech-${tech.id}`}
                                                                        />
                                                                        <label
                                                                            htmlFor={`tech-${tech.id}`}
                                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                                        >
                                                                            {tech.label}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {selectedTechnologies.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {selectedTechnologies.map((tech) => (
                                                                        <Badge key={tech} variant="secondary" className="px-3 py-1">
                                                                            {technologyOptions.find((t) => t.id === tech)?.label}
                                                                            <X
                                                                                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    removeTechnology(tech)
                                                                                }}
                                                                            />
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            <FormField
                                                control={form.control}
                                                name="jobDescription"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Job Description (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Paste the job description here to make the interview more relevant"
                                                                className="resize-none min-h-[120px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Adding a job description helps our AI tailor questions to the specific role
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* PDF Upload Field */}
                                            <FormField
                                                control={form.control}
                                                name="pdfUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Upload Resume/CV (Optional)</FormLabel>
                                                        <FormControl>
                                                            {/* @ts-ignore */}
                                                            <FileUpload endpoint="pdfUploader" value={field.value} onChange={field.onChange} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Upload your resume to get more personalized interview questions
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </motion.div>
                                    )}

                                    {watchType === "sales" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4 mt-6 bg-muted/20 p-6 rounded-lg border"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="pdfUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Project Details PDF</FormLabel>
                                                        <FormControl>
                                                            {/* @ts-ignore */}
                                                            <FileUpload endpoint="pdfUploader" value={field.value} onChange={field.onChange} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            This helps our AI understand your project to simulate a realistic sales call
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="projectDetails"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Project Description (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe your project or service that you want to practice selling"
                                                                className="resize-none min-h-[120px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Adding details about your project helps create a more realistic sales scenario
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </motion.div>
                                    )}

                                    {watchType === "english" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4 mt-6 bg-muted/20 p-6 rounded-lg border"
                                        >
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
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="text-lg font-medium">Step 2: Interview Settings</div>

                                    <Card className="border bg-muted/20">
                                        <CardContent className="pt-6 space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="questionCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <FormLabel>Number of Questions</FormLabel>
                                                            <span className="text-lg font-medium">{field.value}</span>
                                                        </div>
                                                        <FormControl>
                                                            <div className="pt-4">
                                                                <Slider
                                                                    min={3}
                                                                    max={20}
                                                                    step={1}
                                                                    value={[field.value]}
                                                                    onValueChange={(value) => field.onChange(value[0])}
                                                                    className="py-4"
                                                                />
                                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                    <span>3</span>
                                                                    <span>10</span>
                                                                    <span>20</span>
                                                                </div>
                                                            </div>
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
                                                        <div className="grid grid-cols-3 gap-3 pt-2">
                                                            {["easy", "medium", "hard"].map((difficulty) => (
                                                                <Button
                                                                    key={difficulty}
                                                                    type="button"
                                                                    variant={field.value === difficulty ? "default" : "outline"}
                                                                    className={`
                                    h-16 flex flex-col gap-1 capitalize
                                    ${field.value === difficulty ? "ring-2 ring-primary/20" : ""}
                                  `}
                                                                    onClick={() => field.onChange(difficulty)}
                                                                >
                                                                    <span className="text-sm font-medium capitalize">{difficulty}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {difficulty === "easy" && "For beginners"}
                                                                        {difficulty === "medium" && "Balanced challenge"}
                                                                        {difficulty === "hard" && "Advanced questions"}
                                                                    </span>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        <FormDescription className="mt-2">
                                                            Choose how challenging you want the interview to be
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    <div className="bg-muted/20 p-6 rounded-lg border">
                                        <h3 className="font-medium mb-4">Interview Summary</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Type:</span>
                                                <span className="font-medium capitalize">{watchType}</span>
                                            </div>

                                            {watchType === "job" && watchSubType && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Focus:</span>
                                                    <span className="font-medium capitalize">{watchSubType}</span>
                                                </div>
                                            )}

                                            {watchType === "job" && watchSubType === "technical" && selectedTechnologies.length > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Technologies:</span>
                                                    <span className="font-medium text-right">
                                                        {selectedTechnologies
                                                            .map((tech) => technologyOptions.find((t) => t.id === tech)?.label)
                                                            .join(", ")}
                                                    </span>
                                                </div>
                                            )}

                                            {watchType === "english" && form.watch("level") && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Level:</span>
                                                    <span className="font-medium capitalize">{form.watch("level")}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Questions:</span>
                                                <span className="font-medium">{form.watch("questionCount")}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Difficulty:</span>
                                                <span className="font-medium capitalize">{form.watch("difficulty")}</span>
                                            </div>

                                            {form.watch("pdfUrl") && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Uploaded File:</span>
                                                    <span className="font-medium text-primary underline text-sm">
                                                        <a href={form.watch("pdfUrl")} target="_blank" rel="noopener noreferrer">
                                                            View Document
                                                        </a>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-between bg-muted/30 border-t">
                    {step > 1 ? (
                        <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : (
                        <div></div>
                    )}
                    <Button
                        onClick={handleNext}
                        disabled={(!interviewType && step === 1) || isSubmitting}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
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
