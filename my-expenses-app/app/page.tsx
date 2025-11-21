"use client";

import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import UploadComponent from "@/components/uploadComponent";
import WelcomeComponent from "@/components/welcomeComponent";
import Image from "next/image";
import Footer from "@/components/footer";
import Link from "next/link";
import { FiTrendingUp, FiUpload, FiUser, FiZap, FiPieChart, FiCalendar } from "react-icons/fi";

// Import Material Web Components
if (typeof window !== 'undefined') {
  import('@material/web/button/filled-button.js');
  import('@material/web/button/filled-tonal-button.js');
  import('@material/web/button/outlined-button.js');
  import('@material/web/button/text-button.js');
  import('@material/web/fab/fab.js');
  import('@material/web/progress/circular-progress.js');
  import('@material/web/divider/divider.js');
}

interface UserProfileProps {
  user: string;
  image: string;
  onSignOut: () => void;
}

// Material 3 User Profile Component
const UserProfile: React.FC<UserProfileProps> = ({
  user,
  image,
  onSignOut,
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Image
          src={image}
          alt="User profile"
          className="rounded-full shadow-lg"
          style={{
            border: `4px solid var(--md-sys-color-primary)`,
          }}
          width={120}
          height={120}
        />
        <div
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--md-sys-color-tertiary-container)',
            borderColor: 'var(--md-sys-color-surface)',
            color: 'var(--md-sys-color-on-tertiary-container)'
          }}
        >
          <FiZap className="w-4 h-4" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h4 className="md-typescale-headline-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
          Welcome back!
        </h4>
        <p className="md-typescale-title-large" style={{ color: 'var(--md-sys-color-primary)' }}>
          {user}
        </p>
      </div>

      <md-filled-tonal-button onClick={onSignOut}>
        <svg slot="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Sign Out
      </md-filled-tonal-button>
    </div>
  );
};

// Main Home Page
const HomePage: React.FC = () => {
  const { data: session, status } = useSession();

  // Loading state with Material 3
  if (status === "loading") {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ backgroundColor: 'var(--md-sys-color-background)' }}
      >
        <div className="flex flex-col items-center space-y-6">
          <md-circular-progress indeterminate />
          <div className="text-center">
            <h2 className="md-typescale-headline-small mb-2" style={{ color: 'var(--md-sys-color-on-background)' }}>
              Loading Dashboard
            </h2>
            <p className="md-typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Preparing your expense tracker...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <WelcomeComponent />;
  }

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--md-sys-color-background)' }}
    >
      {/* Top App Bar */}
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          boxShadow: 'var(--md-sys-elevation-level2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)'
                }}
              >
                💰
              </div>
              <div>
                <h1 className="md-typescale-title-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  Expense Intelligence
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/material-web-demo">
                <md-text-button>Components</md-text-button>
              </Link>
              <Link href="/trends">
                <md-outlined-button>
                  <FiTrendingUp className="mr-2" />
                  Trends
                </md-outlined-button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-12 md:py-20 text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* AI Badge */}
          <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'var(--md-sys-color-secondary-container)',
              color: 'var(--md-sys-color-on-secondary-container)'
            }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--md-sys-color-tertiary)' }}></div>
            <span className="md-typescale-label-large">✨ AI-Powered Intelligence</span>
          </div>

          {/* Title */}
          <h1 className="md-typescale-display-medium mb-6" style={{ color: 'var(--md-sys-color-on-background)' }}>
            Expense Intelligence
          </h1>

          {/* Description */}
          <p className="md-typescale-body-large mb-4 max-w-2xl mx-auto" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            Transform your financial data into{' '}
            <span className="font-semibold" style={{ color: 'var(--md-sys-color-primary)' }}>
              actionable insights
            </span>
            {' '}with AI-powered analysis
          </p>
          <p className="md-typescale-body-medium mb-8" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Upload, analyze, visualize. Your spending patterns decoded in seconds.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            {[
              { icon: '∞', label: 'Smart AI', desc: 'Auto-categorize', color: 'primary' },
              { icon: '📊', label: 'Multi-View', desc: 'Rich analytics', color: 'secondary' },
              { icon: '✨', label: 'Beautiful', desc: 'Visualizations', color: 'tertiary' },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-xl transition-transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  border: `2px solid var(--md-sys-color-${stat.color})`,
                  boxShadow: 'var(--md-sys-elevation-level1)'
                }}
              >
                <div className="text-4xl md:text-5xl mb-3 transition-transform hover:scale-110"
                  style={{ color: `var(--md-sys-color-${stat.color})` }}>
                  {stat.icon}
                </div>
                <div className="md-typescale-title-medium mb-1" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  {stat.label}
                </div>
                <div className="md-typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 flex-grow px-4 pb-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Primary Action Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Upload Card */}
            <div
              className="rounded-xl p-8 transition-transform hover:scale-[1.01]"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                boxShadow: 'var(--md-sys-elevation-level1)'
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)'
                  }}
                >
                  <FiUpload className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="md-typescale-headline-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    Upload & Analyze
                  </h2>
                  <p className="md-typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    CSV files with AI categorization
                  </p>
                </div>
              </div>
              <UploadComponent
                onUploadSuccess={() => {}}
                useremail={session.user?.email as string}
              />
            </div>

            {/* User Profile Card */}
            <div
              className="rounded-xl p-8 transition-transform hover:scale-[1.01]"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                boxShadow: 'var(--md-sys-elevation-level1)'
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)'
                  }}
                >
                  <FiUser className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="md-typescale-headline-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    Your Profile
                  </h2>
                  <p className="md-typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Manage your account
                  </p>
                </div>
              </div>
              <UserProfile
                user={session.user?.name as string}
                image={session.user?.image as string}
                onSignOut={() => signOut()}
              />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FiPieChart,
                title: 'Interactive Charts',
                description: 'Visualize spending with treemaps and charts',
                href: '/chart'
              },
              {
                icon: FiCalendar,
                title: 'Calendar View',
                description: 'Track expenses by date and time',
                href: '/chart?view=calendar'
              },
              {
                icon: FiTrendingUp,
                title: 'Trends & Insights',
                description: 'AI-powered spending analysis',
                href: '/trends'
              },
            ].map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className="p-6 rounded-xl transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    boxShadow: 'var(--md-sys-elevation-level1)'
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: 'var(--md-sys-color-tertiary-container)',
                      color: 'var(--md-sys-color-on-tertiary-container)'
                    }}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="md-typescale-title-large mb-2" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    {feature.title}
                  </h3>
                  <p className="md-typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* FAB for Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/chart">
          <md-fab label="View Dashboard">
            <svg slot="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </md-fab>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
