var authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport){

    app.get('/signup', authController.signup);

    app.get('/signin', authController.signin);

    app.post('/signup', passport.authenticate('local-signup', {
      successRedirect: '/dashboard',

      failureRedirect: '/'
      }
    ));

    //Commented this because it was breaking api-routes, didn't notice a change in functionality once commented out
    //app.get('/dashboard',isLoggedIn, authController.dashboard);

    app.get('/logout', authController.logout);

    app.post('/signin', passport.authenticate('local-signin', {
      successRedirect: '/dashboard',

      failureRedirect: '/'
      }
    ));

    function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
        return next();
      res.redirect('/signin');
    }

    app.get('/profile',
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
      res.json(req.user);
    });

}
