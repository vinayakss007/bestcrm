
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getUsers, updateUser } from "@/lib/actions"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const { toast } = useToast()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const users = await getUsers();
        if (users && users.length > 0) {
          const currentUser = users[0];
          setUser(currentUser);
          form.reset({
            name: currentUser.name,
            email: currentUser.email,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
  }, [form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    try {
        await updateUser(parseInt(user.id), { name: data.name });
        toast({
            title: "Success",
            description: "Your profile has been updated.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update profile. Please try again.",
        });
    }
  }

  if (!user) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-sm" />
                </div>
                <div className="grid gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-sm" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Skeleton className="h-10 w-20" />
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                This is how you'll appear to others on the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="max-w-sm" />
                                </FormControl>
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
                                    <Input {...field} type="email" readOnly disabled className="max-w-sm" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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

    