import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Layout from './components/common/Layout';
import CoachMembersPage from './pages/coach/CoachMembersPage';
import CoachMeasurementPage from './pages/coach/CoachMeasurementPage';
import CoachPlanPage from './pages/coach/CoachPlanPage';
import CoachCheckinPage from './pages/coach/CoachCheckinPage';
import CoachCalendarPage from './pages/coach/CoachCalendarPage';
import MemberTrendsPage from './pages/member/MemberTrendsPage';
import MemberWeeklyPlanPage from './pages/member/MemberWeeklyPlanPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/coach/members" element={<Layout role="coach"><CoachMembersPage /></Layout>} />
      <Route path="/coach/members/:id/measurements" element={<Layout role="coach"><CoachMeasurementPage /></Layout>} />
      <Route path="/coach/members/:id/plans" element={<Layout role="coach"><CoachPlanPage /></Layout>} />
      <Route path="/coach/members/:id/calendar" element={<Layout role="coach"><CoachCalendarPage /></Layout>} />
      <Route path="/coach/checkin-stats" element={<Layout role="coach"><CoachCheckinPage /></Layout>} />
      <Route path="/member/trends" element={<Layout role="member"><MemberTrendsPage /></Layout>} />
      <Route path="/member/weekly-plan" element={<Layout role="member"><MemberWeeklyPlanPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
