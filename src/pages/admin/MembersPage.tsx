import { useState, type FormEvent } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMembers } from '@/hooks/useMembers'
import { getApiErrorMessage } from '@/services/api'
import type { Member, MemberInput, MemberStatus } from '@/types/app'

const emptyForm: MemberInput = { fullName: '', email: '', phone: '', status: 'ACTIVE' }
const statuses: MemberStatus[] = ['ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED']

export default function MembersPage() {
  const { members, isLoading, error, setError, reload, save, find, remove, changeStatus } = useMembers()
  const [form, setForm] = useState<MemberInput>(emptyForm)
  const [editingId, setEditingId] = useState<string>()
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')

  const openEdit = async (member: Member) => {
    setError('')
    try {
      const detail = await find(member.id)
      setEditingId(detail.id)
      setForm({ fullName: detail.fullName, email: detail.email, phone: detail.phone, status: detail.status })
      setShowForm(true)
    } catch (reason) { setError(getApiErrorMessage(reason, 'Unable to load the member.')) }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setIsSaving(true); setError('')
    try { await save(form, editingId); setForm(emptyForm); setEditingId(undefined); setShowForm(false) }
    catch (reason) { setError(getApiErrorMessage(reason, 'Unable to save the member.')) }
    finally { setIsSaving(false) }
  }
  const handleDelete = async (member: Member) => {
    if (!window.confirm(`Delete ${member.fullName}? This action cannot be undone.`)) return
    try { await remove(member.id) } catch (reason) { setError(getApiErrorMessage(reason, 'Unable to delete the member.')) }
  }

  return (
    <div>
      <PageHeader title="Members" description="Manage Social Fund membership and account status" action={<Button className="rounded-full" onClick={() => { setEditingId(undefined); setForm(emptyForm); setShowForm((value) => !value) }}>{showForm ? 'Cancel' : 'Add Member'}</Button>} />
      <form className="mb-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); void reload({ search }) }}><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members…" /><Button type="submit" variant="outline">Search</Button></form>
      {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {showForm && <Card className="mb-3"><CardContent className="p-4"><form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="member-name">Full Name</Label><Input id="member-name" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></div>
        <div><Label htmlFor="member-email">Email</Label><Input id="member-email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
        <div><Label htmlFor="member-phone">Phone</Label><Input id="member-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
        <div><Label htmlFor="member-status">Status</Label><select id="member-status" className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as MemberStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>
        <Button disabled={isSaving} className="sm:col-span-2">{isSaving ? 'Saving…' : editingId ? 'Update Member' : 'Create Member'}</Button>
      </form></CardContent></Card>}
      <Card><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{isLoading ? <TableRow><TableCell colSpan={6} className="py-8 text-center">Loading members…</TableCell></TableRow> : members.length === 0 ? <TableRow><TableCell colSpan={6} className="py-8 text-center">No members found.</TableCell></TableRow> : members.map((member) => <TableRow key={member.id}>
          <TableCell className="font-medium">{member.fullName}</TableCell><TableCell>{member.email}</TableCell><TableCell>{member.phone || '—'}</TableCell>
          <TableCell><select aria-label={`Status for ${member.fullName}`} className="rounded-lg border bg-card px-2 py-1 text-xs" value={member.status} onChange={(event) => void changeStatus(member.id, event.target.value as MemberStatus).catch((reason) => setError(getApiErrorMessage(reason)))}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></TableCell>
          <TableCell>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}</TableCell><TableCell><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => void openEdit(member)}>Edit</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => void handleDelete(member)}>Delete</Button></div></TableCell>
        </TableRow>)}</TableBody>
      </Table></CardContent></Card>
    </div>
  )
}
