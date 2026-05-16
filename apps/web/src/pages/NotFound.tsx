import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BookOpen } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-card border border-gold/20 bg-gold/5">
        <BookOpen className="h-8 w-8 text-gold" strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <p className="text-label">ARCHIVE ERROR</p>
        <h1 className="font-serif text-display text-parchment">404</h1>
        <p className="text-body text-ash max-w-md">
          This page has been lost to the archives. The path you seek does not exist in the codex.
        </p>
      </div>
      <Link to="/">
        <Button variant="primary">
          Return to Archive
        </Button>
      </Link>
    </div>
  );
}
