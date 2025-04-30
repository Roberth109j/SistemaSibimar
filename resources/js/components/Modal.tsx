type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
