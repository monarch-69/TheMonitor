import {
  useNav,
  useReveal,
  useParallax,
  useChart,
  useLiveMetric,
  heroChartConfig,
  mainChartConfig,
  uptimeChartConfig,
  reqChartConfig,
  regionChartConfig,
} from './hooks';
import mascotImg from './images/mascot.jpg'
import './Home.css'


function Home() {
  // ---- nav ----
  const { scrolled, menuOpen, toggleMenu, closeMenu } = useNav();

  // ---- parallax ----
  const heroOrb1Ref = useParallax<HTMLDivElement>('orb', 0.08);
  const heroOrb2Ref = useParallax<HTMLDivElement>('orb', 0.15);
  const dashRef = useParallax<HTMLDivElement>('dash');
  const croOrbRef = useParallax<HTMLDivElement>('orb', 0.06);
  const croImgRef = useParallax<HTMLImageElement>('image');

  // ---- charts ----
  const heroChartRef = useChart(heroChartConfig);
  const mainChartRef = useChart(mainChartConfig);
  const uptimeChartRef = useChart(uptimeChartConfig);
  const reqChartRef = useChart(reqChartConfig);
  const regionChartRef = useChart(regionChartConfig);
  const liveMetric = useLiveMetric();

  // ---- scroll reveal (hero content is already visible on load, so it
  // keeps the static "reveal in" classes below and doesn't need a hook) ----
  const featuresHeadRef = useReveal<HTMLDivElement>();
  const featureGridRef = useReveal<HTMLDivElement>();
  const graphsHeadRef = useReveal<HTMLDivElement>();
  const graphsBodyRef = useReveal<HTMLDivElement>();
  const croCardRef = useReveal<HTMLDivElement>();
  const croCopyRef = useReveal<HTMLDivElement>();
  const integrationsHeadRef = useReveal<HTMLDivElement>();
  const intGridRef = useReveal<HTMLDivElement>();
  const pricingHeadRef = useReveal<HTMLDivElement>();
  const pricingGridRef = useReveal<HTMLDivElement>();
  const ctaBandRef = useReveal<HTMLDivElement>();

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="logo">
            <span className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 12h4l2-7 4 14 2-7h6" stroke="#0e1b19" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            The Monitor
          </a>
          <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
            <li><a href="#features" onClick={closeMenu}>Features</a></li>
            <li><a href="#graphs" onClick={closeMenu}>Live data</a></li>
            <li><a href="#cro" onClick={closeMenu}>Meet the CRO</a></li>
            <li><a href="#integrations" onClick={closeMenu}>Integrations</a></li>
            <li><a href="#pricing" onClick={closeMenu}>Pricing</a></li>
            <li><a href="/signin" onClick={closeMenu}>Sign in</a></li>
          </ul>
          <div className="nav-cta">
            <a href="/signin" className="btn btn-ghost">Sign in</a>
            <a href="/signup" className="btn btn-primary">Start free</a>
            <button className="nav-toggle" aria-label="Toggle menu" onClick={toggleMenu}>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="grid-field"></div>
        <div ref={heroOrb1Ref} className="glow-orb hero-orb-1"></div>
        <div ref={heroOrb2Ref} className="glow-orb hero-orb-2"></div>
        <div className="wrap hero-inner">
          <span className="eyebrow">99.98% average uptime across customers</span>
          <h1 className="reveal in">Know the moment<br /><em>something breaks.</em> Not after.</h1>
          <p className="hero-sub reveal in">The Monitor watches every server, endpoint and queue you run, and puts the whole picture — latency, errors, incidents — on one screen you'll actually want to look at.</p>
          <div className="hero-actions reveal in">
            <a href="/signup" className="btn btn-primary">Start monitoring free</a>
            <a href="#graphs" className="btn btn-ghost">See live data ↓</a>
          </div>
          <span className="hero-note">No credit card · 5-minute setup · cancel anytime</span>

          <div ref={dashRef} className="dash reveal in">
            <div className="dash-bar">
              <span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot live"></span>
              <span className="dash-title">monitor.app/dashboard — production</span>
            </div>
            <div className="dash-body">
              <div className="dash-panel">
                <div className="dash-panel-head">
                  <h4>Response time · last 24h</h4>
                  <span className="dash-metric">{liveMetric}</span>
                </div>
                <div style={{ height: '180px' }}>
                  <canvas ref={heroChartRef}></canvas>
                </div>
              </div>
              <div className="dash-panel">
                <div className="dash-panel-head"><h4>System status</h4></div>
                <div className="dash-stats">
                  <div className="dash-stat ok"><div className="num">210</div><div className="lbl">Services healthy</div></div>
                  <div className="dash-stat"><div className="num">3</div><div className="lbl">Watching closely</div></div>
                  <div className="dash-stat"><div className="num">0</div><div className="lbl">Down right now</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="strip">
        <div className="wrap">
          <p className="strip-label">Trusted by infrastructure teams running on</p>
          <div className="strip-row">
            <span className="item">AWS</span>
            <span className="item">Google Cloud</span>
            <span className="item">Azure</span>
            <span className="item">DigitalOcean</span>
            <span className="item">Cloudflare</span>
            <span className="item">Kubernetes</span>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="wrap">
          <div ref={featuresHeadRef} className="section-head reveal">
            <span className="eyebrow">What it does</span>
            <h2>Everything you'd check at 3am, on one page</h2>
            <p>Uptime pings are the easy part. The Monitor watches the things that actually cause outages — before your customers notice.</p>
          </div>

          <div ref={featureGridRef} className="feature-grid reveal-stagger">
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Real-time uptime</h3>
              <p>Checks run from six global regions every 15 seconds, so a blip in Frankfurt never hides behind a healthy check in Ohio.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Latency &amp; error tracking</h3>
              <p>Response time, error rate and throughput charted together, so you can see cause and effect instead of guessing at it.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Smart alerting</h3>
              <p>Get paged for what matters through Slack, email or SMS, with alert grouping so one root cause doesn't wake up the whole team.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Incident timelines</h3>
              <p>Every outage gets an automatic timeline, root cause notes and postmortem template so the next one is faster to close.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Global vantage points</h3>
              <p>Compare how your app performs from six continents at once, and catch regional degradation before it spreads.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M9 3H5a2 2 0 0 0-2 2v4m18-6h-4a2 2 0 0 0-2 2v4m-6 8H5a2 2 0 0 1-2-2v-4m18 6h-4a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Public status pages</h3>
              <p>A branded status page that updates itself, so "is it down for everyone" stops being a support ticket.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LIVE GRAPHS ================= */}
      <section className="section" id="graphs" style={{ paddingTop: '0' }}>
        <div className="wrap">
          <div ref={graphsHeadRef} className="section-head reveal">
            <span className="eyebrow">Live data</span>
            <h2>Graphs you can actually read</h2>
            <p>Hover for exact values. Every chart below is wired to the same feed your dashboard uses — this is what it looks like at 2pm on a Tuesday.</p>
          </div>

          <div ref={graphsBodyRef} className="reveal">
            <div className="graph-grid">
              <div className="graph-panel">
                <div className="graph-panel-head">
                  <div>
                    <h4>Response time vs. error rate</h4>
                    <div className="graph-legend">
                      <span><i style={{ background: '#2FC9BA' }}></i>Response (ms)</span>
                      <span><i style={{ background: '#E68A4F' }}></i>Errors (%)</span>
                    </div>
                  </div>
                  <span className="tag">Production · live</span>
                </div>
                <div style={{ height: '280px' }}>
                  <canvas ref={mainChartRef}></canvas>
                </div>
              </div>
              <div className="graph-panel">
                <div className="graph-panel-head">
                  <h4>Uptime breakdown</h4>
                  <span className="tag">30 days</span>
                </div>
                <div style={{ height: '200px', position: 'relative' }}>
                  <canvas ref={uptimeChartRef}></canvas>
                </div>
                <div className="graph-legend" style={{ marginTop: '18px', flexWrap: 'wrap' }}>
                  <span><i style={{ background: '#2FC9BA' }}></i>Operational 99.4%</span>
                  <span><i style={{ background: '#E68A4F' }}></i>Degraded 0.5%</span>
                  <span><i style={{ background: '#4a4a4a' }}></i>Downtime 0.1%</span>
                </div>
              </div>
            </div>

            <div className="graph-grid-bottom">
              <div className="graph-panel">
                <div className="graph-panel-head">
                  <h4>Requests per day</h4>
                  <span className="tag">This week</span>
                </div>
                <div style={{ height: '180px' }}>
                  <canvas ref={reqChartRef}></canvas>
                </div>
              </div>
              <div className="graph-panel">
                <div className="graph-panel-head">
                  <h4>Uptime by region</h4>
                  <span className="tag warn">1 region watching</span>
                </div>
                <div style={{ height: '180px' }}>
                  <canvas ref={regionChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cro-section section" id="cro">
        <div ref={croOrbRef} className="glow-orb cro-orb"></div>
        <div className="wrap cro-inner">
          <div ref={croCardRef} className="reveal">
            <div className="cro-card">
              <div className="cro-img-wrap">
                <img
                  ref={croImgRef}
                  src={mascotImg}
                  alt="A black cat wearing a suit and tie, the mascot of The Monitor, serving as Chief Reliability Officer"
                />
                <div className="cro-badge">
                  <div>
                    <div className="who">Olive</div>
                    <div className="role">CHIEF RELIABILITY OFFICER</div>
                  </div>
                  <div className="cro-status"><i></i>On call</div>
                </div>
              </div>
            </div>
          </div>
          <div ref={croCopyRef} className="cro-copy reveal">
            <span className="eyebrow">Meet the team</span>
            <h2>Olive doesn't sleep. She also doesn't blink.</h2>
            <p>Every monitoring platform needs someone watching the watchers. Olive was promoted to Chief Reliability Officer for exactly one reason: she has never once looked away from a screen.</p>
            <p>She reviews every alert before it reaches you, keeps the false positives out of your inbox, and has strong opinions about which incidents actually deserve a page at 3am.</p>
            <div className="cro-quote">
              "A green dashboard and a full food bowl. That's the whole job."
              <span>— Olive, Chief Reliability Officer</span>
            </div>
            <div className="cro-stats">
              <div><div className="num">0</div><div className="lbl">Naps during incidents</div></div>
              <div><div className="num">24/7</div><div className="lbl">Time on watch</div></div>
              <div><div className="num">1st</div><div className="lbl">Hire at The Monitor</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTEGRATIONS ================= */}
      <section className="section" id="integrations">
        <div className="wrap">
          <div ref={integrationsHeadRef} className="section-head reveal">
            <span className="eyebrow">Integrations</span>
            <h2>Plugs into what you already use</h2>
            <p>Alerts land where your team already lives, and setup takes one click for most of the stack below.</p>
          </div>
          <div ref={intGridRef} className="int-grid reveal-stagger">
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C7.5 4.3 6.4 4.6 6.4 4.6a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 5 11c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h4>GitHub</h4>
              <p>Turn incidents into issues automatically.</p>
            </div>
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M22 6 12 13 2 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /></svg></div>
              <h4>Slack</h4>
              <p>Route alerts to the right channel, every time.</p>
            </div>
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M4 9h16M9 20V9" stroke="currentColor" strokeWidth="1.6" /></svg></div>
              <h4>PagerDuty</h4>
              <p>Escalate on-call without leaving The Monitor.</p>
            </div>
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h4>Datadog</h4>
              <p>Cross-reference metrics without duplicate tooling.</p>
            </div>
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.6" /></svg></div>
              <h4>Zapier</h4>
              <p>Connect The Monitor to 5,000+ other tools.</p>
            </div>
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg></div>
              <h4>Microsoft Teams</h4>
              <p>Keep enterprise teams looped in on incidents.</p>
            </div>
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 4h16v4H4zM4 10h16v4H4zM4 16h10v4H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg></div>
              <h4>Webhooks</h4>
              <p>Send raw event data anywhere you build.</p>
            </div>
            <div className="int-card">
              <div className="int-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 8v4l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h4>REST API</h4>
              <p>Pull metrics and manage checks programmatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="section" id="pricing">
        <div className="wrap">
          <div ref={pricingHeadRef} className="section-head reveal">
            <span className="eyebrow">Pricing</span>
            <h2>Start free. Scale when it matters.</h2>
            <p>Every plan includes Olive's supervision. No hidden fees, no surprise overage bills.</p>
          </div>

          <div ref={pricingGridRef} className="pricing-grid reveal-stagger">
            <div className="price-card">
              <div className="price-tier">Free</div>
              <div className="price-amount"><span className="num">$0</span><span className="per">/ month</span></div>
              <p className="price-desc">For personal projects and getting a feel for the dashboard.</p>
              <ul className="price-list">
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Up to 5 monitors</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>5-minute check interval</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Email alerts</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>7-day data retention</li>
              </ul>
              <a href="/signup" className="btn btn-ghost btn-block">Start for free</a>
            </div>

            <div className="price-card featured">
              <div className="price-tier">Pro</div>
              <div className="price-amount"><span className="num">$50</span><span className="per">/ month</span></div>
              <p className="price-desc">For teams running production traffic that can't go dark.</p>
              <ul className="price-list">
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Up to 100 monitors</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>15-second check interval</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Slack, SMS &amp; PagerDuty alerts</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>1-year data retention</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Public status page</li>
              </ul>
              <a href="/signup" className="btn btn-primary btn-block">Get started</a>
            </div>

            <div className="price-card soon">
              <div className="soon-tag">Coming soon</div>
              <div className="price-tier">Enterprise</div>
              <div className="price-amount"><span className="num">Custom</span></div>
              <p className="price-desc">For organizations with dedicated infra, security review and SLAs.</p>
              <ul className="price-list">
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Unlimited monitors</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Dedicated regions &amp; SSO</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Custom SLA &amp; support line</li>
                <li><svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>On-prem option</li>
              </ul>
              <button className="btn btn-ghost btn-block" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>Join the waitlist</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '0' }}>
        <div className="wrap">
          <div ref={ctaBandRef} className="cta-band reveal">
            <div>
              <h3>Your servers are talking. Someone should listen.</h3>
              <p>Set up your first monitor in under five minutes — Olive will keep an eye on it from there.</p>
            </div>
            <a href="/signup" className="btn btn-primary">Start monitoring free</a>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-brand">
              <a href="/" className="logo">
                <span className="logo-mark">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h4l2-7 4 14 2-7h6" stroke="#0e1b19" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                The Monitor
              </a>
              <p>Server monitoring built for teams who'd rather find out from a dashboard than from a customer.</p>
            </div>
            <div className="foot-col">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#graphs">Live data</a>
              <a href="#integrations">Integrations</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <a href="#cro">Meet the CRO</a>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Status page</a>
            </div>
            <div className="foot-col">
              <h5>Account</h5>
              <a href="/signin">Sign in</a>
              <a href="/signup">Create account</a>
              <a href="#">Documentation</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 The Monitor. All systems reliable.</span>
            <span>Supervised by Olive, CRO</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
