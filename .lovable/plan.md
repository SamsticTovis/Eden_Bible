
## Fix Paystack so “Buy Now” opens instantly

### What I found
- `src/components/Paywall.tsx` loads the Paystack script only after the paywall mounts, so the first tap can happen before `window.PaystackPop` is actually ready.
- `index.html` currently does not include the Paystack script globally.
- The current button uses a shared `loading` state and `scriptLoaded` gate, which can create a stuck “Processing...” experience instead of opening checkout immediately.
- The current browser snapshot shows no Paystack network activity, which is consistent with the popup never launching.

### Implementation plan

#### 1. Load Paystack globally first
Update `index.html` to include:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```
This makes the library available before the user taps “Buy Now”, instead of starting script loading too late inside the paywall component.

#### 2. Harden readiness checks in `Paywall.tsx`
Refactor the paywall so it:
- checks `window.PaystackPop?.setup` directly
- tracks script readiness separately from payment verification
- does not rely only on a possibly stale `scriptLoaded` boolean

If the script is unexpectedly missing:
- retry attaching/loading it once
- show a clear error toast
- never leave the button in a stuck loading state

#### 3. Open Paystack immediately on click
Change the click flow so `handleBuyNow` does this in order:
1. validate `user.email`
2. validate amount `299900`
3. confirm `window.PaystackPop` is available
4. call:
   ```ts
   const handler = window.PaystackPop.setup(...)
   handler.openIframe()
   ```

Important behavior:
- no backend call before opening the popup
- no “Processing...” state before `openIframe()`
- popup should open on the same click event

#### 4. Separate popup-opening from backend verification
Keep payment verification only inside the Paystack success callback:
- `callback({ reference })` → call `verify-payment`
- `onClose()` → reset temporary state and return user to paywall cleanly

I’ll replace the current single `loading` state with safer behavior:
- no spinner while trying to open the popup
- optional short verification state only after a successful charge callback
- always clear state on success, failure, or close

#### 5. Make unlock feel immediate after payment
After `verify-payment` succeeds:
- show success toast
- refresh the user’s plan immediately in addition to the existing realtime listener
- let the paywall disappear without waiting on a delayed subscription update

### Files to update
- `index.html`
- `src/components/Paywall.tsx`
- optionally `src/types/paystack.d.ts` if the Paystack typings need cleanup around `setup()` and `openIframe()`

### Result after this fix
When a logged-in free user taps **Buy Now**:
- Paystack opens immediately
- user can enter card details
- closing the popup returns cleanly to the paywall
- successful payment verifies in the backend
- Pro access unlocks right away without a stuck state
