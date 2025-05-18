"use client"

import { UploadButton } from "@/lib/uploadthing"
import { toast } from "sonner"
import { UploadCloud } from "lucide-react"

interface FileUploadProps {
    onChange: (url: string) => void
    value: string
    endpoint: "pdfUploader"
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
    return (
        <div className="w-full">
            {value ? (
                <div className="flex flex-col items-center justify-center w-full">
                    <div className="relative flex items-center p-2 mt-2 rounded-md bg-primary/5">
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary underline overflow-hidden text-ellipsis max-w-xs"
                        >
                            {value.split("/").pop()}
                        </a>
                        <button
                            onClick={() => onChange("")}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center">
                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                    <UploadButton
                        endpoint={"imageUploader"}
                        onClientUploadComplete={(res) => {
                            onChange(res?.[0]?.url || "")
                            toast.success("File uploaded successfully")
                        }}
                        onUploadError={(error: Error) => {
                            toast.error(`ERROR! ${error.message}`)
                        }}
                        className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:px-4 ut-button:py-2 ut-button:rounded-md ut-allowed-content:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-2">PDF format, max 4MB</p>
                </div>
            )}
        </div>
    )
}
