import { User } from '@supabase/supabase-js';
import { LogOut, Calendar, Settings } from 'lucide-react';
import { signOut } from '../../lib/supabase';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface HeaderProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header = ({ user, currentPage, onNavigate }: HeaderProps) => {
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    }
  };

  const isAdmin = user.user_metadata?.role === 'admin';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Room Booker
            </h1>
            
            <nav className="hidden md:flex space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Dashboard
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="inline-block w-4 h-4 mr-2" />
                  Admin Panel
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.user_metadata?.full_name || user.email}
            </span>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};