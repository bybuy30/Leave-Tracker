# Leave-Tracker
this project was built to make tool to track the leaves of employees in a company.
=======
# Leave Tracker - Web Application

A modern React + Tailwind CSS web application for managing employee leave requests and tracking leave balances.

## Features

### UI Components

1. **Sticky Header**
   - Company branding on the left
   - Employee search bar (center) - filters by name
   - Settings icon and Leaves tab (right)

2. **Full-Width DateTime Bar**
   - Real-time updating date and time
   - Stylish large font display
   - Spanning the full screen width

3. **Greeting Section**
   - Personalized welcome message
   - Overlapping design at the transition between dark and light areas
   - Helvetica font for elegant typography

4. **Leave Policy Cards**
   - Three cards: Casual, Sick, and Public Holiday leaves
   - Shows: Used, Remaining, and Total leaves
   - Visual progress bars with color coding
   - Utilization percentages

5. **Employees Directory Table**
   - Columns: ID, Name, Designation, Country, Leaves Left
   - Sortable by any column (click headers)
   - Row highlighting on hover
   - Click any row to open employee profile drawer
   - Search filtering with header search bar

6. **Employee Profile Drawer**
   - Side drawer with employee avatar and details
   - Three tabs:
     - **Overview**: Leave utilization chart
     - **Breakdown**: Leave type breakdown with details
     - **Logs**: Historical leave records with dates
   - Action buttons: Allocate Leave, Remove Employee

7. **Add User Modal**
   - Form with fields: Name, Designation, Country
   - Add/Cancel buttons
   - Opens from floating action button or header

8. **Floating Action Button (FAB)**
   - Fixed position button to add new employees
   - Bottom-right corner with hover effects

### Design System

- **Colors**: Primarily grayscale with blue accents
- **Layout**: Responsive grid system using Tailwind CSS
- **Shadows**: Soft shadows on cards for depth
- **Border Radius**: Rounded corners (8px) on components
- **Animations**: Subtle fade-in and slide-in animations

### Responsiveness

- Mobile-first design approach
- Responsive navigation and table layouts
- Touch-friendly button sizes
- Full-screen drawer on mobile devices

### Accessibility

- Keyboard navigation support
- Proper ARIA labels on interactive elements
- Focus states on all buttons
- Semantic HTML structure
- High contrast text colors

## Project Structure

```
src/
├── components/           # React components
│   ├── Header.jsx
│   ├── DateTimeBar.jsx
│   ├── Greeting.jsx
│   ├── LeavePolicyCards.jsx
│   ├── EmployeesTable.jsx
│   ├── ProfileDrawer.jsx
│   ├── AddUserModal.jsx
│   ├── FloatingActionButton.jsx
│   └── index.js
├── data/
│   └── mockData.js       # Mock employee data
├── utils/
│   └── firebaseHelpers.js # Firebase integration placeholders
├── App.jsx              # Main application component
├── App.css              # App-specific styles
├── index.css            # Global styles with Tailwind
└── main.jsx             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd leave
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

### Tailwind CSS

The project uses Tailwind CSS v3 for styling. Configuration is in `tailwind.config.js`:

```javascript
- Extended color palette
- Custom font families
- Responsive breakpoints
```

### Mock Data

Sample employee data is in `src/data/mockData.js`. This includes:
- 5 sample employees with various details
- Leave policy definitions
- Leave type color mappings
- Sample leave logs

## Firebase/Firestore Integration (Placeholder)

All Firebase functions are placeholders in `src/utils/firebaseHelpers.js`:

- `addEmployeeToFirestore()` - Add new employee
- `updateEmployeeLeaveToFirestore()` - Update leave records
- `deleteEmployeeFromFirestore()` - Delete employee
- `fetchEmployeesFromFirestore()` - Fetch all employees
- `logLeaveToFirestore()` - Log leave activity

### TODO: Connect to Firebase

1. Install Firebase SDK:
```bash
npm install firebase
```

2. Initialize Firebase in a new file `src/config/firebase.js`

3. Replace placeholder functions with actual Firestore operations

4. Update `src/App.jsx` to fetch from Firestore instead of mock data

## Component APIs

### Header
```jsx
<Header 
  onAddClick={() => {}} 
  onSearchChange={(term) => {}} 
/>
```

### EmployeesTable
```jsx
<EmployeesTable 
  employees={[...]}
  onRowClick={(employee) => {}}
  searchTerm="search"
/>
```

### ProfileDrawer
```jsx
<ProfileDrawer 
  employee={employeeObj}
  isOpen={boolean}
  onClose={() => {}}
  onAllocateLeave={(employee) => {}}
  onRemoveEmployee={(employeeId) => {}}
/>
```

### AddUserModal
```jsx
<AddUserModal 
  isOpen={boolean}
  onClose={() => {}}
  onSubmit={(formData) => {}}
/>
```

## State Management

The main `App.jsx` manages:
- `employees` - List of employees
- `searchTerm` - Current search query
- `selectedEmployee` - Currently selected employee
- `isDrawerOpen` - Profile drawer visibility
- `isModalOpen` - Add user modal visibility

Consider migrating to Redux or Context API for larger applications.

## Styling Guidelines

### Using Tailwind Classes

Common patterns used:

```jsx
// Cards
className="card card-hover"

// Buttons
className="btn-primary"  // Dark button
className="btn-secondary" // Light button
className="btn-icon"     // Icon button

// Inputs
className="input-field"

// Animations
className="fade-in"
className="slide-in-right"
```

### Custom CSS

Custom styles are in `src/index.css` with:
- Tailwind directives (`@tailwind`)
- Layer components
- Animation definitions
- Custom keyframes

## Tips for Development

1. **Adding New Components**: Create in `src/components/`, export from `index.js`

2. **Styling**: Use Tailwind classes first, add custom CSS only when needed

3. **Mock Data**: Update `mockData.js` to test different scenarios

4. **Real Data**: Replace mock data fetching with Firestore queries

5. **Navigation**: Currently using local state. Consider adding React Router for multi-page experience

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- [ ] Connect to Firebase Firestore
- [ ] Add authentication
- [ ] Implement leave approval workflow
- [ ] Add email notifications
- [ ] Create admin dashboard
- [ ] Add leave calendar view
- [ ] Implement leave balance adjustment
- [ ] Add export to PDF/Excel
- [ ] Multi-language support
- [ ] Dark mode toggle

## Troubleshooting

### Hot Module Replacement not working
- Clear `.vite` folder and restart server

### Tailwind classes not applying
- Ensure `tailwind.config.js` has correct content paths
- Check that CSS file has `@tailwind` directives

### Import errors
- Make sure all component files are in `src/components/`
- Check that exports match in `components/index.js`

## Performance Optimization

For production:
1. Use code splitting for large components
2. Implement lazy loading for employee lists
3. Optimize images (avatars)
4. Consider virtual scrolling for large tables
5. Add service workers for offline support

## License

MIT

## Support

For issues or questions, please refer to the component documentation in individual component files.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

=======
Leave tracking website where on request the admins can log in and track the granted leaves by a company in a year. 
35 in a year.
