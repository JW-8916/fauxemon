"use strict";

class AJAX{
    static get(url,successCallback, failureCallback, formData=null){
        let xhr = new XMLHttpRequest();
        xhr.onload = function(){
            if( xhr.status >= 200 && xhr.status < 300){
                successCallback(this);
            }
            else{
                failureCallback(this);
            }
        };
        if (formData == null){
            xhr.open("GET",url,true);
        }
        else{
            let query = "?" + new URLSearchParams(formData);
            xhr.open("GET",url + query,true);
        }
        xhr.send();
    }

    static post(url,successCallback, failureCallback, formData){
        let xhr = new XMLHttpRequest();
        xhr.onload = function(){
            if( xhr.status >= 200 && xhr.status < 300){
                successCallback(this);
            }
            else{
                failureCallback(this);
            }
        };

        xhr.open("POST",url,true);
        xhr.send(formData);
    }
}