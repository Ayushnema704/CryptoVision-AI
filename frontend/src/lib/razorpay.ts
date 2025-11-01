// Razorpay Payment Integration

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (options: RazorpayOptions): Promise<void> => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

// Predefined plan amounts (in paise for INR or cents for USD)
export const PAYMENT_PLANS = {
  monthly: {
    amount: 99900, // ₹999 or $9.99 (in smallest currency unit)
    currency: 'INR', // Change to 'USD' if needed
    displayAmount: '₹999', // Change to '$9.99' if USD
    name: 'Monthly Premium',
    description: 'Premium subscription for 1 month',
  },
  annual: {
    amount: 959900, // ₹9599 or $95.99
    currency: 'INR', // Change to 'USD' if needed
    displayAmount: '₹9,599', // Change to '$95.99' if USD
    name: 'Annual Premium',
    description: 'Premium subscription for 1 year (Save 20%)',
  },
};
