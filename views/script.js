function fbSDKLoaded(){
    
    FB.getLoginStatus(response=> {
        console.log(response);
    });
    }