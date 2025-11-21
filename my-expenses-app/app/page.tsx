"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";
import UploadComponent from "@/components/uploadComponent";
import WelcomeComponent from "@/components/welcomeComponent";
import Image from "next/image";
import Footer from "@/components/footer";
import Link from "next/link";
import { FiActivity, FiCompass, FiLayers, FiTrendingUp, FiUpload, FiUser, FiZap } from "react-icons/fi";
import "../styles/homepage.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ThemeTest from "@/components/ThemeTest";

interface UserProfileProps {
  user: string;
  image: string;
  onSignOut: () => void;
}

// Enhanced User Profile Component
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
          className="rounded-full border-4 border-primary-500 shadow-2xl"
          width={120}
          height={120}
        />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-background-secondary flex items-center justify-center">
          <FiZap className="w-4 h-4 text-text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h4 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Welcome back!
        </h4>
        <p className="font-medium text-xl" style={{ color: 'var(--color-secondary-500)' }}>{user}</p>
      </div>

      <button
        onClick={onSignOut}
        className="group relative bg-primary-600 text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border-focus"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <FiUser className="w-4 h-4" />
          <span>Sign Out</span>
        </span>
        <div className="absolute inset-0 rounded-2xl bg-primary-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>
    </div>
  );
};

// Main Home Page
const HomePage: React.FC = () => {
  const { data: session, status } = useSession();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-text-tertiary border-t-secondary-500 rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Loading Dashboard
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Preparing your expense tracker...
            </p>
            <div className="mt-3 flex space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-accent-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <WelcomeComponent />;
  }

  // Navigate to the chart page
  // const handleBypass = () => {
  //   router.push("/chart");
  // };

  return (
    <div className="flex flex-col min-h-screen bg-background-primary relative overflow-hidden">
      {/* Material You dotted grid and light gradients */}
      <div className="absolute inset-0 soft-grid" aria-hidden />
      <div className="absolute inset-0 pointer-events-none">
        <div className="material-spotlight material-spotlight--primary" />
        <div className="material-spotlight material-spotlight--accent" />
      </div>

      {/* Material top app bar */}
      <header className="relative z-20 px-4 md:px-8 pt-8">
        <div
          className="material-surface flex flex-wrap items-center justify-between gap-4 rounded-3xl px-4 md:px-6 py-4 border shadow-elevated"
        >
          <div className="flex items-center gap-3">
            <div className="badge-tonal bg-primary-500/15 text-primary-600">AI</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Expense Studio</p>
              <p className="text-lg font-semibold text-text-primary">Material Finance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher className="min-w-[190px]" showLabel={false} size="sm" />
            <Link
              href="/trends"
              className="tonal-button flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            >
              <FiTrendingUp className="h-4 w-4" />
              Trends
            </Link>
          </div>
        </div>
      </header>

      {/* Hero and workspace */}
      <main className="relative z-10 flex-grow px-4 md:px-8 pb-16">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          <section className="grid lg:grid-cols-[1.2fr_0.9fr] gap-6 mt-8">
            <div className="material-surface rounded-4xl border shadow-elevated p-7 md:p-10 relative overflow-hidden">
              <div className="floating-ribbon" aria-hidden />
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="chip">Material You ready</span>
                <span className="chip chip-quiet">Adaptive palettes</span>
                <span className="chip chip-outline">Guided flows</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-primary mb-4">
                Expense intelligence crafted the Google way.
              </h1>
              <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-3xl mb-8">
                Build confidence in your finances with adaptive color, responsive layouts, and data-rich cards that feel native
                to Material design.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="#upload"
                  className="filled-button flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                >
                  <FiUpload className="h-4 w-4" />
                  Upload transactions
                </Link>
                <Link
                  href="/trends"
                  className="outline-button flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                >
                  <FiCompass className="h-4 w-4" />
                  Explore analytics
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {["AI readiness", "Insights shipped", "Live budgets"].map((label, idx) => (
                  <div key={label} className="stat-card">
                    <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">{label}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-text-primary">{["97%", "240", "18"][idx]}</span>
                      <span className="text-xs text-text-secondary">{idx === 1 ? "stories" : idx === 2 ? "budgets" : "ready"}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                      <span
                        className={`block h-full rounded-full ${idx === 0 ? "bg-primary-500" : idx === 1 ? "bg-secondary-500" : "bg-accent-500"}`}
                        style={{ width: idx === 0 ? "92%" : idx === 1 ? "68%" : "54%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="material-surface rounded-3xl border shadow-elevated p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Profile</p>
                    <p className="text-xl font-semibold text-text-primary">Signed in workspace</p>
                  </div>
                  <div className="badge-tonal bg-secondary-500/15 text-secondary-600 flex items-center gap-2">
                    <FiActivity className="h-4 w-4" />
                    Live sync
                  </div>
                </div>
                <UserProfile
                  user={session?.user?.name || "No User Name"}
                  image={(session?.user as { picture?: string })?.picture || "/images/defaultuser.jpg"}
                  onSignOut={() => signOut()}
                />
              </div>

              <div className="material-surface rounded-3xl border shadow-elevated p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="icon-pill bg-primary-500/15 text-primary-600">
                    <FiLayers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Workspace layout</p>
                    <p className="text-base font-semibold text-text-primary">Googley building blocks</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="pill-tile">Guided uploads</div>
                  <div className="pill-tile">LLM insights</div>
                  <div className="pill-tile">Budget tiles</div>
                  <div className="pill-tile">Trends board</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid xl:grid-cols-[1.2fr_0.9fr] gap-6" id="upload">
            <div className="material-surface rounded-3xl border shadow-elevated p-6 md:p-8 relative overflow-hidden">
              <div className="corner-accent" aria-hidden />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Primary action</p>
                  <h2 className="text-2xl font-bold text-text-primary">Upload & analyze</h2>
                  <p className="text-sm text-text-secondary mt-1">Secure CSV import with automatic categorization.</p>
                </div>
                <div className="icon-pill bg-secondary-500/15 text-secondary-600">
                  <FiUpload className="h-5 w-5" />
                </div>
              </div>
              <UploadComponent onUploadSuccess={() => {}} useremail={session.user?.email as string} />
            </div>

            <div className="space-y-4">
              <div className="material-surface rounded-3xl border shadow-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-pill bg-accent-500/15 text-accent-600">
                    <FiZap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Quick lanes</p>
                    <p className="text-base font-semibold text-text-primary">Jump into insights</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/trends" className="navigation-card">
                    <FiTrendingUp className="h-4 w-4" />
                    Spending trends
                  </Link>
                  <Link href="/chart" className="navigation-card">
                    <FiCompass className="h-4 w-4" />
                    Data stories
                  </Link>
                  <div className="navigation-card muted">
                    <FiLayers className="h-4 w-4" />
                    Budget templates
                  </div>
                  <div className="navigation-card muted">
                    <FiActivity className="h-4 w-4" />
                    Live dashboards
                  </div>
                </div>
              </div>

              <div className="material-surface rounded-3xl border shadow-elevated p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="icon-pill bg-primary-500/15 text-primary-600">
                    <FiCompass className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Feature drops</p>
                    <p className="text-base font-semibold text-text-primary">What feels Googley</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="list-tile">Context-aware theming that follows Material You dynamic color.</li>
                  <li className="list-tile">Responsive, card-driven layout inspired by Workspace surfaces.</li>
                  <li className="list-tile">Clear entry points into analytics, uploads, and admin tooling.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Admin-only Theme Test Component */}
          {session?.user?.email === "harshsuhith@gmail.com" && (
            <div className="material-surface rounded-3xl border shadow-elevated p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-pill bg-accent-500/15 text-accent-600">
                  <span className="text-sm font-bold">⚙️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Admin tools</h3>
                  <p className="text-sm text-text-tertiary">Theme testing and development controls</p>
                </div>
              </div>
              <ThemeTest />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
