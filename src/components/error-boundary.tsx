import { Component, type ErrorInfo, type ReactNode } from "react"

import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error no controlado:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md rounded-md border border-destructive/50 bg-destructive/10 px-6 py-5 text-center text-sm text-destructive">
            <p className="font-medium">Ocurrió un error inesperado.</p>
            <p className="mt-1 text-muted-foreground">
              Recarga la página para continuar. Si el problema persiste, avisa al equipo de
              soporte.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
