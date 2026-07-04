"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  phone: z.string().min(10, "Valid phone required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["PASSENGER", "DRIVER", "OPERATOR"]),
});

export default function SignupPage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", password: "", role: "PASSENGER" },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      setError("");
      const payload = {
        ...values,
        role: values.role === "OPERATOR" ? "BUS_OWNER" : values.role
      };
      const res = await api.post("/auth/signup", payload);
      const { user, accessToken } = res.data;
      login(user, accessToken);

      // Role-based redirect
      if (user.role === "PASSENGER") router.push("/passenger");
      else if (user.role === "DRIVER") router.push("/driver");
      else router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-zinc-400">Join the Koi Bus network</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  className="bg-zinc-800 border-zinc-700"
                  {...form.register("firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  className="bg-zinc-800 border-zinc-700"
                  {...form.register("lastName")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter your phone"
                className="bg-zinc-800 border-zinc-700"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className="bg-zinc-800 border-zinc-700"
                {...form.register("password")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("role")}
              >
                <option value="PASSENGER">Passenger</option>
                <option value="DRIVER">Driver</option>
                <option value="OPERATOR">Operator</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {form.formState.isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-zinc-400">
            Already have an account? <a href="/login" className="text-blue-400 hover:underline">Log in</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
