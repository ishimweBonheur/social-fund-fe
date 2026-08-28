import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export interface TableAction { label: string; onSelect: () => void; destructive?: boolean; separator?: boolean }
export default function TableActions({ actions }: { actions: TableAction[] }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Open row actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-44">{actions.map((action) => <span key={action.label}>{action.separator && <DropdownMenuSeparator />}<DropdownMenuItem className={action.destructive ? 'text-red-700 focus:text-red-700' : ''} onSelect={action.onSelect}>{action.label}</DropdownMenuItem></span>)}</DropdownMenuContent></DropdownMenu>
}
