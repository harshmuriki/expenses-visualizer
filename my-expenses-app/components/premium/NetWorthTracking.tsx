"use client";

import React, { useState, useEffect } from "react";
import { netWorthUtils } from "@/lib/premiumFeatures";
import { Asset, Liability, NetWorthSnapshot, NetWorthSummary } from "@/app/types/types";
import { FiTrendingUp, FiPlus, FiX, FiEdit2, FiCamera, FiPieChart } from "react-icons/fi";
import PremiumModal from "./PremiumModal";
import { useToast, ToastContainer } from "./Toast";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface NetWorthTrackingProps {
  userId: string;
}

const NetWorthTracking: React.FC<NetWorthTrackingProps> = ({ userId }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"overview" | "assets" | "liabilities" | "history">("overview");

  // Modal states
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  // Asset form
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<Asset["type"]>("checking");
  const [assetValue, setAssetValue] = useState("");
  const [assetInstitution, setAssetInstitution] = useState("");
  const [assetNotes, setAssetNotes] = useState("");

  // Liability form
  const [liabilityName, setLiabilityName] = useState("");
  const [liabilityType, setLiabilityType] = useState<Liability["type"]>("credit_card");
  const [liabilityBalance, setLiabilityBalance] = useState("");
  const [liabilityRate, setLiabilityRate] = useState("");
  const [liabilityInstitution, setLiabilityInstitution] = useState("");
  const [liabilityNotes, setLiabilityNotes] = useState("");

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [assetsData, liabilitiesData, snapshotsData] = await Promise.all([
        netWorthUtils.getAssets(userId),
        netWorthUtils.getLiabilities(userId),
        netWorthUtils.getNetWorthHistory(userId, 12),
      ]);
      setAssets(assetsData);
      setLiabilities(liabilitiesData);
      setSnapshots(snapshotsData);

      const summaryData = netWorthUtils.calculateNetWorthSummary(assetsData, liabilitiesData, snapshotsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading net worth data:", error);
      addToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await netWorthUtils.createAsset({
        userId,
        name: assetName,
        type: assetType,
        currentValue: parseFloat(assetValue),
        institution: assetInstitution || undefined,
        notes: assetNotes || undefined,
      });
      addToast("Asset added successfully!", "success");
      setShowAssetModal(false);
      resetAssetForm();
      await loadAllData();
    } catch (error) {
      console.error("Error creating asset:", error);
      addToast("Failed to add asset", "error");
    }
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      await netWorthUtils.updateAssetValue(editingAsset.id, parseFloat(assetValue));
      addToast("Asset updated successfully!", "success");
      setShowAssetModal(false);
      setEditingAsset(null);
      resetAssetForm();
      await loadAllData();
    } catch (error) {
      console.error("Error updating asset:", error);
      addToast("Failed to update asset", "error");
    }
  };

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (!confirm(`Delete ${assetName}?`)) return;

    try {
      await netWorthUtils.deleteAsset(assetId);
      addToast("Asset deleted", "success");
      await loadAllData();
    } catch (error) {
      console.error("Error deleting asset:", error);
      addToast("Failed to delete asset", "error");
    }
  };

  const handleCreateLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await netWorthUtils.createLiability({
        userId,
        name: liabilityName,
        type: liabilityType,
        currentBalance: parseFloat(liabilityBalance),
        interestRate: liabilityRate ? parseFloat(liabilityRate) : undefined,
        institution: liabilityInstitution || undefined,
        notes: liabilityNotes || undefined,
      });
      addToast("Liability added successfully!", "success");
      setShowLiabilityModal(false);
      resetLiabilityForm();
      await loadAllData();
    } catch (error) {
      console.error("Error creating liability:", error);
      addToast("Failed to add liability", "error");
    }
  };

  const handleUpdateLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLiability) return;

    try {
      await netWorthUtils.updateLiabilityBalance(editingLiability.id, parseFloat(liabilityBalance));
      addToast("Liability updated successfully!", "success");
      setShowLiabilityModal(false);
      setEditingLiability(null);
      resetLiabilityForm();
      await loadAllData();
    } catch (error) {
      console.error("Error updating liability:", error);
      addToast("Failed to update liability", "error");
    }
  };

  const handleDeleteLiability = async (liabilityId: string, liabilityName: string) => {
    if (!confirm(`Delete ${liabilityName}?`)) return;

    try {
      await netWorthUtils.deleteLiability(liabilityId);
      addToast("Liability deleted", "success");
      await loadAllData();
    } catch (error) {
      console.error("Error deleting liability:", error);
      addToast("Failed to delete liability", "error");
    }
  };

  const handleTakeSnapshot = async () => {
    try {
      await netWorthUtils.takeSnapshot(userId, assets, liabilities);
      addToast("Snapshot saved!", "success");
      await loadAllData();
    } catch (error) {
      console.error("Error taking snapshot:", error);
      addToast("Failed to save snapshot", "error");
    }
  };

  const openEditAssetModal = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetType(asset.type);
    setAssetValue(asset.currentValue.toString());
    setAssetInstitution(asset.institution || "");
    setAssetNotes(asset.notes || "");
    setShowAssetModal(true);
  };

  const openEditLiabilityModal = (liability: Liability) => {
    setEditingLiability(liability);
    setLiabilityName(liability.name);
    setLiabilityType(liability.type);
    setLiabilityBalance(liability.currentBalance.toString());
    setLiabilityRate(liability.interestRate?.toString() || "");
    setLiabilityInstitution(liability.institution || "");
    setLiabilityNotes(liability.notes || "");
    setShowLiabilityModal(true);
  };

  const resetAssetForm = () => {
    setAssetName("");
    setAssetType("checking");
    setAssetValue("");
    setAssetInstitution("");
    setAssetNotes("");
    setEditingAsset(null);
  };

  const resetLiabilityForm = () => {
    setLiabilityName("");
    setLiabilityType("credit_card");
    setLiabilityBalance("");
    setLiabilityRate("");
    setLiabilityInstitution("");
    setLiabilityNotes("");
    setEditingLiability(null);
  };

  const getAssetTypeIcon = (type: Asset["type"]) => {
    const icons = {
      checking: "🏦",
      savings: "💰",
      investment: "📈",
      property: "🏠",
      vehicle: "🚗",
      crypto: "₿",
      other: "💼",
    };
    return icons[type];
  };

  const getLiabilityTypeIcon = (type: Liability["type"]) => {
    const icons = {
      credit_card: "💳",
      student_loan: "🎓",
      auto_loan: "🚙",
      mortgage: "🏡",
      personal_loan: "💵",
      other: "📋",
    };
    return icons[type];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  };

  // Prepare chart data
  const historyChartData = snapshots.map((snapshot) => ({
    date: new Date(snapshot.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    netWorth: snapshot.netWorth,
    assets: snapshot.totalAssets,
    liabilities: snapshot.totalLiabilities,
  })).reverse();

  const assetAllocationData = assets.map((asset) => ({
    name: `${asset.name} (${asset.type})`,
    value: asset.currentValue,
  }));

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-border-primary border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-text-secondary">Loading net worth data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header with Summary */}
      <div className="bg-background-card border border-border-secondary rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Net Worth</h2>
            <p className="text-text-secondary">Track your financial health</p>
          </div>
          <button onClick={handleTakeSnapshot} className="btn-primary flex items-center gap-2">
            <FiCamera className="w-5 h-5" />
            Take Snapshot
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Net Worth</p>
              <p className="text-3xl font-bold text-emerald-500">{formatCurrency(summary.currentNetWorth)}</p>
              {summary.monthlyChange !== 0 && (
                <p className={`text-sm mt-2 ${summary.monthlyChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {summary.monthlyChange > 0 ? "↑" : "↓"} {Math.abs(summary.monthlyChangePercentage).toFixed(1)}% this month
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Total Assets</p>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(summary.totalAssets)}</p>
              <p className="text-sm text-text-tertiary mt-2">{assets.length} accounts</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Total Liabilities</p>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(summary.totalLiabilities)}</p>
              <p className="text-sm text-text-tertiary mt-2">{liabilities.length} accounts</p>
            </div>
            <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-5">
              <p className="text-text-tertiary text-sm font-semibold mb-2">Yearly Change</p>
              <p className={`text-3xl font-bold ${summary.yearlyChange > 0 ? "text-emerald-500" : "text-red-500"}`}>
                {summary.yearlyChange > 0 ? "+" : ""}{summary.yearlyChangePercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-text-tertiary mt-2">{formatCurrency(Math.abs(summary.yearlyChange))}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Overview", icon: FiTrendingUp },
          { id: "assets", label: "Assets", icon: FiPlus },
          { id: "liabilities", label: "Liabilities", icon: FiX },
          { id: "history", label: "History", icon: FiPieChart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeView === tab.id
                ? "bg-primary-500 text-white shadow-lg"
                : "bg-background-secondary text-text-secondary hover:bg-background-tertiary"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {historyChartData.length > 0 && (
            <div className="bg-background-card border border-border-secondary rounded-2xl p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Net Worth Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#e5e7eb" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={3} name="Net Worth" />
                  <Line type="monotone" dataKey="assets" stroke="#3b82f6" strokeWidth={2} name="Assets" />
                  <Line type="monotone" dataKey="liabilities" stroke="#ef4444" strokeWidth={2} name="Liabilities" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {assetAllocationData.length > 0 && (
            <div className="bg-background-card border border-border-secondary rounded-2xl p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Asset Allocation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Assets Tab */}
      {activeView === "assets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-text-primary">Assets</h3>
            <button onClick={() => { resetAssetForm(); setShowAssetModal(true); }} className="btn-primary flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              Add Asset
            </button>
          </div>

          {assets.length === 0 ? (
            <div className="bg-background-card border border-border-secondary rounded-2xl p-12 text-center">
              <FiTrendingUp className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No Assets Yet</h3>
              <p className="text-text-secondary mb-6">Start tracking your assets to calculate net worth</p>
              <button onClick={() => { resetAssetForm(); setShowAssetModal(true); }} className="btn-primary inline-flex items-center gap-2">
                <FiPlus /> Add Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-background-card border border-border-secondary rounded-xl p-6 hover:border-primary-500/50 transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getAssetTypeIcon(asset.type)}</span>
                      <div>
                        <h4 className="text-lg font-bold text-text-primary">{asset.name}</h4>
                        <p className="text-sm text-text-tertiary capitalize">{asset.type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditAssetModal(asset)} className="p-2 text-text-secondary hover:text-primary-500 transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAsset(asset.id, asset.name)} className="p-2 text-text-secondary hover:text-red-500 transition-colors">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary text-sm">Current Value</span>
                      <span className="font-bold text-xl text-emerald-500">{formatCurrency(asset.currentValue)}</span>
                    </div>
                    {asset.institution && (
                      <div className="flex justify-between">
                        <span className="text-text-tertiary text-sm">Institution</span>
                        <span className="font-semibold text-text-primary text-sm">{asset.institution}</span>
                      </div>
                    )}
                    {asset.notes && (
                      <p className="text-text-secondary text-xs mt-2 border-t border-border-primary pt-2">{asset.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Liabilities Tab */}
      {activeView === "liabilities" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-text-primary">Liabilities</h3>
            <button onClick={() => { resetLiabilityForm(); setShowLiabilityModal(true); }} className="btn-primary flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              Add Liability
            </button>
          </div>

          {liabilities.length === 0 ? (
            <div className="bg-background-card border border-border-secondary rounded-2xl p-12 text-center">
              <FiX className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No Liabilities Yet</h3>
              <p className="text-text-secondary mb-6">Track your debts to get a complete financial picture</p>
              <button onClick={() => { resetLiabilityForm(); setShowLiabilityModal(true); }} className="btn-primary inline-flex items-center gap-2">
                <FiPlus /> Add Liability
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liabilities.map((liability) => (
                <div key={liability.id} className="bg-background-card border border-border-secondary rounded-xl p-6 hover:border-red-500/50 transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getLiabilityTypeIcon(liability.type)}</span>
                      <div>
                        <h4 className="text-lg font-bold text-text-primary">{liability.name}</h4>
                        <p className="text-sm text-text-tertiary capitalize">{liability.type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditLiabilityModal(liability)} className="p-2 text-text-secondary hover:text-primary-500 transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteLiability(liability.id, liability.name)} className="p-2 text-text-secondary hover:text-red-500 transition-colors">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary text-sm">Balance</span>
                      <span className="font-bold text-xl text-red-500">{formatCurrency(liability.currentBalance)}</span>
                    </div>
                    {liability.interestRate && (
                      <div className="flex justify-between">
                        <span className="text-text-tertiary text-sm">Interest Rate</span>
                        <span className="font-semibold text-text-primary text-sm">{liability.interestRate.toFixed(2)}%</span>
                      </div>
                    )}
                    {liability.institution && (
                      <div className="flex justify-between">
                        <span className="text-text-tertiary text-sm">Institution</span>
                        <span className="font-semibold text-text-primary text-sm">{liability.institution}</span>
                      </div>
                    )}
                    {liability.notes && (
                      <p className="text-text-secondary text-xs mt-2 border-t border-border-primary pt-2">{liability.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeView === "history" && (
        <div className="bg-background-card border border-border-secondary rounded-2xl p-6">
          <h3 className="text-xl font-bold text-text-primary mb-4">Snapshot History</h3>
          {snapshots.length === 0 ? (
            <div className="text-center py-12">
              <FiCamera className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No Snapshots Yet</h3>
              <p className="text-text-secondary mb-6">Take your first snapshot to track net worth over time</p>
              <button onClick={handleTakeSnapshot} className="btn-primary inline-flex items-center gap-2">
                <FiCamera /> Take Snapshot
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.slice().reverse().map((snapshot) => (
                <div key={snapshot.id} className="flex items-center justify-between p-4 bg-background-secondary rounded-lg hover:bg-background-tertiary transition-colors">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {new Date(snapshot.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-sm text-text-tertiary">
                      Assets: {formatCurrency(snapshot.totalAssets)} | Liabilities: {formatCurrency(snapshot.totalLiabilities)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-emerald-500">{formatCurrency(snapshot.netWorth)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Asset Modal */}
      <PremiumModal isOpen={showAssetModal} onClose={() => { setShowAssetModal(false); resetAssetForm(); }} title={editingAsset ? "Update Asset" : "Add Asset"}>
        <form onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Asset Name</label>
            <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} className="input-modern w-full" placeholder="e.g., Chase Checking" required disabled={!!editingAsset} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Type</label>
            <select value={assetType} onChange={(e) => setAssetType(e.target.value as any)} className="input-modern w-full" disabled={!!editingAsset}>
              <option value="checking">Checking Account</option>
              <option value="savings">Savings Account</option>
              <option value="investment">Investment Account</option>
              <option value="property">Real Estate</option>
              <option value="vehicle">Vehicle</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Current Value ($)</label>
            <input type="number" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} className="input-modern w-full" placeholder="e.g., 25000" min="0" step="0.01" required />
          </div>
          {!editingAsset && (
            <>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Institution (Optional)</label>
                <input type="text" value={assetInstitution} onChange={(e) => setAssetInstitution(e.target.value)} className="input-modern w-full" placeholder="e.g., Chase Bank" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Notes (Optional)</label>
                <textarea value={assetNotes} onChange={(e) => setAssetNotes(e.target.value)} className="input-modern w-full" placeholder="Any additional details..." rows={2} />
              </div>
            </>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { setShowAssetModal(false); resetAssetForm(); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editingAsset ? "Update" : "Add"} Asset</button>
          </div>
        </form>
      </PremiumModal>

      {/* Liability Modal */}
      <PremiumModal isOpen={showLiabilityModal} onClose={() => { setShowLiabilityModal(false); resetLiabilityForm(); }} title={editingLiability ? "Update Liability" : "Add Liability"}>
        <form onSubmit={editingLiability ? handleUpdateLiability : handleCreateLiability} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Liability Name</label>
            <input type="text" value={liabilityName} onChange={(e) => setLiabilityName(e.target.value)} className="input-modern w-full" placeholder="e.g., Chase Credit Card" required disabled={!!editingLiability} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Type</label>
            <select value={liabilityType} onChange={(e) => setLiabilityType(e.target.value as any)} className="input-modern w-full" disabled={!!editingLiability}>
              <option value="credit_card">Credit Card</option>
              <option value="student_loan">Student Loan</option>
              <option value="auto_loan">Auto Loan</option>
              <option value="mortgage">Mortgage</option>
              <option value="personal_loan">Personal Loan</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Current Balance ($)</label>
            <input type="number" value={liabilityBalance} onChange={(e) => setLiabilityBalance(e.target.value)} className="input-modern w-full" placeholder="e.g., 5000" min="0" step="0.01" required />
          </div>
          {!editingLiability && (
            <>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Interest Rate % (Optional)</label>
                <input type="number" value={liabilityRate} onChange={(e) => setLiabilityRate(e.target.value)} className="input-modern w-full" placeholder="e.g., 4.5" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Institution (Optional)</label>
                <input type="text" value={liabilityInstitution} onChange={(e) => setLiabilityInstitution(e.target.value)} className="input-modern w-full" placeholder="e.g., Chase Bank" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Notes (Optional)</label>
                <textarea value={liabilityNotes} onChange={(e) => setLiabilityNotes(e.target.value)} className="input-modern w-full" placeholder="Any additional details..." rows={2} />
              </div>
            </>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { setShowLiabilityModal(false); resetLiabilityForm(); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editingLiability ? "Update" : "Add"} Liability</button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
};

export default NetWorthTracking;
