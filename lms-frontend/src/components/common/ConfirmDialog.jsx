import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-100 dark:bg-red-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
            <AlertTriangle className={`h-5 w-5 ${type === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
          </div>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className={`btn text-white ${colors[type]}`}>
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;