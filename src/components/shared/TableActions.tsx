import { Fragment } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface TableAction {
  label: string
  onSelect: () => void
  destructive?: boolean
  separator?: boolean
}
export default function TableActions({ actions }: { actions: TableAction[] }) {
  const primaryAction = actions.find((action) => action.label === 'Submit Payment Proof')
  const menuActions = actions.filter((action) => action !== primaryAction)

  return (
    <div className="flex items-center gap-2">
      {primaryAction && (
        <Button
          size="sm"
          onClick={primaryAction.onSelect}
        >
          Add Payment Proof
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open row actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-44"
        >
          {menuActions.map((action) => (
            <Fragment key={action.label}>
              {action.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={action.destructive ? 'text-[#213448] focus:text-[#213448] dark:text-[#94B4C1] dark:focus:text-[#94B4C1]' : ''}
                onSelect={action.onSelect}
              >
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
