import { useState, type SubmitEvent } from 'react';

export enum TypeOfAuth {
    SignIn = 1,
    SignUp
}

const API = 'http://localhost:8000'; // point this at your FastAPI base URL

/**
 * Submits the sign-in form to the backend and tracks the request's
 * lifecycle (submitting / error). Reads the form by `name` attribute
 * via FormData rather than controlled state, so nothing else needs
 * to change in SignIn.tsx's inputs.
 *
 * On success, the backend has already set the httpOnly session
 * cookie (see POST /api/login) — this hook just redirects afterward.
 * It does NOT track "am I logged in" app-wide; that's a separate
 * concern (an AuthContext calling GET /api/me on load) if/when you
 * need other pages to know the session exists.
 *
 * Usage:
 *   const { submitting, error, handleSubmit } = useCredentialsSubmit();
 *   <form onSubmit={handleSubmit}>
 *     {error && <div className="field-hint" style={{ color: 'var(--amber)' }}>{error}</div>}
 *     <button type="submit" disabled={submitting}>
 *       {submitting ? 'Please wait…' : 'Sign in'}
 *     </button>
 *   </form>
 */

// Helper functions for sign-in and sign-up
async function signIn(form: FormData): Promise<void | Error>
{
    const identifier = form.get('identifier') as string;
    const password = form.get('password') as string;
    const remember = form.get('remember') === 'on'; // checkboxes report 'on' when checked
 
    if (!identifier || !password) {
        throw new Error('Enter your email/username and password.'); // Throw erorr
    }
    
    const res = await fetch(`${API}/app/signin`, {
        method: 'POST',
        credentials: 'include', // required — this is what lets the browser store the session cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, remember }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || 'Invalid credentials. Please try again.');
    }
}

async function signUp(form: FormData): Promise<void | Error>
{
    const email = form.get('email') as string;
    const username = form.get('username') as string;
    const password = form.get('password') as string;
    const terms = form.get('terms') === 'on'; // checkboxes report 'on' when checked
 
    if (!username || !email || !password || !terms) {
        throw new Error('Enter your email, username, password and agree to terms and conditions'); // Throw erorr
    }
    
    const res = await fetch(`${API}/app/signup`, {
        method: 'POST',
        credentials: 'include', // required — this is what lets the browser store the session cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || 'Invalid credentials. Please try again.');
    }
}

export function useCredentialsSubmit(typeOfAuth: TypeOfAuth)
{
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    const form = new FormData(e.currentTarget);

    try {
      if (typeOfAuth === TypeOfAuth.SignIn)
          signIn(form);
      else
          signUp(form);
      // session cookie is set by the backend response — nothing to store here
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, error, handleSubmit };
}
