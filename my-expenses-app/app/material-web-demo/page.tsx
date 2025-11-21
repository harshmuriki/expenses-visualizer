"use client";

import { useEffect, useState } from 'react';

// Import Material Web Components
// These are web components and will be registered globally
if (typeof window !== 'undefined') {
  // Import only on client side
  import('@material/web/button/filled-button.js');
  import('@material/web/button/outlined-button.js');
  import('@material/web/button/text-button.js');
  import('@material/web/button/filled-tonal-button.js');
  import('@material/web/fab/fab.js');
  import('@material/web/checkbox/checkbox.js');
  import('@material/web/radio/radio.js');
  import('@material/web/switch/switch.js');
  import('@material/web/textfield/filled-text-field.js');
  import('@material/web/textfield/outlined-text-field.js');
  import('@material/web/chips/chip-set.js');
  import('@material/web/chips/filter-chip.js');
  import('@material/web/chips/assist-chip.js');
  import('@material/web/divider/divider.js');
  import('@material/web/slider/slider.js');
  import('@material/web/progress/circular-progress.js');
  import('@material/web/progress/linear-progress.js');
  import('@material/web/icon/icon.js');
}

export default function MaterialWebDemo() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [sliderValue, setSliderValue] = useState(50);
  const [totalSpending] = useState(1355.62);
  const [checked, setChecked] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const mockCategories = [
    { name: 'Groceries', amount: 524.32, percentage: 38.7 },
    { name: 'Transportation', amount: 345.80, percentage: 25.5 },
    { name: 'Entertainment', amount: 285.50, percentage: 21.1 },
    { name: 'Utilities', amount: 200.00, percentage: 14.7 },
  ];

  return (
    <div className="min-h-screen" style={{
      backgroundColor: 'var(--md-sys-color-background)',
      color: 'var(--md-sys-color-on-background)'
    }}>
      {/* Top App Bar */}
      <header className="sticky top-0 z-50" style={{
        backgroundColor: 'var(--md-sys-color-surface-container)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)'
              }}>
                💰
              </div>
              <h1 className="md-typescale-title-large">Material Web Demo</h1>
            </div>

            <div className="flex items-center gap-3">
              <md-text-button onClick={toggleTheme}>
                {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </md-text-button>
              <md-outlined-button>
                Settings
              </md-outlined-button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="md-typescale-display-small mb-4">
              Material Web Components
            </h2>
            <p className="md-typescale-body-large mx-auto max-w-2xl" style={{
              color: 'var(--md-sys-color-on-surface-variant)'
            }}>
              Official Google Material Design 3 web components built with Lit. Real components, not wrappers.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Spending', value: `$${totalSpending.toFixed(2)}`, icon: '💳', trend: '+12.3%' },
              { label: 'Transactions', value: '28', icon: '📊', trend: '4 categories' },
              { label: 'Avg Per Day', value: `$${(totalSpending / 30).toFixed(2)}`, icon: '📈', trend: 'Last 30 days' },
              { label: 'Categories', value: '4', icon: '🏷️', trend: 'Active' },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-low)',
                  boxShadow: 'var(--md-sys-elevation-level1)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="md-typescale-label-medium" style={{
                    color: 'var(--md-sys-color-on-surface-variant)'
                  }}>
                    {stat.label.toUpperCase()}
                  </span>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="md-typescale-headline-medium mb-2 font-mono">
                  {stat.value}
                </div>
                <p className="md-typescale-body-small" style={{
                  color: 'var(--md-sys-color-tertiary)'
                }}>
                  {stat.trend}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons Showcase */}
        <section className="mb-12">
          <div className="p-8 rounded-xl" style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h3 className="md-typescale-headline-small mb-6">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <md-filled-button>Filled Button</md-filled-button>
              <md-filled-tonal-button>Filled Tonal</md-filled-tonal-button>
              <md-outlined-button>Outlined</md-outlined-button>
              <md-text-button>Text Button</md-text-button>
            </div>
          </div>
        </section>

        {/* Text Fields */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl" style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)'
            }}>
              <h3 className="md-typescale-headline-small mb-6">Filled Text Fields</h3>
              <div className="space-y-4">
                <md-filled-text-field
                  label="Transaction Name"
                  placeholder="e.g., Coffee at Starbucks"
                  style={{ width: '100%' }}
                />
                <md-filled-text-field
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  prefix-text="$"
                  style={{ width: '100%' }}
                />
                <md-filled-text-field
                  label="Category"
                  supporting-text="Choose or create a category"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="p-8 rounded-xl" style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)'
            }}>
              <h3 className="md-typescale-headline-small mb-6">Outlined Text Fields</h3>
              <div className="space-y-4">
                <md-outlined-text-field
                  label="Merchant"
                  placeholder="e.g., Amazon"
                  style={{ width: '100%' }}
                />
                <md-outlined-text-field
                  label="Date"
                  type="date"
                  style={{ width: '100%' }}
                />
                <md-outlined-text-field
                  label="Notes"
                  type="textarea"
                  rows={3}
                  supporting-text="Optional transaction notes"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Selection Controls */}
        <section className="mb-12">
          <div className="p-8 rounded-xl" style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h3 className="md-typescale-headline-small mb-6">Selection Controls</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Checkboxes */}
              <div>
                <h4 className="md-typescale-title-medium mb-4">Checkboxes</h4>
                <div className="space-y-3">
                  {['Show recurring', 'Include pending', 'Hide small amounts'].map((label) => (
                    <div key={label} className="flex items-center gap-3">
                      <md-checkbox />
                      <span className="md-typescale-body-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radio Buttons */}
              <div>
                <h4 className="md-typescale-title-medium mb-4">Radio Buttons</h4>
                <div className="space-y-3">
                  {['This month', 'Last month', 'This year'].map((label) => (
                    <div key={label} className="flex items-center gap-3">
                      <md-radio name="period" value={label.toLowerCase()} />
                      <span className="md-typescale-body-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switches */}
              <div>
                <h4 className="md-typescale-title-medium mb-4">Switches</h4>
                <div className="space-y-3">
                  {['Notifications', 'Auto-categorize', 'Dark mode'].map((label) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="md-typescale-body-medium">{label}</span>
                      <md-switch />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Chips */}
        <section className="mb-12">
          <div className="p-8 rounded-xl" style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h3 className="md-typescale-headline-small mb-6">Filter Chips</h3>
            <div className="flex flex-wrap gap-3">
              <md-filter-chip label="All" selected />
              <md-filter-chip label="Groceries" />
              <md-filter-chip label="Transportation" />
              <md-filter-chip label="Entertainment" />
              <md-filter-chip label="Utilities" />
              <md-assist-chip label="Add Filter" />
            </div>
          </div>
        </section>

        {/* Slider & Progress */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl" style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)'
            }}>
              <h3 className="md-typescale-headline-small mb-6">Slider</h3>
              <div className="mb-4">
                <p className="md-typescale-body-medium mb-2">Budget Allocation</p>
                <md-slider
                  min={0}
                  max={100}
                  value={sliderValue}
                  labeled
                  style={{ width: '100%' }}
                  onInput={(e: any) => setSliderValue(e.target.value)}
                />
                <p className="md-typescale-body-small mt-2" style={{
                  color: 'var(--md-sys-color-on-surface-variant)'
                }}>
                  Current: {sliderValue}%
                </p>
              </div>
            </div>

            <div className="p-8 rounded-xl" style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              border: '1px solid var(--md-sys-color-outline-variant)'
            }}>
              <h3 className="md-typescale-headline-small mb-6">Progress Indicators</h3>
              <div className="space-y-6">
                <div>
                  <p className="md-typescale-body-medium mb-2">Linear Progress</p>
                  <md-linear-progress value={0.7} style={{ width: '100%' }} />
                </div>
                <div className="flex items-center gap-4">
                  <p className="md-typescale-body-medium">Circular Progress</p>
                  <md-circular-progress value={0.65} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category List with Material Web styling */}
        <section className="mb-12">
          <div className="p-8 rounded-xl" style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="md-typescale-headline-small">Spending by Category</h3>
              <md-text-button>View All</md-text-button>
            </div>

            <div className="space-y-3">
              {mockCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `var(--md-sys-color-${index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'tertiary' : 'error'}-container)`,
                        color: `var(--md-sys-color-on-${index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'tertiary' : 'error'}-container)`,
                      }}
                    >
                      {['🛒', '🚗', '🎬', '⚡'][index]}
                    </div>
                    <div>
                      <div className="md-typescale-title-medium">{category.name}</div>
                      <div className="md-typescale-body-small" style={{
                        color: 'var(--md-sys-color-on-surface-variant)'
                      }}>
                        {category.percentage}% of total
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="md-typescale-title-large font-mono">
                      ${category.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider Demo */}
        <md-divider className="my-8" />

        {/* Typography Scale */}
        <section className="mb-12">
          <div className="p-8 rounded-xl" style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--md-sys-color-outline-variant)'
          }}>
            <h3 className="md-typescale-headline-small mb-6">Typography Scale</h3>
            <div className="space-y-4">
              <div className="md-typescale-display-small">Display Small</div>
              <div className="md-typescale-headline-large">Headline Large</div>
              <div className="md-typescale-title-large">Title Large</div>
              <div className="md-typescale-body-large" style={{
                color: 'var(--md-sys-color-on-surface-variant)'
              }}>
                Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Material Design 3 provides a clear, systematic approach to typography.
              </div>
              <div className="md-typescale-label-medium" style={{
                color: 'var(--md-sys-color-on-surface-variant)'
              }}>
                LABEL MEDIUM - SUPPORTING TEXT
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6">
        <md-fab label="Add Transaction">
          <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </md-fab>
      </div>
    </div>
  );
}
