'use client';

import { Container } from '@/components/ui/container';
import { SearchResultsListContent } from '@/app/(public)/store/search-results-list/content';

export default function SearchResultsListPage() {
  return (
    <Container>
      <SearchResultsListContent />
    </Container>
  );
}
