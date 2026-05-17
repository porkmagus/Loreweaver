import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '@/pages/NotFound';
describe('NotFound', () => {
    it('renders 404 page with return link', () => {
        render(<MemoryRouter>
        <NotFound />
      </MemoryRouter>);
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText(/lost to the archives/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /return to archive/i })).toBeInTheDocument();
    });
});
//# sourceMappingURL=NotFound.test.js.map