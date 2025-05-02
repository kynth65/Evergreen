import React from "react";
import { AlertTriangle } from "lucide-react";

export default function LogoutConfirmation({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-sm bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transition-all transform p-6">
        <div className="flex items-center justify-center mb-4 text-amber-500">
          <AlertTriangle size={48} />
        </div>

        <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">
          Are You Sure?
        </h3>

        <p className="text-center text-gray-600 mb-6">
          Are you sure you want to log out of your account?
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium cursor-pointer"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
