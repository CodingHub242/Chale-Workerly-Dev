# TODO: Allow Admin to Update Approval Status of Temps

## Completed Tasks
- [x] Update `src/app/pages/temps/temps.page.html` to show admin actions for all temps if admin (changed *ngIf condition).
- [x] Conditionally render Approve/Decline buttons based on approvalStatus:
  - Show Approve button if not approved.
  - Show Decline button if not declined.

## Pending Tasks
- [ ] Test the functionality by logging in as admin and changing statuses from approved to declined and vice versa.
- [ ] Verify that the backend API handles status changes correctly.
- [ ] Ensure UI updates properly after status change (chip color, button visibility).
