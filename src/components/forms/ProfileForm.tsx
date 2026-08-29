import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'

export default function ProfileForm({ admin = false }: { admin?: boolean }) {
  const { currentUser } = useApp()
  return (
    <div>
      <PageHeader
        title={admin ? 'Settings' : 'Profile'}
        description="Manage your account information and preferences"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Details supplied to the Social Fund</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={currentUser?.fullName ?? ''}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={currentUser?.email ?? ''}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={currentUser?.phone ?? ''}
                readOnly
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Member ID:</span> {currentUser?.id}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span> {currentUser?.role}
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span>{' '}
              {currentUser?.status ?? 'Unknown'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
