
"use client"

import { Download, File as FileIcon, User, Calendar, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Attachment } from "@/lib/types"
import { downloadAttachment } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function AttachmentsList({ attachments }: { attachments: Attachment[] }) {
    const { toast } = useToast();
    
    const handleDownload = async (attachment: Attachment) => {
        try {
            const { blob, filename } = await downloadAttachment(attachment.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            toast({
                variant: "destructive",
                title: "Download Failed",
                description: "Could not download the attachment. Please try again.",
            });
        }
    };

    if (attachments.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                No attachments yet.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                        <p className="font-medium truncate">{attachment.originalName}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center gap-1"><User className="h-3 w-3" /> {attachment.user.name}</div>
                            <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(attachment.createdAt).toLocaleDateString()}</div>
                             <div className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {formatBytes(attachment.fileSize)}</div>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handleDownload(attachment)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                    </Button>
                </div>
            ))}
        </div>
    )
}
