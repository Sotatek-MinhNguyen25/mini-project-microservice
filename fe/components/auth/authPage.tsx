'use client'
import { LoginForm } from './loginForm'
import { RegisterForm } from './registerForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export function AuthPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="glass-effect border-0 shadow-2xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-purple-600/5 border-b border-border/40">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-8 w-8 text-primary animate-pulse mr-2" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Social Blog
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Connect and share your thoughts with the world ✨
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black "
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black "
                >
                  Register
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <LoginForm />
                <div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Forgot your password?{' '}
                    <Link href="/auth/forgot-password" className="text-primary hover:underline">
                      Reset it here
                    </Link>
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="register" className="mt-6">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
