(function(){
  // debugger
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    
    var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        var cred = authResult.additionalUserInfo;
        if(authResult.additionalUserInfo)
          if(cred.isNewUser)
          send_emailVerification();
          function send_emailVerification(){
            var user = firebase.auth().currentUser;
            user.sendEmailVerification().then(function(){
          
            })
            .catch(function(error){
          
            })
          }
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return true;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'home.html',
    signInOptions: [
         firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    
    // Terms of service url.
    tosUrl: 'home.html',
  };
  
    // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig);   
})()
