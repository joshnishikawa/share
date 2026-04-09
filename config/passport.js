const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db.js');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL
    },
    async function(accessToken, refreshToken, profile, done) {
      try {
        const connection = await pool.getConnection();

        try {
          // Check if user exists
          const [rows] = await connection.execute(
            'SELECT * FROM users WHERE google_id = ?',
            [profile.id]
          );

          let user;
          const now = new Date();

          if (rows.length > 0) {
            // User exists, update last_login
            user = rows[0];
            await connection.execute(
              'UPDATE users SET last_login = ?, name = ?, email = ?, profile_picture = ? WHERE id = ?',
              [now, profile.displayName, profile.emails[0].value, profile.photos[0]?.value || null, user.id]
            );
            user.last_login = now;
            user.name = profile.displayName;
            user.email = profile.emails[0].value;
            user.profile_picture = profile.photos[0]?.value || null;
          } else {
            // Create new user
            const [result] = await connection.execute(
              'INSERT INTO users (google_id, email, name, profile_picture, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)',
              [
                profile.id,
                profile.emails[0].value,
                profile.displayName,
                profile.photos[0]?.value || null,
                now,
                now
              ]
            );

            user = {
              id: result.insertId,
              google_id: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              profile_picture: profile.photos[0]?.value || null,
              created_at: now,
              last_login: now
            };
          }

          return done(null, user);
        } finally {
          connection.release();
        }
      } catch (err) {
        console.error('Error in Google OAuth strategy:', err);
        return done(err, null);
      }
    }
  ));

  // Serialize user for session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async function(id, done) {
    try {
      const connection = await pool.getConnection();

      try {
        const [rows] = await connection.execute(
          'SELECT * FROM users WHERE id = ?',
          [id]
        );

        if (rows.length > 0) {
          done(null, rows[0]);
        } else {
          done(null, false);
        }
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('Error deserializing user:', err);
      done(err, null);
    }
  });
};
