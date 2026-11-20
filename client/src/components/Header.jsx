import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ currentTab, onSelectTab }) => {
  const { user, isAdmin, logout, theme, toggleTheme } = useAuth();

  const tabs = [
    { id: 'notes', label: 'My Notes', icon: 'description' },
    { id: 'posts', label: 'Posts', icon: 'forum' },
    { id: 'profile', label: 'Profile', icon: 'account_circle' }
  ];

  if (isAdmin) {
    tabs.push(
      { id: 'all-notes', label: 'All Notes', icon: 'auto_stories' },
      { id: 'users', label: 'Users', icon: 'group' },
      { id: 'interests', label: 'Interests', icon: 'interests' }
    );
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--header-bg)] border-b border-[var(--header-border)] shadow-sm transition-colors duration-200">
      {/* Top Bar */}
      <div className="h-16 w-full max-w-[1100px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] shadow-sm">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-[var(--text-color)]">
            Secure Notes
          </span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--card-low)] text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-text)] font-medium text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="font-medium text-sm hidden sm:inline text-[var(--text-color)]">
              {user?.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-[var(--primary-light)] text-[var(--primary-light-text)] border border-[var(--card-border)]'
                  : 'bg-[var(--tag-bg)] text-[var(--text-muted)]'
              }`}
            >
              {user?.role}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[var(--primary)] hover:bg-[var(--card-low)] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Accent */}
      <div className="w-full h-0.5 bg-[var(--card-border)] overflow-hidden">
        <div className="w-1/3 h-full bg-[var(--primary)] opacity-70 animate-pulse"></div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full bg-[var(--header-bg)] border-t border-[var(--card-border)]/50">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex items-center overflow-x-auto">
          <nav className="flex items-center gap-6 sm:gap-8">
            {tabs.map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    active
                      ? 'text-[var(--primary)] border-[var(--primary)]'
                      : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-color)]'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
