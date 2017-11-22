(function (angular) {
  function loginController($root) {
    this.login = () => {
      this.loggingIn = true;
      firebase.auth().signInWithEmailAndPassword(this.account.email, this.account.password)
        .then(() => {
          this.loggingIn = false;
        })
        .catch((err) => {
          this.loggingIn = false;
          this.allowReset = false;
          this.loginError = null;
          if (err.code === 'auth/user-not-found') {
            this.loginError = 'We didn\'t find that email address';
          } else if (err.code === 'auth/invalid-email') {
            this.loginError = 'That doesn\'t look like an email address';
          } else {
            this.loginError = 'Your password isn\'t right.';
            this.allowReset = true;
          }
          $root.$digest();
          console.error(err);
        });
    };
    this.register = () => {
      if (this.account.password === this.account.confirmedPassword && this.account.password && this.account.password !== '' && this.account.email) {
        this.creatingAccount = true;
        firebase.auth().createUserWithEmailAndPassword(this.account.email, this.account.password)
          .then(() => {
            this.creatingAccount = false;
          })
          .catch((err) => {
            this.creatingAccount = false;
            this.loginError = err;
            console.error(err);
          });
      }
    };
    this.resetPassword = () => {
      if (this.account.email) {
        firebase.auth().sendPasswordResetEmail(this.account.email);
        this.loginError = 'Check your inbox for reset instructions';
        this.allowReset = false;
      }
    };
    this.googleLogin = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      firebase.auth().signInWithPopup(provider);
    };
    this.facebookLogin = () => {
      const provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().signInWithPopup(provider);
    };
    this.logout = () => {
      firebase.auth().signOut();
    };
  }

  angular.module('AvalonConnects')
    .component('login', {
      templateUrl: 'views/login.html',
      controller: ['$rootScope', loginController],
    });
}(angular));
