import { useState } from 'react'
import { Mail, Phone, Plus, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { pickContactAvatar } from '@/data/avatars'
import { useApp } from '@/context/AppContext'

export function ContactsPage() {
  const { contacts, addContact } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addContact({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      avatar: pickContactAvatar(form.name.trim()),
    })
    setForm({ name: '', email: '', phone: '', company: '' })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} contacts in your network`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-[#0F9D58] hover:bg-[#0F9D58]/90">
                <UserPlus className="h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader>
                  <DialogTitle>Add Contact</DialogTitle>
                  <DialogDescription>Add a new contact to your network.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="c-name">Name</Label>
                    <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-email">Email</Label>
                    <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-phone">Phone</Label>
                    <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="c-company">Company</Label>
                    <Input id="c-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-[#0F9D58] hover:bg-[#0F9D58]/90">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{contact.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{contact.company}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{contact.phone}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
