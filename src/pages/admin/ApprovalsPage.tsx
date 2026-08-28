import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApprovalsPage() {
  return <div><PageHeader title="Approvals" description="Choose the backend review queue you want to process" /><div className="grid gap-3 md:grid-cols-2"><Card><CardHeader><CardTitle>Contribution Proofs</CardTitle><CardDescription>Approve or reject pending member contribution payments.</CardDescription></CardHeader><CardContent><Button asChild><Link to="/admin/contributions">Review Contributions</Link></Button></CardContent></Card><Card><CardHeader><CardTitle>Assistance Requests</CardTitle><CardDescription>Approve amounts, reject requests, and record disbursements.</CardDescription></CardHeader><CardContent><Button asChild><Link to="/admin/loans">Review Assistance</Link></Button></CardContent></Card></div></div>
}
