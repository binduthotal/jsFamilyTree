function onWindowLoad() {
    var firebase = app_fireBase;
    var uid = null;
    var name, email;
  
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        const userI = firebase.auth().currentUser;
  
        if (user != null) {
          currentUser = user.displayName;
          email = user.email;
          uid = user.uid;
        }
  
      }
      else {
        uid = null;
        //redirect to login page
        window.location.replace("index.html");
      }
      document.getElementById("displayName").innerHTML = "Hello  " + currentUser;
    });
  }

    // logOut = logOut;
  function logOut() {
    firebase.auth().signOut();
  }