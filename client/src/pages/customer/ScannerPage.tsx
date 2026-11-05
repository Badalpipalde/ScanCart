import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { BarcodeScanner } from '../../components/scanner/BarcodeScanner';
import { ScanResultSheet } from '../../components/scanner/ScanResultSheet';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../../components/common/Button';

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { scanAndAddBarcode, recentlyScannedItem, setRecentlyScannedItem, itemCount } =
    useCartStore();
  const { showToast } = useUIStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanSuccess = async (barcode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const addedProduct = await scanAndAddBarcode(barcode);
      showToast(`Added: ${addedProduct.name}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Product lookup failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[85vh] justify-between">
      {/* Top Bar for Scanner View */}
      <div className="w-full max-w-lg flex items-center justify-between px-4 py-2 sm:px-0">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 dark:text-neutral-400 hover:text-ink-900 p-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Scanner</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/cart')}
          leftIcon={<ShoppingBag className="w-4 h-4" />}
          className="relative text-xs"
        >
          Cart
          {itemCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-brand-500 text-white rounded-full text-[10px] font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </div>

      {/* Main Camera Frame */}
      <div className="w-full flex-1 flex flex-col items-center justify-center py-2">
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          isProcessing={isProcessing}
        />
      </div>

      {/* Slide-up Result Sheet */}
      <ScanResultSheet
        item={recentlyScannedItem}
        onClose={() => setRecentlyScannedItem(null)}
      />
    </div>
  );
};

