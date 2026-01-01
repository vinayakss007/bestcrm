
"use client"

import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import { login, loginAsSuperAdmin } from "@/lib/actions"
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
import { Separator } from "@/components/ui/separator"

function SubmitButton() {
    const { pending } = useFormStatus()
    return <Button className="w-full" type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign In"}</Button>
}

function SuperAdminLoginButton() {
    const { pending } = useFormStatus()
    return <Button variant="secondary" className="w-full" type="submit" disabled={pending}>{pending ? "Signing in..." : "Login as Super Admin (Dev)"}</Button>
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, undefined)
  const [superAdminState, superAdminFormAction] = useFormState(loginAsSuperAdmin, undefined);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
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
            <Input id="password" name="password" type="password" required />
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
          <SubmitButton />
        </form>
        <Separator className="my-4" />
        <form action={superAdminFormAction} className="grid gap-4">
             {superAdminState?.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {superAdminState.error}
                    </AlertDescription>
                </Alert>
             )}
            <SuperAdminLoginButton />
        </form>
      </CardContent>
      <CardFooter className="text-sm">
        <div className="w-full text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline">
                Sign up
            </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
