import { useMemo, useState } from 'react';

/**
 * Show/hide toggle for a password field.
 * Replaces the `.field-toggle` click handler in main.js.
 *
 * Usage:
 *   const { visible, toggle, inputType } = usePasswordVisibility();
 *   <input type={inputType} />
 *   <button type="button" onClick={toggle}>...</button>
 */
export function usePasswordVisibility() {
  const [visible, setVisible] = useState(false);
  return {
    visible,
    toggle: () => setVisible((v) => !v),
    inputType: visible ? 'text' : ('password' as const),
  };
}

const STRENGTH_COLORS = ['#4a4a4a', '#E68A4F', '#E68A4F', '#A9D6A2', '#2FC9BA'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

/**
 * Scores a password 0–4 as the user types, same rules as the
 * `signupPassword` input handler in main.js: length, uppercase,
 * digit, symbol.
 *
 * Usage:
 *   const { score, label, barColor } = usePasswordStrength(password);
 *   <div className="strength">
 *     {[0,1,2,3].map(i => <i key={i} style={{ background: barColor(i) }} />)}
 *   </div>
 *   <div className="field-hint">{label}</div>
 */
export function usePasswordStrength(password: string) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const label = password ? STRENGTH_LABELS[score] : '';

  const barColor = (barIndex: number) => (barIndex < score ? STRENGTH_COLORS[score] : '#2d2d2d');

  return { score, label, barColor };
}
