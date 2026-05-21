import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Sidebar } from '@/components/layout/Sidebar'
import { APP_NAME, APP_TAGLINE } from '@/lib/brand'

type HeaderProps = {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="size-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar className="w-full" onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {title && (
        <h2 className="text-sm font-medium text-muted-foreground lg:hidden">
          {title}
        </h2>
      )}

      <div className="ml-auto hidden text-sm font-medium sm:block">
        <span className="text-primary">{APP_NAME}</span>
        <span className="text-muted-foreground"> — {APP_TAGLINE}</span>
      </div>
    </header>
  )
}
