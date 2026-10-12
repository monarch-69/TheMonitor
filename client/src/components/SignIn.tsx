import './Auth.css';
import mascotImg from './images/mascot.jpg';
import { useParallax, usePasswordVisibility, useCredentialsSubmit, TypeOfAuth } from './hooks';

function SignIn() 
{
  const orbRef = useParallax<HTMLDivElement>('orb', 0.05);
  const { visible, toggle, inputType } = usePasswordVisibility();
  const { submitting, error, handleSubmit } = useCredentialsSubmit(TypeOfAuth.SignIn);

  return (
    <>
      <div className="auth-shell">
        {/* ===== VISUAL SIDE ===== */}
        <div className="auth-visual">
          <div className="grid-field"></div>
          <div
            ref={orbRef}
            className="glow-orb hero-orb-1"
            style={{ width: '380px', height: '380px', top: '-140px', left: '-120px', opacity: 0.14 }}
          ></div>

          <div className="auth-visual-top">
            <a href="/" className="auth-back">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5m0 0 7 7m-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to The Monitor
            </a>
            <span className="cro-status" style={{ color: 'var(--sage)' }}><i></i>All systems reliable</span>
          </div>

          <div className="auth-visual-mid">
            <div className="auth-cat">
              <img src={mascotImg} alt="Olive the cat, Chief Reliability Officer of The Monitor, wearing a suit and tie" />
              <div className="auth-cat-ring"></div>
            </div>
            <h3>Olive kept watch while you were away.</h3>
            <p>Zero incidents, three deploys, one very close call with a coffee spill near the server rack.</p>
            <span className="auth-visual-quote">"Welcome back. The dashboard missed you."</span>
          </div>

          <div className="auth-visual-bottom">
            <div><div className="num">99.98%</div><div className="lbl">Uptime today</div></div>
            <div><div className="num">142ms</div><div className="lbl">Avg. response</div></div>
            <div><div className="num">0</div><div className="lbl">Open incidents</div></div>
          </div>
        </div>

        {/* ===== FORM SIDE ===== */}
        <div className="auth-form-side">
          <div className="auth-form-wrap">
            <a href="/" className="logo">
              <span className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h4l2-7 4 14 2-7h6" stroke="#0e1b19" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              The Monitor
            </a>

            <h1>Welcome back</h1>
            <p>Sign in to check on your servers.</p>

            <form data-demo onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="identifier">Email or username</label>
                <div className="field-input">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input type="text" id="identifier" name="identifier" placeholder="you@company.com" autoComplete="username" required />
                </div>
              </div>

              <div className="field">
                <label htmlFor="signinPassword">Password</label>
                <div className="field-input">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <input
                    type={inputType}
                    id="signinPassword"
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="field-toggle"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}
                    onClick={toggle}
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="field-row">
                <label className="checkbox">
                  <input type="checkbox" name="remember" defaultChecked />
                  Remember me
                </label>
                <a href="#" className="link-muted">Forgot password?</a>
              </div>

              {error && (
                <div className="field-hint" style={{ color: 'var(--amber)', marginBottom: '14px' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Please wait…' : 'Sign in'}
              </button>
            </form>

            <div className="divider">Or continue with</div>

            <div className="oauth-grid">
              <a href="#" className="oauth-btn">
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.63v2.99h3.88c2.27-2.09 3.56-5.17 3.56-8.81z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.88-2.99c-1.07.72-2.45 1.14-4.05 1.14-3.12 0-5.76-2.1-6.7-4.93H1.3v3.09A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.3a12 12 0 0 0 0 10.78z" />
                  <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.61l4 3.09C6.24 6.86 8.88 4.75 12 4.75z" />
                </svg>
                Google
              </a>
              <a href="#" className="oauth-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.7.5.5 5.7.5 12c0 5 3.3 9.3 7.8 10.8.6.1.8-.2.8-.6v-2.2c-3.2.7-3.8-1.4-3.8-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.4-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.5 11.5 0 0 0 23.5 12c0-6.3-5.2-11.5-11.5-11.5z" />
                </svg>
                GitHub
              </a>
              <a href="#" className="oauth-btn">
                <svg viewBox="0 0 24 24">
                  <path fill="#5865F2" d="M20.3 4.4A19.9 19.9 0 0 0 15.4 3c-.2.4-.5 1-.7 1.4a18.3 18.3 0 0 0-5.4 0c-.2-.5-.4-1-.7-1.4-1.7.3-3.4.8-4.9 1.4C1 8.9.3 13.3.6 17.6a20 20 0 0 0 6.1 3.1c.5-.7.9-1.4 1.3-2.2-.7-.3-1.4-.6-2-1.1l.4-.4a14.3 14.3 0 0 0 11.9 0l.4.4c-.6.4-1.3.8-2 1.1.4.8.8 1.5 1.3 2.2a20 20 0 0 0 6.1-3.1c.4-5-.9-9.4-3.8-13.2zM8.7 15c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.1 1.8-2.1s1.9 1 1.8 2.1c0 1.2-.8 2.1-1.8 2.1zm6.6 0c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.1 1.8-2.1s1.9 1 1.8 2.1c0 1.2-.8 2.1-1.8 2.1z" />
                </svg>
                Discord
              </a>
              <a href="#" className="oauth-btn">
                <svg viewBox="0 0 24 24">
                  <rect width="10" height="10" x="1" y="1" fill="#F25022" />
                  <rect width="10" height="10" x="13" y="1" fill="#7FBA00" />
                  <rect width="10" height="10" x="1" y="13" fill="#00A4EF" />
                  <rect width="10" height="10" x="13" y="13" fill="#FFB900" />
                </svg>
                Microsoft
              </a>
            </div>

            <p className="auth-switch">Don't have an account? <a href="/signup">Create one free</a></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;
