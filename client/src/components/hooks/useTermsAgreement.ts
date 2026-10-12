import { useState, type ChangeEvent } from 'react';

/**
 * Controlled state for the "I agree to the Terms & Privacy Policy"
 * checkbox on the sign-up form. Unlike the "remember me" checkbox
 * (which is fine uncontrolled via defaultChecked, since nothing
 * reads it until submit), this one needs to be controlled because
 * the submit button's disabled state depends on it in real time.
 *
 * Usage:
 *   const { agreed, onChange, touched, showError } = useTermsAgreement();
 *   <input type="checkbox" checked={agreed} onChange={onChange} />
 *   {showError && <span className="field-hint" style={{ color: 'var(--amber)' }}>
 *     You need to agree before creating an account.
 *   </span>}
 *   <button disabled={!agreed}>Create account</button>
 */
export function useTermsAgreement() {
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAgreed(e.target.checked);
    setTouched(true);
  };

  // Only show the "you must agree" message after the user has
  // interacted with the form — not on first render.
  const showError = touched && !agreed;

  return { agreed, onChange, touched, showError };
}
