import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'

export function SettingsPage() {
  const { addNotification } = useApp()
  const [name, setName] = useState('bonheur')
  const [email, setEmail] = useState('ishimwebonheur078@gmail.com')
  const [notifications, setNotifications] = useState(true)

  const handleSave = () => {
    addNotification({
      title: 'Settings saved',
      message: 'Your profile settings have been updated successfully',
      time: 'Just now',
      type: 'update',
    })
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account preferences and security" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-fit rounded-full bg-[#0F9D58] hover:bg-[#0F9D58]/90">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm">Push notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-4 w-4 accent-[#0F9D58]"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Email alerts</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#0F9D58]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Transaction summaries</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#0F9D58]" />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
