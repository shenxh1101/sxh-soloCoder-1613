import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  role: 'coach' | 'member';
}

export default function Layout({ children, role }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 animate-fade-in">
      <Sidebar
        role={role}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
      <main className="flex-1 p-6 ml-64 min-h-screen">
        <div className="animate-slide-up">{children}</div>
      </main>
    </div>
  );
}
