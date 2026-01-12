'use client';

import { Container } from '@/components/ui/container';
import { SearchResultsGridContent } from '@/app/(public)/store/search-results-grid/content';

export default function SearchResultsGridPage() {
  return (
    <Container>
      <SearchResultsGridContent />
    </Container>
  );
}
