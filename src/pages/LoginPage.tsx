import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FinmLogo } from '@/components/shared/FinmLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { dashboardFor } from '@/config/navigation'
import { useApp } from '@/context/AppContext'
import type { UserRole } from '@/types/app'

export function LoginPage() { const { currentUser, login } = useApp(); const [role,setRole] = useState<UserRole>('ADMIN'); const navigate = useNavigate(); if (currentUser) return <Navigate to={dashboardFor(currentUser.role)} replace />; return <main className="grid min-h-screen place-items-center bg-background p-4"><Card className="w-full max-w-sm"><CardHeader><FinmLogo /><CardTitle className="pt-4">Welcome back</CardTitle><CardDescription>Choose a demo role to enter the Social Fund system.</CardDescription></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="role">Role</Label><select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"><option value="ADMIN">Administrator</option><option value="MEMBER">Member</option></select></div><Button className="w-full" onClick={() => { login(role); navigate(dashboardFor(role)) }}>Sign in</Button></CardContent></Card></main> }
