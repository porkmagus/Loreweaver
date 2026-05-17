import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from '@/components/ui/Spinner';
describe('Spinner', () => {
    it('renders spinner', () => {
        const { container } = render(<Spinner />);
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
    it('accepts custom className', () => {
        const { container } = render(<Spinner className="custom-class"/>);
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
//# sourceMappingURL=Spinner.test.js.map