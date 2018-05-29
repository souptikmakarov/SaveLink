function getRequest(url, successCallback, errorCallback, completeCallback ){

    $.ajax({
        type: 'GET',
        url: url,
        async: true,
        crossDomain: true,
        success : successCallback,
        error : errorCallback,
        complete : completeCallback
    });
}
function postRequest(url, data, successCallback, errorCallback, completeCallback){
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        // async: true,
        // crossDomain: true,
        success : successCallback,
        error : errorCallback,
        complete : completeCallback
    });
}