"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Key, Database, Bell, Palette, Shield, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const SETTINGS_SECTIONS = [
  { id: "api", label: "API Keys", icon: Key },
  { id: "data", label: "Data Sources", icon: Database },
  { id: "alerts", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("api");
  const [settings, setSettings] = useState({
    openaiKey: "",
    polygonKey: "",
    alpacaKey: "",
    alpacaSecret: "",
    finnhubKey: "",
    dataSource: "yfinance",
    refreshInterval: "1500",
    darkMode: true,
    notifications: true,
    soundAlerts: false,
    emailAlerts: false,
  });

  const save = () => toast.success("Settings saved successfully");

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 shrink-0 border-r border-border">
        <div className="px-4 py-4">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </h1>
        </div>
        <nav className="px-2 space-y-1">
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                activeSection === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === "api" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">API Configuration</h2>
              <p className="text-sm text-muted-foreground">Configure your API keys for market data and AI services.</p>
            </div>
            {[
              { key: "openaiKey", label: "OpenAI API Key", placeholder: "sk-...", hint: "Required for AI chat assistant and signal analysis" },
              { key: "polygonKey", label: "Polygon.io API Key", placeholder: "your_polygon_key", hint: "Real-time market data (free tier available)" },
              { key: "alpacaKey", label: "Alpaca API Key", placeholder: "your_alpaca_key", hint: "Paper trading and live market data" },
              { key: "alpacaSecret", label: "Alpaca Secret Key", placeholder: "your_alpaca_secret", hint: "Required with Alpaca API key" },
              { key: "finnhubKey", label: "Finnhub API Key", placeholder: "your_finnhub_key", hint: "Alternative market data source" },
            ].map(({ key, label, placeholder, hint }) => (
              <div key={key}>
                <label className="text-sm font-medium block mb-1">{label}</label>
                <input
                  type="password"
                  value={settings[key as keyof typeof settings] as string}
                  onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">{hint}</p>
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === "data" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">Data Sources</h2>
              <p className="text-sm text-muted-foreground">Configure which data sources to use for market information.</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Primary Data Source</label>
              <div className="space-y-2">
                {[
                  { value: "yfinance", label: "Yahoo Finance", desc: "Free, 15-min delayed data. Good for development." },
                  { value: "polygon", label: "Polygon.io", desc: "Real-time WebSocket data. Requires API key." },
                  { value: "alpaca", label: "Alpaca Markets", desc: "Real-time data + paper trading. Free tier available." },
                  { value: "finnhub", label: "Finnhub", desc: "Real-time quotes and WebSocket streaming." },
                ].map(({ value, label, desc }) => (
                  <label key={value} className={cn("flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    settings.dataSource === value ? "border-primary/40 bg-primary/5" : "border-border hover:bg-accent"
                  )}>
                    <input
                      type="radio"
                      value={value}
                      checked={settings.dataSource === value}
                      onChange={() => setSettings((p) => ({ ...p, dataSource: value }))}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Refresh Interval (ms)</label>
              <input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => setSettings((p) => ({ ...p, refreshInterval: e.target.value }))}
                className="w-32 bg-accent border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                min="500" step="500"
              />
              <p className="text-xs text-muted-foreground mt-1">How often to simulate price updates (500–5000ms)</p>
            </div>
          </motion.div>
        )}

        {activeSection === "alerts" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">Notification Settings</h2>
              <p className="text-sm text-muted-foreground">Configure how you receive trading alerts.</p>
            </div>
            {[
              { key: "notifications", label: "Browser Notifications", desc: "Show desktop notifications for alerts" },
              { key: "soundAlerts", label: "Sound Alerts", desc: "Play sounds for critical alerts" },
              { key: "emailAlerts", label: "Email Alerts", desc: "Send email for high-priority signals" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 glass rounded-xl">
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <button
                  onClick={() => setSettings((p) => ({ ...p, [key]: !p[key as keyof typeof settings] }))}
                  className={cn("w-11 h-6 rounded-full transition-colors relative",
                    settings[key as keyof typeof settings] ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                    settings[key as keyof typeof settings] ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === "appearance" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize the look and feel of QTrading.</p>
            </div>
            <div className="glass rounded-xl p-4 text-center text-muted-foreground">
              <Palette className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm">Dark mode is default. Additional themes coming soon.</p>
            </div>
          </motion.div>
        )}

        {/* Save button */}
        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={save}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </motion.button>
        </div>
      </div>
    </div>
  );
}
