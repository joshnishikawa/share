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
    this.onAuthChangeCallbacks = [];

    this.init();
  }

  async init() {
    await this.fetchUser();
    this.render();
  }

  async fetchUser() {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();

      this.authenticated = data.authenticated;
      this.user = data.user;

      // Trigger callbacks when auth state changes
      this.onAuthChangeCallbacks.forEach(callback => callback(this.authenticated, this.user));
    } catch (err) {
      console.error('Error fetching user:', err);
      this.authenticated = false;
      this.user = null;
    }
  }

  render() {
    if (!this.container) return;

    if (this.authenticated && this.user) {
      // Signed in - show profile
      this.container.className = 'auth-widget signed-in';
      this.container.innerHTML = `
        <img src="${this.escapeHtml(this.user.profile_picture || '/default-avatar.png')}"
             alt="${this.escapeHtml(this.user.name)}"
             class="profile-pic"
             title="${this.escapeHtml(this.user.name)}" />
        <a href="/auth/logout" class="btn-logout" title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </a>
      `;
    } else {
      // Not signed in - show sign-in button
      this.container.className = 'auth-widget signed-out';
      this.container.innerHTML = `
        <a href="/auth/google" class="btn-signin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in to sync
        </a>
      `;
    }
  }

  // Public methods
  isAuthenticated() {
    return this.authenticated;
  }

  getUser() {
    return this.user;
  }

  onAuthChange(callback) {
    this.onAuthChangeCallbacks.push(callback);
  }

  async refresh() {
    await this.fetchUser();
    this.render();
  }

  // Utility
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
