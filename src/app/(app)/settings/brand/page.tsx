
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { jwtDecode } from "jwt-decode"
import { getCookie } from "cookies-next"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { getUsers, updateOrganization } from "@/lib/actions"
import type { User } from "@/lib/types"

const brandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters."),
})

type BrandFormValues = z.infer<typeof brandSchema>

type AuthenticatedUser = {
    organizationId: number;
    // other properties
}

export default function BrandSettingsPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const users = await getUsers();
        if (users && users.length > 0) {
          const currentUser = users[0];
          setUser(currentUser);
          form.reset({ name: currentUser.organization?.name || "" });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [form]);

  async function onSubmit(data: BrandFormValues) {
    const token = getCookie("token");
    if (!token || !user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to perform this action." });
        return;
    }
    const decodedToken: AuthenticatedUser = jwtDecode(token);
    const organizationId = decodedToken.organizationId;
    
    try {
        await updateOrganization(organizationId, data);
        toast({
            title: "Success",
            description: "Brand settings have been updated.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update brand settings. Please try again.",
        });
    }
  }
  
  if (loading) {
    return <Skeleton className="h-[400px]" />
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Brand</CardTitle>
                <CardDescription>
                Manage your company's branding.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                            <Input {...field} className="max-w-sm" />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                            This name will be displayed throughout the application.
                        </p>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid gap-2">
                    <Label>Brand Logo</Label>
                    <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <Button variant="outline" size="sm" type="button">
                        Upload
                        </Button>
                        <p className="text-xs text-muted-foreground">
                        Appears in the left sidebar.
                        <br />
                        Recommended size: 32x32 px, PNG or SVG.
                        </p>
                    </div>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Favicon</Label>
                    <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <Button variant="outline" size="sm" type="button">
                        Upload
                        </Button>
                        <p className="text-xs text-muted-foreground">
                        Appears in your browser tab.
                        <br />
                        Recommended size: 32x32 px, PNG or ICO.
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save"}
                </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
