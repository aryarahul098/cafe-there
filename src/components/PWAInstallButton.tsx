import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Already running as an installed standalone app
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
        <CheckCircle2 className="w-3 h-3" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-header-btn"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all active:scale-95 animate-pulse hover:animate-none"
        title="Install CAFE THERE as an App on Android / Phone"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">Install App</span>
      </button>

      {/* Installation Instruction Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5 text-stone-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    Install CAFE THERE App
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-xs text-stone-400">Add to your phone for 1-tap offline access</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Android instructions */}
            {!isIOS ? (
              <div className="space-y-3 text-xs bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
                <div className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>Android &amp; Chrome (1-Minute Setup)</span>
                </div>
                <div className="space-y-2 text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Open this app in <strong>Google Chrome</strong> on your phone.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Tap the <strong>three dots menu (⋮)</strong> at the top-right corner of Chrome.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      Tap <strong>&quot;Install app&quot;</strong> (or <strong>&quot;Add to Home screen&quot;</strong>).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      4
                    </span>
                    <p>
                      Confirm with <strong>Install</strong>. CAFE THERE will now appear on your phone home screen just like a native APK app!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* iOS Safari instructions */
              <div className="space-y-3 text-xs bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
                <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  iPhone / iPad (Safari)
                </div>
                <div className="space-y-2 text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>Open this page in <strong>Safari</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>Tap the <strong>Share</strong> button (box with upward arrow at bottom).</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits pill */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-400">
              <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/50 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Runs Fullscreen</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/50 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Works Offline</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
