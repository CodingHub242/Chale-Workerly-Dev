# TODO: Add Edit Shift Action Button for Admins on Shifts Page

## Steps to Complete:
- [x] Add "Edit Shift" button to shifts.page.html in the .card-actions section, conditional on !authService.isTemp()
- [x] Implement editShift(shift: Shift) method in shifts.page.ts to navigate to /shift-form with shift ID
- [x] Test the edit functionality to ensure it works for admins only
