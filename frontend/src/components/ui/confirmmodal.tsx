import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Potwierdź',
  cancelText = 'Anuluj',
  variant = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '⚠️',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      borderColor: 'border-red-200',
      buttonClass: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚡',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
    },
    success: {
      icon: '✓',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      borderColor: 'border-green-200',
      buttonClass: 'bg-green-600 hover:bg-green-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header z ikoną */}
        <div className={`${style.bgColor} border-b ${style.borderColor} p-6`}>
          <div className="flex items-start gap-4">
            <div className={`${style.iconBg} rounded-full p-3 text-2xl`}>
              {style.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Przyciski akcji */}
        <div className="p-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${style.buttonClass}`}
            disabled={isLoading}
          >
            {isLoading ? 'Przetwarzanie...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}