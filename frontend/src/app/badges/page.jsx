// For example, in your /app/dashboard/page.js

import Navbar from '@/components/navbar'; // Your existing Navbar
import BadgesPage from '@/components/BadgesPage';

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <BadgesPage />
    </div>
  );
}