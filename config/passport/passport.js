//load bcrypt
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport, user){
  var User = user;
  var LocalStrategy = require('passport-local').Strategy;
  var BearerStrategy = require('passport-http-bearer').Strategy;

passport.use('local-signup', new LocalStrategy (
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true //allows us to pass back the entire request to the callback
  },
  function(req, email, password, done){
    var generateHash = function(password){
      return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
    };

    User.findOne({
      where:{
        email:email
      }
    }).then(function(user){
      if(user)
      {
        return done(null, false, {
          message:'That email is already taken'
        });
      } else
      {
        var userPassword = generateHash(password);
        var data =
        {
          email: email,
          password: userPassword,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          child_1_fname: req.body.child_1_fname
        };

        User.create(data).then(function(newUser, created){
          if(!newUser){
            return done(null, false);
          }
          if (newUser){
            return done(null, newUser);
          }
        });
      }
    });
  }
));
  //serialize
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  //deserialize user
  passport.deserializeUser(function(id, done) {
    User.findById(id).then(function(user) {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });
  //local signin
  passport.use('local-signin', new LocalStrategy (
    {
      //by default, local strategy uses username and password, we will override w email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {
      var User = user;

      var isValidPassword = function(userpass, password) {
        return bCrypt.compareSync(password, userpass);
      }
      User.findOne({
        where: {
          email: email
        }
      }).then(function(user){
        if (!user) {
          return done (null, false, {
            message: 'Email does not exist'
          });
        }
        if (!isValidPassword(user.password, password)) {
          return done(null, false, {
            message: 'Incorrect password.'
          });
        }
        var userinfo = user.get();
        return done(null, userinfo);
      }).catch(function(err){
        console.log("Error:", err);

        return done(null, false, {
          message: 'Something jwent wrong with your Signin'
        });
      });
    }
  ));

  passport.use(new BearerStrategy (
    function(token, done) {
      User.findOne({ token: token }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user, {scope: 'all'});
      });
    }
  ));

}
