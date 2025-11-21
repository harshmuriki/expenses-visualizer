"use client";

import React, { useState } from 'react';
import { M3Button, M3Card, M3FAB, M3Input, M3Chip } from '@/components/m3';
import { FiPlus, FiUpload, FiSettings, FiTrendingUp, FiDollarSign, FiPieChart, FiCalendar, FiFilter, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function M3DemoPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedChip, setSelectedChip] = useState(0);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  // Mock expense data
  const mockExpenses = [
    { category: 'Groceries', amount: 524.32, count: 12, color: 'var(--md-sys-color-primary)' },
    { category: 'Transportation', amount: 345.80, count: 8, color: 'var(--md-sys-color-secondary)' },
    { category: 'Entertainment', amount: 198.50, count: 5, color: 'var(--md-sys-color-tertiary)' },
    { category: 'Utilities', amount: 287.00, count: 3, color: 'var(--md-sys-color-primary-container)' },
  ];

  const totalSpending = mockExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  return (
    <div className="min-h-screen m3-surface" style={{ backgroundColor: 'var(--md-sys-color-background)' }}>
      {/* Top App Bar - Material 3 Style */}
      <header className="sticky top-0 z-50 m3-surface-container" style={{
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)'
              }}>
                <FiDollarSign size={24} />
              </div>
              <h1 className="m3-title-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                Expense Tracker
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <M3Button variant="text" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </M3Button>
              <M3Button variant="outlined" icon={<FiSettings />}>
                Settings
              </M3Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="m3-display-small mb-4" style={{ color: 'var(--md-sys-color-on-background)' }}>
              Material 3 Design System
            </h2>
            <p className="m3-body-large max-w-2xl mx-auto" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Experience Google Pixel's Material You design language. Clean, modern, and beautifully functional.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-in-up">
            <M3Card variant="elevated" className="p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <span className="m3-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  TOTAL SPENDING
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)'
                }}>
                  <FiDollarSign size={20} />
                </div>
              </div>
              <div className="m3-headline-medium m3-number" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                ${totalSpending.toFixed(2)}
              </div>
              <p className="m3-body-small mt-2" style={{ color: 'var(--md-sys-color-tertiary)' }}>
                +12.3% from last month
              </p>
            </M3Card>

            <M3Card variant="elevated" className="p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <span className="m3-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  TRANSACTIONS
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                  backgroundColor: 'var(--md-sys-color-secondary-container)',
                  color: 'var(--md-sys-color-on-secondary-container)'
                }}>
                  <FiPieChart size={20} />
                </div>
              </div>
              <div className="m3-headline-medium m3-number" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                {mockExpenses.reduce((acc, exp) => acc + exp.count, 0)}
              </div>
              <p className="m3-body-small mt-2" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Across {mockExpenses.length} categories
              </p>
            </M3Card>

            <M3Card variant="elevated" className="p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <span className="m3-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  AVG PER DAY
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                  backgroundColor: 'var(--md-sys-color-tertiary-container)',
                  color: 'var(--md-sys-color-on-tertiary-container)'
                }}>
                  <FiTrendingUp size={20} />
                </div>
              </div>
              <div className="m3-headline-medium m3-number" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                ${(totalSpending / 30).toFixed(2)}
              </div>
              <p className="m3-body-small mt-2" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Based on 30 days
              </p>
            </M3Card>

            <M3Card variant="elevated" className="p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <span className="m3-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  CATEGORIES
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                  backgroundColor: 'var(--md-sys-color-error-container)',
                  color: 'var(--md-sys-color-on-error-container)'
                }}>
                  <FiFilter size={20} />
                </div>
              </div>
              <div className="m3-headline-medium m3-number" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                {mockExpenses.length}
              </div>
              <p className="m3-body-small mt-2" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Active this month
              </p>
            </M3Card>
          </div>
        </section>

        {/* Filter Chips */}
        <section className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="m3-label-large" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              View:
            </span>
            {['All', 'This Month', 'Last Month', 'This Year'].map((label, index) => (
              <M3Chip
                key={label}
                selected={selectedChip === index}
                onClick={() => setSelectedChip(index)}
              >
                {label}
              </M3Chip>
            ))}
          </div>
        </section>

        {/* Component Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Buttons Showcase */}
          <M3Card variant="outlined" className="p-8">
            <h3 className="m3-headline-small mb-6" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Buttons
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <M3Button variant="filled" icon={<FiPlus />}>
                  Add Transaction
                </M3Button>
                <M3Button variant="filled-tonal" icon={<FiUpload />}>
                  Upload CSV
                </M3Button>
                <M3Button variant="outlined" icon={<FiDownload />}>
                  Export Data
                </M3Button>
                <M3Button variant="text" icon={<FiCalendar />}>
                  Calendar
                </M3Button>
              </div>
            </div>
          </M3Card>

          {/* Inputs Showcase */}
          <M3Card variant="outlined" className="p-8">
            <h3 className="m3-headline-small mb-6" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Input Fields
            </h3>
            <div className="space-y-4">
              <M3Input
                variant="filled"
                label="Transaction Name"
                placeholder="e.g., Coffee at Starbucks"
              />
              <M3Input
                variant="outlined"
                label="Amount"
                type="number"
                placeholder="0.00"
              />
            </div>
          </M3Card>

          {/* Category List */}
          <M3Card variant="filled" className="p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="m3-headline-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                Spending by Category
              </h3>
              <M3Button variant="text" icon={<FiFilter />}>
                Filter
              </M3Button>
            </div>

            <div className="space-y-3">
              {mockExpenses.map((expense, index) => (
                <div
                  key={expense.category}
                  className="stagger-item flex items-center justify-between p-4 rounded-xl hover:scale-[1.01] transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: expense.color,
                        opacity: 0.2
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg"
                        style={{ backgroundColor: expense.color }}
                      />
                    </div>
                    <div>
                      <div className="m3-title-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                        {expense.category}
                      </div>
                      <div className="m3-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {expense.count} transactions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="m3-title-large m3-number" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                        ${expense.amount.toFixed(2)}
                      </div>
                      <div className="m3-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {((expense.amount / totalSpending) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-full hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: 'var(--md-sys-color-surface-container-highest)',
                          color: 'var(--md-sys-color-on-surface-variant)'
                        }}
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        className="p-2 rounded-full hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: 'var(--md-sys-color-error-container)',
                          color: 'var(--md-sys-color-on-error-container)'
                        }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </M3Card>
        </div>

        {/* Typography Showcase */}
        <M3Card variant="elevated" className="p-8 mb-8">
          <h3 className="m3-headline-small mb-6" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            Typography Scale
          </h3>
          <div className="space-y-4">
            <div className="m3-display-small" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Display Small - Your Monthly Summary
            </div>
            <div className="m3-headline-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Headline Large - Featured Category
            </div>
            <div className="m3-title-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Title Large - Card Header
            </div>
            <div className="m3-body-large" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div className="m3-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              LABEL MEDIUM - BUTTON TEXT
            </div>
          </div>
        </M3Card>

        {/* Color Palette */}
        <M3Card variant="outlined" className="p-8">
          <h3 className="m3-headline-small mb-6" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            Color System
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Primary', bg: 'var(--md-sys-color-primary)', text: 'var(--md-sys-color-on-primary)' },
              { name: 'Secondary', bg: 'var(--md-sys-color-secondary)', text: 'var(--md-sys-color-on-secondary)' },
              { name: 'Tertiary', bg: 'var(--md-sys-color-tertiary)', text: 'var(--md-sys-color-on-tertiary)' },
              { name: 'Error', bg: 'var(--md-sys-color-error)', text: 'var(--md-sys-color-on-error)' },
            ].map((color) => (
              <div key={color.name} className="space-y-2">
                <div
                  className="h-24 rounded-xl flex items-center justify-center m3-title-medium"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {color.name}
                </div>
                <div className="m3-body-small text-center" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {color.name}
                </div>
              </div>
            ))}
          </div>
        </M3Card>
      </main>

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <M3FAB
          icon={<FiPlus />}
          label="Add Transaction"
          extended
        />
      </div>
    </div>
  );
}
