import React from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Archive error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-6 text-center bg-void p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-card border border-fear/30 bg-fear/5">
            <AlertCircle className="h-8 w-8 text-fear" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 max-w-md">
            <p className="text-label">SYSTEM FAILURE</p>
            <h1 className="font-serif text-h1 text-parchment">The Archive Falters</h1>
            <p className="text-body text-ash">
              An unexpected error has occurred. The scribes are working to restore order.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Restore Archive
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
