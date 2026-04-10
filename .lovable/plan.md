

## Integrate Paystack Payment for Pro Upgrade

### Overview
Add Paystack inline checkout to the Paywall so free users can pay ₦2,999 once and permanently unlock Pro access. Payment verification happens server-side via an edge function.

### Architecture

```text
User clicks "Buy Now"
  → Paystack inline popup (frontend, public key)
  → User pays ₦2,999
  → Paystack returns reference
  → Frontend calls verify-payment edge function
  → Edge function verifies with Paystack API (secret key)
  → Edge function updates profiles.plan = 'pro'
  → Real-time subscription in useUserPlan detects change
  → Paywall disappears instantly
```

### Plan

#### 1. Add Paystack Secret Key
Use the `add_secret` tool to request the Paystack secret key from the user. This is needed for server-side verification.

#### 2. Create `verify-payment` Edge Function
- Accepts `{ reference: string }` in POST body
- Extracts user from JWT (Authorization header)
- Calls `https://api.paystack.co/transaction/verify/{reference}` with secret key
- Validates: status === "success", amount === 299900, currency === "NGN"
- Updates `profiles.plan` to `"pro"` for the authenticated user
- Returns success/error response

#### 3. Update `Paywall.tsx`
- Load Paystack inline script (`https://js.paystack.co/v1/inline.js`) via a `useEffect`
- On "Buy Now" click:
  - Get user email from `useAuth()`
  - Open Paystack popup with public key `pk_test_...`, amount `299900`, email
  - On success callback: call `supabase.functions.invoke("verify-payment", { body: { reference } })`
  - Show loading state during verification
  - Show success toast on completion
- The `useUserPlan` hook's real-time subscription on `profiles` will automatically detect the plan change and remove the paywall

#### 4. Add Paystack type declaration
- Add `src/types/paystack.d.ts` for the `PaystackPop` global

### Files Changed
- **New**: `supabase/functions/verify-payment/index.ts`
- **New**: `src/types/paystack.d.ts`
- **Modified**: `src/components/Paywall.tsx` — Paystack integration
- **Modified**: `index.html` — add Paystack script tag

### Security
- Secret key stored as edge function secret, never exposed to frontend
- Server-side amount/currency validation prevents tampering
- JWT authentication ensures only the paying user gets upgraded
- Duplicate payment references are harmless (idempotent plan update)

