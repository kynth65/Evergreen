import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Shield,
} from "lucide-react";

const PasswordChangeForm = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  success = false,
  error = null,
}) => {
  // Password data state
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    current_password_confirmation: "",
    new_password: "",
  });

  // View password toggles
  const [viewPassword, setViewPassword] = useState({
    current: false,
    confirmation: false,
    new: false,
  });

  // Password strength requirements
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    noCommonPattern: true,
    passwordsMatch: false,
    confirmationMatch: false,
  });

  // Validation status
  const [validationStatus, setValidationStatus] = useState({
    isValid: false,
    strength: 0, // 0-4 (very weak, weak, medium, strong, very strong)
  });

  // Effect to validate password requirements on change
  useEffect(() => {
    validatePassword(passwordData.new_password);
    checkPasswordsMatch();
    checkConfirmationMatch();
  }, [passwordData]);

  // Effect to clear form on successful submission
  useEffect(() => {
    if (success) {
      resetForm();
    }
  }, [success]);

  // Reset form fields
  const resetForm = () => {
    setPasswordData({
      current_password: "",
      current_password_confirmation: "",
      new_password: "",
    });

    setViewPassword({
      current: false,
      confirmation: false,
      new: false,
    });
  };

  // Check if current password and confirmation match
  const checkConfirmationMatch = () => {
    const isMatch =
      passwordData.current_password !== "" &&
      passwordData.current_password ===
        passwordData.current_password_confirmation;

    setRequirements((prev) => ({ ...prev, confirmationMatch: isMatch }));
  };

  // Check if new password meets requirements
  const validatePassword = (password) => {
    // Check for minimum length (8 characters)
    const minLength = password.length >= 8;

    // Check for uppercase, lowercase, numbers, and special characters
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Check for common patterns to avoid
    // This is a simple check, in production you might want to use a library
    const commonPatterns = [
      "123456",
      "password",
      "qwerty",
      "admin",
      "111111",
      "12345678",
      "abc123",
      "password1",
    ];
    const noCommonPattern = !commonPatterns.some((pattern) =>
      password.toLowerCase().includes(pattern)
    );

    // Update requirements state
    setRequirements((prev) => ({
      ...prev,
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      noCommonPattern,
    }));

    // Calculate strength (0-4)
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (hasUppercase && hasLowercase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecial) strength += 1;
    if (password.length >= 12 && noCommonPattern) strength += 1;

    // Check if all main requirements are met - special characters not required
    const isValid =
      minLength && hasUppercase && hasLowercase && hasNumber && noCommonPattern;

    // Update validation status
    setValidationStatus({
      isValid,
      strength,
    });
  };

  // Check if current and new passwords match
  const checkPasswordsMatch = () => {
    const doNotMatch =
      passwordData.new_password !== "" &&
      passwordData.current_password !== "" &&
      passwordData.new_password !== passwordData.current_password;

    setRequirements((prev) => ({ ...prev, passwordsMatch: doNotMatch }));
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setViewPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if current password confirmation matches
    if (!requirements.confirmationMatch) {
      return;
    }

    // Check if new password meets requirements
    if (!validationStatus.isValid) {
      return;
    }

    // Check if new password is different from current password
    if (!requirements.passwordsMatch) {
      return;
    }

    // Call parent component's onSubmit function
    onSubmit({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });
  };

  // Get color based on password strength
  const getStrengthColor = () => {
    const { strength } = validationStatus;
    if (strength === 0) return "bg-gray-200";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    if (strength >= 4) return "bg-green-500";
  };

  // Get strength label
  const getStrengthLabel = () => {
    const { strength } = validationStatus;
    if (strength === 0) return "Enter password";
    if (strength === 1) return "Very weak";
    if (strength === 2) return "Weak";
    if (strength === 3) return "Medium";
    if (strength >= 4) return "Strong";
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-transparent backdrop-blur-sm bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 transition-all transform">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-600" />
              Change Password
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Password updated successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={viewPassword.current ? "text" : "password"}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full p-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {viewPassword.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Current Password Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Re-enter Current Password *
                </label>
                <div className="relative">
                  <input
                    type={viewPassword.confirmation ? "text" : "password"}
                    name="current_password_confirmation"
                    value={passwordData.current_password_confirmation}
                    onChange={handlePasswordChange}
                    className={`w-full p-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      passwordData.current_password &&
                      passwordData.current_password_confirmation &&
                      !requirements.confirmationMatch
                        ? "border-red-500"
                        : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => togglePasswordVisibility("confirmation")}
                  >
                    {viewPassword.confirmation ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {passwordData.current_password &&
                  passwordData.current_password_confirmation &&
                  !requirements.confirmationMatch && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={viewPassword.new ? "text" : "password"}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full p-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {viewPassword.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {passwordData.new_password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Password Strength: {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{
                          width: `${(validationStatus.strength / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements List */}
                <div className="mt-3 text-xs space-y-1.5">
                  <div className="font-medium text-gray-600">
                    Password must:
                  </div>

                  <div className="flex items-center">
                    {requirements.minLength ? (
                      <Check size={14} className="text-green-500 mr-1.5" />
                    ) : (
                      <X size={14} className="text-red-500 mr-1.5" />
                    )}
                    <span
                      className={
                        requirements.minLength
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Be at least 8 long
                    </span>
                  </div>

                  <div className="flex items-center">
                    {requirements.hasUppercase && requirements.hasLowercase ? (
                      <Check size={14} className="text-green-500 mr-1.5" />
                    ) : (
                      <X size={14} className="text-red-500 mr-1.5" />
                    )}
                    <span
                      className={
                        requirements.hasUppercase && requirements.hasLowercase
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Include both uppercase and lowercase letters
                    </span>
                  </div>

                  <div className="flex items-center">
                    {requirements.hasNumber ? (
                      <Check size={14} className="text-green-500 mr-1.5" />
                    ) : (
                      <X size={14} className="text-red-500 mr-1.5" />
                    )}
                    <span
                      className={
                        requirements.hasNumber
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Include at least one number
                    </span>
                  </div>

                  <div className="flex items-center">
                    {requirements.noCommonPattern ? (
                      <Check size={14} className="text-green-500 mr-1.5" />
                    ) : (
                      <X size={14} className="text-red-500 mr-1.5" />
                    )}
                    <span
                      className={
                        requirements.noCommonPattern
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Avoid common patterns or sequences
                    </span>
                  </div>

                  {passwordData.current_password &&
                    passwordData.new_password &&
                    !requirements.passwordsMatch && (
                      <div className="flex items-center">
                        <X size={14} className="text-red-500 mr-1.5" />
                        <span className="text-red-600">
                          New password must be different from current password
                        </span>
                      </div>
                    )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !requirements.confirmationMatch ||
                    !validationStatus.isValid ||
                    !requirements.passwordsMatch ||
                    loading
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
