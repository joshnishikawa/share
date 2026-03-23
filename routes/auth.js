const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate Google OAuth flow
router.get('/google', function(req, res, next) {
  // Get the referring page to redirect back after auth
  let returnTo = '/';
  const referer = req.get('Referer');

  if (referer) {
    try {
      // Parse the referer URL and extract just the path
      const refererUrl = new URL(referer);

      // Security: Only allow redirects to same domain
      if (refererUrl.hostname === req.hostname) {
        returnTo = refererUrl.pathname + refererUrl.search + refererUrl.hash;
      } else {
        console.warn('Rejected cross-domain redirect attempt:', refererUrl.hostname);
        returnTo = '/';
      }
    } catch (e) {
      console.warn('Failed to parse referer URL:', e.message);
      returnTo = '/';
    }
  }

  // Use OAuth state parameter to preserve returnTo through the flow
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: Buffer.from(JSON.stringify({ returnTo })).toString('base64')
  })(req, res, next);
});

// Google OAuth callback handler
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // Get returnTo from OAuth state parameter
    let redirectTo = '/';
    if (req.query.state) {
      try {
        const state = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
        // Security: Validate redirect path starts with / and doesn't contain protocol
        if (state.returnTo &&
            typeof state.returnTo === 'string' &&
            state.returnTo.startsWith('/') &&
            !state.returnTo.startsWith('//') &&
            !state.returnTo.includes(':')) {
          redirectTo = state.returnTo;
        }
      } catch (e) {
        console.error('Error decoding state parameter:', e.message);
      }
    }

    res.redirect(redirectTo);
  }
);

// Logout
router.get('/logout', function(req, res, next) {
  // Save the referring page to redirect back after logout
  let redirectTo = '/';
  const referer = req.get('Referer');

  if (referer) {
    try {
      // Parse the referer URL and extract just the path
      const refererUrl = new URL(referer);

      // Security: Only allow redirects to same domain
      if (refererUrl.hostname === req.hostname) {
        redirectTo = refererUrl.pathname + refererUrl.search + refererUrl.hash;
      } else {
        console.warn('Rejected cross-domain redirect attempt:', refererUrl.hostname);
        redirectTo = '/';
      }
    } catch (e) {
      console.warn('Failed to parse referer URL:', e.message);
      redirectTo = '/';
    }
  }

  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function(err) {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect(redirectTo);
    });
  });
});

module.exports = router;
