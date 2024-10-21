import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ButtonLoading() {
  return (
    <Button disabled>
      <Loader2 className="h-4 w-4 animate-spin text-white" />
    </Button>
  )
}
