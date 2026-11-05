import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { RefreshCw, AlertTriangle, ArrowRight, Zap, ZapOff } from 'lucide-react';
import { Button } from '../common/Button';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isProcessing?: boolean;
}

export const playScanBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 pitch
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
};

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  isProcessing = false,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');

  const handleDetected = useCallback(
    (decodedText: string) => {
      const now = Date.now();
      // Debounce repeated scans within 2 seconds
      if (
        decodedText === lastScannedCodeRef.current &&
        now - lastScannedTimeRef.current < 2000
      ) {
        return;
      }

      lastScannedCodeRef.current = decodedText;
      lastScannedTimeRef.current = now;

      playScanBeep();
      onScanSuccess(decodedText);
    },
    [onScanSuccess]
  );

  const startScanner = useCallback(async () => {
    setCameraError(null);
    const elementId = 'barcode-reader-view';

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDetected(decodedText);
        },
        () => {
          // Ignore frame decode misses (normal while searching)
        }
      );

      setIsCameraActive(true);

      // Check torch capability
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch {}
    } catch (err: any) {
      console.warn('Camera initiation failed or was denied:', err);
      setIsCameraActive(false);
      setCameraError(
        err.message || 'Camera permission denied or camera device not accessible.'
      );
    }
  }, [handleDetected]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  }, []);

  const toggleTorch = async () => {
    if (scannerRef.current && isCameraActive && hasTorch) {
      try {
        const nextTorch = !torchOn;
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextTorch } as any],
        });
        setTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleDetected(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Viewfinder Window */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video max-w-lg bg-black rounded-2xl overflow-hidden shadow-card border border-stone-800">
        <div id="barcode-reader-view" className="w-full h-full" />

        {/* Framing Guides & Scan Laser (Only when camera is active) */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Viewfinder Box */}
            <div className="relative w-72 h-44 rounded-xl border-2 border-white/40">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand-400 rounded-br-lg" />

              {/* Animated Laser Line */}
              <div className="absolute left-2 right-2 h-0.5 bg-brand-400/80 shadow-[0_0_8px_#54A98C] animate-scan-laser" />

              <span className="absolute -bottom-7 left-0 right-0 text-center text-[11px] font-medium tracking-wider uppercase text-white/80 bg-black/50 py-0.5 rounded backdrop-blur-sm">
                Align barcode within frame
              </span>
            </div>
          </div>
        )}

        {/* Torch Button (if supported) */}
        {isCameraActive && hasTorch && (
          <button
            onClick={toggleTorch}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
            title="Toggle Flashlight"
          >
            {torchOn ? <Zap className="w-5 h-5 text-amber-400" /> : <ZapOff className="w-5 h-5" />}
          </button>
        )}

        {/* Fallback Camera Error State */}
        {cameraError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-stone-900/95 text-stone-200">
            <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Camera Feed Inactive</h3>
            <p className="text-xs text-stone-400 max-w-xs mb-4">{cameraError}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={startScanner}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Camera
            </Button>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-stone-200 dark:border-neutral-700">
              <RefreshCw className="w-4 h-4 text-brand-500 animate-spin" />
              <span className="text-xs font-medium text-ink-900 dark:text-neutral-100">
                Looking up item...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Barcode Input Fallback & Seed Chips */}
      <div className="w-full max-w-lg mt-4 px-1">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Or type barcode (e.g. 8901030864215)"
            className="flex-1 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-brand-500 min-h-[44px]"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!manualCode.trim() || isProcessing}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Add
          </Button>
        </form>

        {/* Quick Test Barcode Buttons for Rapid Pair Testing */}
        <div className="mt-3">
          <p className="text-[11px] text-ink-500 dark:text-neutral-400 mb-1.5 font-medium">
            Quick Test Barcodes (Click to simulate scan):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { code: '8901030864215', label: 'Avocados (₹180)' },
              { code: '8901030864222', label: 'Sourdough (₹140)' },
              { code: '8901030864246', label: 'Arabica Coffee (₹490)' },
              { code: '8901030864277', label: 'Dark Chocolate (₹160)' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleDetected(item.code)}
                className="text-[11px] font-mono px-2 py-1 rounded-lg bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-ink-700 dark:text-neutral-300 transition-colors border border-stone-200 dark:border-neutral-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
