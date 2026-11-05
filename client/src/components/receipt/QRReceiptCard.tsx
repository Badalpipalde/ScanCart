import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, CheckCircle2, Clock, Copy, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';
import { useUIStore } from '../../store/uiStore';

export interface OrderReceiptData {
  id: string;
  items: Array<{
    name: string;
    sku: string;
    qty: number;
    unitPrice: number;
    taxPercent: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  payment: {
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    status: string;
  };
  receiptToken: string;
  exitStatus: 'pending' | 'verified';
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: any;
}

interface QRReceiptCardProps {
  order: OrderReceiptData;
}

export const QRReceiptCard: React.FC<QRReceiptCardProps> = ({ order }) => {
  const { showToast } = useUIStore();
  const [copied, setCopied] = React.useState(false);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(order.receiptToken);
    setCopied(true);
    showToast('Receipt signature token copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const isVerified = order.exitStatus === 'verified';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Printable Receipt Card */}
      <div
        ref={receiptPrintRef}
        className="w-full bg-white text-neutral-900 rounded-3xl p-6 shadow-card border border-stone-200/90 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="text-center pb-4 border-b border-dashed border-stone-300">
          <Logo size="lg" showText={false} className="justify-center mb-2" />
          <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
            ScanCart Retail
          </h2>
          <p className="text-xs text-stone-500 font-mono">Store #104 • Self-Checkout Express</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            {isVerified ? (
              <Badge variant="success" size="md">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                EXIT CLEARED
              </Badge>
            ) : (
              <Badge variant="brand" size="md">
                <Clock className="w-3.5 h-3.5 mr-1" />
                READY FOR EXIT VERIFICATION
              </Badge>
            )}
          </div>
        </div>

        {/* HERO QR MOMENT (High-Contrast Monochrome on Pure White) */}
        <div className="flex flex-col items-center py-6 bg-white">
          <div className="p-3.5 bg-white border-2 border-stone-900 rounded-2xl shadow-subtle">
            <QRCodeSVG
              value={order.receiptToken}
              size={210}
              level="M"
              includeMargin={false}
              fgColor="#111827"
              bgColor="#FFFFFF"
            />
          </div>
          <p className="text-xs font-semibold text-stone-700 uppercase tracking-widest mt-3">
            Present at Exit Gate
          </p>
          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
            Order Ref: #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Dotted Receipt Divider with Side Notches */}
        <div className="relative my-2">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface dark:bg-surface-dark border-r border-stone-200" />
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface dark:bg-surface-dark border-l border-stone-200" />
          <div className="border-t border-dashed border-stone-300" />
        </div>

        {/* Itemized Snapshot List */}
        <div className="py-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2.5">
            Purchased Items ({order.items.reduce((acc, i) => acc + i.qty, 0)})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div className="flex-1 pr-2">
                  <div className="font-medium text-stone-900 line-clamp-1">{item.name}</div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    {item.qty} × {formatCurrency(item.unitPrice)}
                  </div>
                </div>
                <div className="font-mono font-semibold tabular-nums text-stone-900">
                  {formatCurrency(item.qty * item.unitPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="mt-4 pt-3 border-t border-stone-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>GST & Taxes</span>
              <span className="font-mono tabular-nums">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Paid</span>
              <span className="font-mono tabular-nums text-brand-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Verification & Audit Details */}
        <div className="pt-3 border-t border-stone-200 text-[10px] text-stone-500 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Gateway ID:</span>
            <span className="truncate max-w-[180px]">
              {order.payment.razorpayPaymentId || order.payment.razorpayOrderId}
            </span>
          </div>
          {order.verifiedAt && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Exit Cleared At:</span>
              <span>{formatDate(order.verifiedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="w-full flex gap-3 mt-4 print:hidden">
        <Button
          variant="outline"
          size="md"
          className="flex-1"
          leftIcon={<Printer className="w-4 h-4" />}
          onClick={handlePrint}
        >
          Print Receipt
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          onClick={handleCopyToken}
        >
          {copied ? 'Copied' : 'Copy Pass'}
        </Button>
      </div>

      <div className="mt-3 text-center text-xs text-ink-500 dark:text-neutral-400">
        <p>Keep this screen open when passing through the security exit lane.</p>
      </div>
    </div>
  );
};
