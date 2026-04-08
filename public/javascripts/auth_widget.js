////////////////////////////////////////////////////////////////////////////////
// auth_widget.js — Self-contained authentication UI widget.
//
// USAGE: Include this script, then call `new AuthWidget('elementId')`.
//        The container element should have data-signin-text for i18n.
//
// PATTERN: This is the ONLY frontend file that uses a proper ES6 class
//          with encapsulation, proper HTML escaping, and clean structure.
//          It's a good model for how other UI components could be written.
//
// GOOD PRACTICES FOUND HERE:
//   - escapeHtml() prevents XSS in user-provided data (name, profile_picture)
//   - Explicit error handling in fetchUser()
//   - Callback-based auth state notification (onAuthChange)
//   - Clean window export with typeof check
////////////////////////////////////////////////////////////////////////////////

/**
 * AuthWidget - Displays sign-in button or user profile
 * Usage: new AuthWidget('elementId')
 */
class AuthWidget {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('AuthWidget: Container element not found:', containerId);
      return;
    }

    this.user = null;
    this.authenticated = false;
    this._initComplete = false;
    this.onAuthChangeCallbacks = [];
    // i18n: pull sign-in text from the container's data attribute (set by EJS)
    this.signInText = this.container.getAttribute('data-signin-text') || 'Sign in to sync';

    this.init();
  }

  async init() {
    await this.fetchUser();
    this.render();
  }

  // Fetch auth state from the server (/api/user endpoint).
  // On failure, gracefully defaults to unauthenticated state.
  async fetchUser() {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      this.authenticated = data.authenticated;
      this.user = data.user;
    } catch (err) {
      console.error('Error fetching user:', err);
      this.authenticated = false;
      this.user = null;
    }
    // Fire callbacks after fetch completes (success or failure)
    this._initComplete = true;
    this.onAuthChangeCallbacks.forEach(callback => callback(this.authenticated, this.user));
  }

  // Render the appropriate UI: profile + logout link, or Google sign-in button.
  // Uses inline SVGs (Google logo, logout icon) — no external icon dependency.
  render() {
    if (!this.container) return;

    if (this.authenticated && this.user) {
      // Signed in - show profile
      this.container.className = 'auth-widget signed-in btn btn-sm btn-outline-primary';
      this.container.innerHTML = `
        <img src="${this.escapeHtml(this.user.profile_picture || '/default-avatar.png')}"
             alt="${this.escapeHtml(this.user.name)}"
             class="profile-pic"
             style="width: 24px; height: 24px; border-radius: 50%;"
             title="${this.escapeHtml(this.user.name)}" />
        <a href="/auth/logout" class="btn-logout" title="Sign out" style="text-decoration: none; color: inherit;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </a>
      `;
    } else {
      // Not signed in - show sign-in button
      this.container.className = 'auth-widget signed-out btn btn-sm btn-outline-primary';
      this.container.innerHTML = `
        <a href="/auth/google" style="text-decoration: none; color: inherit; display: flex; align-items: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          ${this.escapeHtml(this.signInText)}
        </a>
      `;
    }
  }

  // --- Public API ---

  isAuthenticated() {
    return this.authenticated;
  }

  getUser() {
    return this.user;
  }

  // Register a callback for auth state changes. Called immediately if
  // state is already known (avoids race conditions with late subscribers).
  onAuthChange(callback) {
    this.onAuthChangeCallbacks.push(callback);
    // If fetch already completed, call immediately with current state
    if (this._initComplete) {
      callback(this.authenticated, this.user);
    }
  }

  // Re-fetch auth state and re-render (e.g. after login/logout in another tab)
  async refresh() {
    await this.fetchUser();
    this.render();
  }

  // --- Utility ---

  // Escape HTML entities to prevent XSS when inserting user-provided strings.
  // NOTE: This is the ONLY place in the frontend that does HTML escaping.
  //       All other template builders (study_utilities.js) insert values raw.
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Export to window for use from inline scripts and other files.
if (typeof window !== 'undefined') {
  window.AuthWidget = AuthWidget;
}
