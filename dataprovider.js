function serverCall(url, method, data, successCallback, errorCallback, completeCallback ){

    $.ajax({
        type: method,
        url: url,
        async: true,
        crossDomain: true,
        success : successCallback,
        error : errorCallback,
        complete : completeCallback
    });
}