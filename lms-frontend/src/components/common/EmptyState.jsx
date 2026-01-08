import { FileQuestion } from 'lucide-react';

export const EmptyState = ({ icon: Icon = FileQuestion, title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 rounded-full bg-gray-100 dark:bg-dark-800 mb-4">
        <Icon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">{message}</p>
      {action}
    </div>
  );
};
export default EmptyState;