/**
 * Utility functions for number formatting and calculations
 */

/**
 * Rounds up a number to the next whole integer
 * @param {number|string} value - The value to round up
 * @returns {number} - The rounded up integer
 */
export const roundUpToWhole = (value) => {
    // First make sure it's a number
    const numValue = parseFloat(value || 0);
    // Return ceiling of the number (rounds up to next whole integer)
    return Math.ceil(numValue);
  };
  
  /**
   * Formats a number as currency with desired decimal places
   * @param {number|string} value - The value to format
   * @param {boolean} showDecimals - Whether to show decimal places
   * @returns {string} - The formatted currency string
   */
  export const formatCurrency = (value, showDecimals = false) => {
    const numValue = parseFloat(value || 0);
    return new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(numValue);
  };
  
  /**
   * Calculate payment progress percentage and related information
   * @param {object} payment - The payment object
   * @returns {object} - The progress information
   */
  export const calculateProgress = (payment) => {
    if (!payment) return { percent: 0, completed: 0, total: 0 };
  
    if (payment.payment_type === "spot_cash") {
      const paidTransaction = payment.paymentTransactions?.find(
        (tx) => tx.amount >= payment.total_amount
      );
      const completed = paidTransaction ? 1 : 0;
      return { percent: completed * 100, completed: completed, total: 1 };
    }
  
    const totalPayments = payment.installment_years * 12;
    const completed = payment.completed_payments || 0;
    const percent =
      totalPayments > 0 ? Math.round((completed / totalPayments) * 100) : 0;
  
    return { percent, completed, total: totalPayments };
  };
  
  /**
   * Calculate total amounts for payment
   * @param {object} payment - The payment object
   * @returns {object} - The calculated amounts
   */
  export const calculateTotalAmounts = (payment) => {
    if (!payment) return { totalAmount: 0, paidAmount: 0, remainingAmount: 0 };
  
    const totalAmount = payment.total_amount;
    let paidAmount = 0;
  
    if (payment.payment_type === "spot_cash") {
      paidAmount =
        payment.paymentTransactions?.reduce(
          (sum, tx) => sum + parseFloat(tx.amount || 0),
          0
        ) || 0;
      paidAmount = Math.min(paidAmount, totalAmount);
      return {
        totalAmount,
        paidAmount: paidAmount,
        remainingAmount: Math.max(0, totalAmount - paidAmount),
      };
    }
  
    if (payment.paymentTransactions && payment.paymentTransactions.length > 0) {
      paidAmount = payment.paymentTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0),
        0
      );
    } else {
      const totalInstallments = payment.installment_years * 12;
      const monthlyPayment =
        totalInstallments > 0 ? totalAmount / totalInstallments : 0;
      paidAmount = (payment.completed_payments || 0) * monthlyPayment;
    }
  
    paidAmount = Math.min(paidAmount, totalAmount);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
  
    return {
      totalAmount,
      paidAmount,
      remainingAmount,
    };
  };