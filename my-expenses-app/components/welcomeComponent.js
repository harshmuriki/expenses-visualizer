"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FiTrendingUp, FiDollarSign, FiPieChart, FiZap, FiShield, FiCpu, FiArrowRight, FiCheck, FiUploadCloud, FiBarChart2 } from "react-icons/fi";
import { useTheme } from "@/lib/theme-context";

function WelcomeComponent() {
    const [showWarning, setShowWarning] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const { theme, themeName } = useTheme();
    const isLightTheme = themeName === 'cherryBlossom' || themeName === 'nordic';

    const handleSignIn = () => {
        setShowWarning(true);
    };

    const handleAccept = async () => {
        setShowWarning(false);
        setIsSigningIn(true);
        try {
            await signIn('google', {
                callbackUrl: '/',
                redirect: true
            });
        } catch (error) {
            console.error('Sign-in error:', error);
            setIsSigningIn(false);
        }
    };

    const handleCancel = () => {
        setShowWarning(false);
    };

    const features = [
        {
            icon: <FiCpu className="w-6 h-6" />,
            title: "AI-Powered Categorization",
            description: "Smart algorithms automatically organize your transactions into meaningful categories"
        },
        {
            icon: <FiPieChart className="w-6 h-6" />,
            title: "Interactive Visualizations",
            description: "Explore your spending with beautiful treemaps, charts, and calendar views"
        },
        {
            icon: <FiTrendingUp className="w-6 h-6" />,
            title: "Multi-Month Insights",
            description: "Track trends over time and discover patterns in your spending behavior"
        },
        {
            icon: <FiZap className="w-6 h-6" />,
            title: "Real-Time Analysis",
            description: "Get instant insights and anomaly detection powered by advanced AI"
        },
        {
            icon: <FiDollarSign className="w-6 h-6" />,
            title: "Multiple LLM Support",
            description: "Choose from OpenAI, Claude, or run locally with Ollama and LM Studio"
        },
        {
            icon: <FiShield className="w-6 h-6" />,
            title: "Your Data, Your Control",
            description: "Self-host option available for complete privacy and data ownership"
        }
    ];

    const steps = [
        {
            icon: <FiUploadCloud className="w-12 h-12" />,
            title: "Upload & Connect",
            description: "Drop your bank statements (CSV/PDF) for automatic processing",
            highlight: "Supports major banks"
        },
        {
            icon: <FiCpu className="w-12 h-12" />,
            title: "AI Categorization",
            description: "Our AI intelligently sorts every transaction in seconds",
            highlight: "99% accuracy"
        },
        {
            icon: <FiBarChart2 className="w-12 h-12" />,
            title: "Visualize & Optimize",
            description: "Interactive dashboards reveal where your money goes",
            highlight: "Make informed decisions"
        }
    ];

    const stats = [
        { value: "5+", label: "LLM Providers" },
        { value: "100%", label: "Locally hosted & Open Source" },
        { value: "∞", label: "Transactions" },
        { value: "0", label: "Hidden Fees" }
    ];

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.background.primary }}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
                    style={{ background: `radial-gradient(circle, ${theme.primary[500]}, transparent)` }}></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
                    style={{ background: `radial-gradient(circle, ${theme.secondary[500]}, transparent)`, animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
                    style={{ background: `radial-gradient(circle, ${theme.accent[500]}, transparent)` }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="pt-20 pb-16 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border-2 transition-all hover:scale-105"
                        style={{
                            backgroundColor: `${theme.primary[500]}15`,
                            borderColor: `${theme.primary[500]}40`
                        }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.semantic.success }}></div>
                        <span className="text-sm font-semibold" style={{ color: theme.text.primary }}>
                            Open Source • Self-Hostable • Privacy-First
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ color: theme.text.primary }}>
                        Stop Guessing Where
                        <br />
                        <span className="relative inline-block mt-2">
                            <span style={{
                                background: `linear-gradient(to right, ${theme.primary[500]}, ${theme.secondary[500]}, ${theme.accent[500]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Your Money Goes
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 10C50 2 100 2 150 6C200 10 250 10 298 6" stroke={theme.accent[500]} strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                            </svg>
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: theme.text.secondary }}>
                        Upload your statements, let AI categorize everything, and discover spending patterns you never knew existed.
                        <span className="font-semibold" style={{ color: theme.text.primary }}> No spreadsheets, no manual entry, no hassle.</span>
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={handleSignIn}
                        disabled={isSigningIn}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{
                            background: isLightTheme
                                ? `linear-gradient(135deg, ${theme.primary[700]}, ${theme.secondary[700]})`
                                : `linear-gradient(135deg, ${theme.primary[500]}, ${theme.secondary[500]})`,
                            color: 'white'
                        }}
                    >
                        {isSigningIn ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Get Started with Google</span>
                                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="mt-4 text-sm" style={{ color: theme.text.tertiary }}>
                        Free to use • No credit card required • 2-minute setup
                    </p>

                    {/* Stats Bar */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-black mb-2" style={{
                                    background: `linear-gradient(135deg, ${theme.primary[500]}, ${theme.secondary[500]})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium" style={{ color: theme.text.secondary }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: theme.text.primary }}>
                            From Upload to Insights in <span style={{ color: theme.primary[500] }}>3 Steps</span>
                        </h2>
                        <p className="text-lg" style={{ color: theme.text.secondary }}>
                            No manual work. No data entry. Just pure insights.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {steps.map((step, index) => (
                            <div key={index} className="relative group">
                                <div className="rounded-3xl p-8 h-full border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                                    style={{
                                        backgroundColor: theme.background.card,
                                        borderColor: index === 0 ? theme.primary[500] : index === 1 ? theme.secondary[500] : theme.accent[500]
                                    }}>
                                    {/* Step Number */}
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 font-black text-lg"
                                        style={{
                                            backgroundColor: `${index === 0 ? theme.primary[500] : index === 1 ? theme.secondary[500] : theme.accent[500]}20`,
                                            color: index === 0 ? theme.primary[500] : index === 1 ? theme.secondary[500] : theme.accent[500]
                                        }}>
                                        {index + 1}
                                    </div>

                                    {/* Icon */}
                                    <div className="mb-6" style={{ color: index === 0 ? theme.primary[500] : index === 1 ? theme.secondary[500] : theme.accent[500] }}>
                                        {step.icon}
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold mb-3" style={{ color: theme.text.primary }}>
                                        {step.title}
                                    </h3>
                                    <p className="text-base mb-4 leading-relaxed" style={{ color: theme.text.secondary }}>
                                        {step.description}
                                    </p>

                                    {/* Highlight Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: `${index === 0 ? theme.primary[500] : index === 1 ? theme.secondary[500] : theme.accent[500]}15`,
                                            color: index === 0 ? theme.primary[500] : index === 1 ? theme.secondary[500] : theme.accent[500]
                                        }}>
                                        <FiCheck className="w-3 h-3" />
                                        {step.highlight}
                                    </div>
                                </div>

                                {/* Arrow Connector (hidden on mobile) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                                        <FiArrowRight className="w-8 h-8" style={{ color: theme.border.secondary }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: theme.text.primary }}>
                            Built for Power Users
                        </h2>
                        <p className="text-lg" style={{ color: theme.text.secondary }}>
                            Everything you need to understand and optimize your finances
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <div key={index} className="rounded-2xl p-6 border-2 transition-all hover:scale-105 hover:shadow-xl"
                                style={{
                                    backgroundColor: theme.background.card,
                                    borderColor: theme.border.secondary
                                }}>
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                                    style={{
                                        backgroundColor: `${theme.primary[500]}15`,
                                        color: theme.primary[500]
                                    }}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: theme.text.primary }}>
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="py-20 text-center">
                    <div className="rounded-3xl p-12 max-w-4xl mx-auto border-2"
                        style={{
                            backgroundColor: theme.background.card,
                            borderColor: theme.primary[500]
                        }}>
                        <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ color: theme.text.primary }}>
                            Ready to Take Control?
                        </h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: theme.text.secondary }}>
                            Join users who&apos;ve already transformed how they track expenses. Start making smarter financial decisions today.
                        </p>
                        <button
                            onClick={handleSignIn}
                            disabled={isSigningIn}
                            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transform transition-all hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
                            style={{
                                background: isLightTheme
                                    ? `linear-gradient(135deg, ${theme.primary[700]}, ${theme.secondary[700]})`
                                    : `linear-gradient(135deg, ${theme.primary[500]}, ${theme.secondary[500]})`,
                                color: 'white'
                            }}
                        >
                            {isSigningIn ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <FiZap className="w-5 h-5" />
                                    <span>Start Free Now</span>
                                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="pb-12 text-center">
                    <p className="text-sm" style={{ color: theme.text.tertiary }}>
                        Open source • Self-hostable • Privacy-focused • Built with ❤️
                    </p>
                </div>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
                    <div className="rounded-3xl p-8 w-full max-w-md shadow-2xl border-2"
                        style={{
                            backgroundColor: theme.background.card,
                            borderColor: theme.border.secondary
                        }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${theme.semantic.info}20` }}>
                                <FiShield className="w-6 h-6" style={{ color: theme.semantic.info }} />
                            </div>
                            <h3 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                                Before You Continue
                            </h3>
                        </div>

                        <div className="mb-6">
                            <p className="mb-4 leading-relaxed" style={{ color: theme.text.secondary }}>
                                This application processes your financial data using third-party services. Here&apos;s what you should know:
                            </p>

                            <div className="space-y-3 mb-4">
                                <div className="flex gap-3">
                                    <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.semantic.success }} />
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: theme.text.primary }}>Only Transaction Data</p>
                                        <p className="text-sm" style={{ color: theme.text.secondary }}>We only need transaction amounts, dates, and merchant names. No personal information, account numbers, addresses, or SSNs are required or uploaded.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.primary[500] }} />
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: theme.text.primary }}>Data Storage</p>
                                        <p className="text-sm" style={{ color: theme.text.secondary }}>Your transactions are stored in Firebase (Google Cloud)</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.primary[500] }} />
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: theme.text.primary }}>AI Processing</p>
                                        <p className="text-sm" style={{ color: theme.text.secondary }}>Transaction categorization uses configurable LLM providers (OpenAI, Anthropic, or local models)</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.primary[500] }} />
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: theme.text.primary }}>Your Control</p>
                                        <p className="text-sm" style={{ color: theme.text.secondary }}>Self-hosting option available on GitHub for complete data ownership</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl p-4 mb-6 border-2" style={{
                            backgroundColor: `${theme.semantic.warning}10`,
                            borderColor: `${theme.semantic.warning}40`
                        }}>
                            <div className="flex gap-2 mb-2">
                                <FiShield className="w-5 h-5 flex-shrink-0" style={{ color: theme.semantic.warning }} />
                                <p className="font-bold text-sm" style={{ color: theme.text.primary }}>Important</p>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: theme.text.secondary }}>
                                While we implement security best practices, no system is 100% secure. For sensitive financial data, we strongly recommend <span className="font-semibold" style={{ color: theme.text.primary }}>self-hosting this application</span>. Setup instructions are available in the GitHub repository.
                            </p>
                        </div>

                        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: `${theme.primary[500]}10` }}>
                            <p className="text-sm" style={{ color: theme.text.secondary }}>
                                <strong style={{ color: theme.text.primary }}>By continuing:</strong> You acknowledge that your data will be processed by third-party services (Firebase, your chosen LLM provider) and accept responsibility for your data security decisions. You can delete your data at any time.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all border-2"
                                style={{
                                    backgroundColor: theme.background.secondary,
                                    borderColor: theme.border.secondary,
                                    color: theme.text.primary
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={isSigningIn}
                                className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                                style={{
                                    background: isLightTheme
                                        ? `linear-gradient(135deg, ${theme.primary[700]}, ${theme.secondary[700]})`
                                        : `linear-gradient(135deg, ${theme.primary[500]}, ${theme.secondary[500]})`,
                                    color: 'white'
                                }}
                            >
                                {isSigningIn ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'I Understand'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WelcomeComponent;
