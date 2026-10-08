"use client";

export default function BuildingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-mono tracking-widest mb-2" style={{ color: "var(--text-dim)" }}>/ BUILDINGS</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Building Planner</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Track your HQ level, building upgrade costs, speedup requirements, and unlock order recommendations.
        </p>
      </div>

      <div
        className="rounded-lg border p-12 flex flex-col items-center justify-center text-center"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="text-5xl mb-4">🏗️</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Coming Soon</h2>
        <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
          The Building Planner will cover every structure — HQ, Barracks, Research Lab, Hospital and more.
          Input your current levels to get upgrade priorities, resource costs, and Arms Race timing advice.
        </p>
        <div
          className="mt-6 px-4 py-2 rounded text-xs font-mono"
          style={{ background: "var(--surface-2)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
        >
          Phase 4 — In development
        </div>
      </div>
    </div>
  );
}
