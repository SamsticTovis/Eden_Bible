interface PaystackPopOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

interface PaystackPopInstance {
  openIframe: () => void;
}

interface PaystackPopConstructor {
  new (): {
    newTransaction: (options: PaystackPopOptions) => void;
  };
  setup: (options: PaystackPopOptions) => PaystackPopInstance;
}

declare const PaystackPop: PaystackPopConstructor;

interface Window {
  PaystackPop: PaystackPopConstructor;
}
