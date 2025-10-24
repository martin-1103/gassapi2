import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils/index"
import { useSidebarState, type UseSidebarStateProps } from "./hooks/use-sidebar-state"

export interface SidebarContextProps {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

/**
 * Hook untuk menggunakan sidebar context
 * @throws Error jika digunakan di luar SidebarProvider
 */
export function useSidebar(): SidebarContextProps {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

// Konstanta untuk sidebar styling
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"

export interface SidebarProviderProps extends React.ComponentProps<"div> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Provider component untuk sidebar state dan konteks
 * Menyediakan state management dan keyboard shortcuts untuk sidebar
 */
export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      defaultOpen = true,
      open,
      onOpenChange,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const sidebarState = useSidebarState({
      defaultOpen,
      open,
      onOpenChange,
    })

    const contextValue = React.useMemo<SidebarContextProps>(
      () => sidebarState,
      [sidebarState]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)

SidebarProvider.displayName = "SidebarProvider"