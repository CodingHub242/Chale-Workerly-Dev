# TODO: Add Pagination to Temps Page

## Tasks
- [x] Update temps.page.ts to implement client-side pagination with 10 items per page
- [x] Modify loadTemps() to initialize filteredTemps
- [x] Add pagination variables: currentPage, pageSize, totalPages
- [x] Implement getPagedTemps() method to return sliced array
- [x] Add nextPage(), prevPage(), goToPage() methods
- [x] Update onSearchTermChange() to filter temps and reset page
- [x] Update temps.page.html to use getPagedTemps() in *ngFor
- [x] Add pagination controls below search bar, aligned to the right
- [x] Ensure export functionality uses full temps list

## Notes
- Pagination is client-side to avoid backend changes
- Search filters the full list, then paginates the filtered results
- Export uses the complete temps array
