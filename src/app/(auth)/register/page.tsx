
"use client"

import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import { register } from "@/lib/actions"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

function SubmitButton() {
    const { pending } = useFormStatus()
    return <Button className="w-full" type="submit" disabled={pending}>{pending ? "Creating account..." : "Create account"}</Button>
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, undefined)

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Alex Doe" required />
            </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          {state?.error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {state.error}
                </AlertDescription>
            </Alert>
          )}
           {state?.message && (
            <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                    {state.message} Please <Link href="/login" className="underline">login</Link> to continue.
                </AlertDescription>
            </Alert>
          )}
          <SubmitButton />
        </form>
      </CardContent>
       <CardFooter className="text-sm">
        <div className="w-full text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline">
                Sign in
            </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
