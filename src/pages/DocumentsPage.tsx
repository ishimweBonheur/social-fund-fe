import { Download, FileText, Upload } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApp } from '@/context/AppContext'

export function DocumentsPage() {
  const { documents, addNotification } = useApp()

  const handleUpload = () => {
    addNotification({
      title: 'Document uploaded',
      message: 'Your file has been uploaded successfully',
      time: 'Just now',
      type: 'update',
    })
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Access and manage your financial documents"
        action={
          <Button onClick={handleUpload} className="rounded-full bg-[#0F9D58] hover:bg-[#0F9D58]/90">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F9D58]/10">
                        <FileText className="h-4 w-4 text-[#0F9D58]" />
                      </div>
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                  <TableCell className="text-muted-foreground">{doc.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
