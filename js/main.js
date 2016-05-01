var userInfoById = {};
var historyId = 0;

function getHistory(id) {
    delHistory()
    var f_userid = 0;
    f_userid = historyId;
    if(id != undefined)
    {
        f_userid = id;
        historyId = id;
    }    
    console.log("Загрузка истории... [" + f_userid + "]");
    addScript('https://api.vk.com/method/messages.getHistory?user_id=' + f_userid + '&access_token=' + document.getElementById("access_token").value + '&callback=showMsg&count=200');
}

/*
function sendMessage () {
	console.log("Отправка сообщения...");
	var message = document.getElementById("message").innerHTML;
	var p = document.getElementById("history");
	var newMsg = document.createElement("p");
	if(document.getElementById("isCrypt").checked){
		
		var aes = new pidCrypt.AES.CBC();
		var crypted = aes.encryptText(message, "0125f4fb89b4ab836b65d9b768c4036ce5bf1edbecfade8837c9b18f70fb0cb3", {nBits: 256});
		newMsg.innerHTML = f_pairname[my_id] + " [Р] : " + message + "<br>";
		addScript('https://api.vk.com/method/messages.send?user_id=' + f_userid + '&message=' + encodeURIComponent('/cr0/' + crypted) +'&access_token=' + document.getElementById("access_token").value + '&callback=sendMsg');
		
	}else{
		
		addScript('https://api.vk.com/method/messages.send?user_id=' + f_userid + '&message=' + encodeURIComponent(message) +'&access_token=' + document.getElementById("access_token").value + '&callback=sendMsg');
		newMsg.innerHTML = f_pairname[my_id] + " : " + message + "<br>";
		
	}
	
	// Если сообщение не пустое отбражаем
	if(message != "") p.appendChild(newMsg);
	
	// Очистка окна набора сообщения
	document.getElementById("message").innerHTML = "";
	historyChange()
	alert("Сообщение отправлено! :)")
	console.log("Сообщение отправлено!");
}*/

function addScript(src) {
    var elem = document.createElement("script");
    elem.src = src;
    document.head.appendChild(elem);
}



function showMsg(data) {
    for (var i = 1; i <= data.response.length - 1; i++) {
        writeMessage(data.response[i], false);
    };
    console.log("История загружена!");   
}

function writeMessage(response, quote) {

    var p = document.getElementById("history");
    var newMsg = document.createElement("p");
    
    // Ищем имя в "базе"
    var name = 0;
    if (userInfoById[response.uid] != undefined) {
        // Из Игорь Иванов делаем => Игорь
        name = userInfoById[response.uid].name.split(' ')[0];
    }
    else {
        // Если доступных именах нет, ставим просто id
        // TODO: Придумать что-то с этим
        name = response.uid;
    }

    
    newMsg.innerHTML = name + " : " + response.body + "<br>";
    if(quote == true){
        newMsg.innerHTML =">>" + name + " : " + response.body + "<br>";
    }
    if (response.attachments != undefined) {
        console.log("Прикрепленные объекты:" + response.attachments.length);
        if (response.attachments.length > 0) {
            for (var it = 0;  it <= response.attachments.length - 1; it++) {
                if (response.attachments[it].type == 'photo') {
                    var img = document.createElement("img")
                    img.src = response.attachments[it].photo.src;
                    img.alt = response.attachments[it].photo.src_big;
                        
                    // Функция увелечения по клику
                    img.setAttribute("onclick", "javascript:getBigPhoto(this)");
                    document.getElementById("history").appendChild(img);
                }
            }
        }
    }  
    else if (response.fwd_messages != undefined) {
        console.log("Пересланных сообщений:" + response.fwd_messages.length);
        if (response.fwd_messages.length > 0) {
            for (var it = 0; it <= response.fwd_messages.length - 1; it++) {
                writeMessage(response.fwd_messages[it], true)
            }
        }
    }

    if (response.body != "") {
        p.appendChild(newMsg);
    }
}

function delHistory() {
    console.log("Удаление истории...");
    var element = document.getElementById("history");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    console.log("История удалена!");
}

function delDialogs() {
   var elements = document.getElementsByClassName('friend');
    while(elements[0]) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function getBigPhoto(it) {
    it.src = it.getAttribute("alt");
}

function setAccess_token() {

    console.log("Сохранение ключа...");
    var token = prompt();
    document.getElementById("access_token").value = token;
    document.cookie = "access_token=" + document.getElementById("access_token").value + "; path=/; expires=Tue, 19 Jan 2033 16:00:00 GMT";

}

function delAccess_token() {

    console.log("Удаление ключа...");
    var date = new Date(0);
    document.cookie = "access_token=; path=/; expires=" + date.toUTCString();

}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function historyChange() {

    // Переход к концу истории сообщений
    var b = document.getElementById("history");
    b.scrollTop = b.scrollHeight;

}

function getDialogs() {

    addScript('https://api.vk.com/method/execute?code=' + encodeURIComponent('var z =  API.messages.getDialogs({"count":"15"}).items;return {"u_mes":z,"userinfo":API.users.get({"user_ids":z@.message@.user_id,"fields":"photo_50,online"}),"my_info":API.users.get({})};') + '&access_token=' + document.getElementById("access_token").value + '&callback=showDialogs&v=5.34');

}

function find(array, value) {
    if (array.indexOf) { // если метод существует
        return array.indexOf(value);
    }
}


function showDialogs(data) {
    
      delDialogs();
      
    // Добавляем все доступные имена в массив
    for (var i = 0; i < data.response['userinfo'].length; i++) {
        if(data.response['userinfo'][i]["online"] == 1 && data.response['userinfo'][i]["online_mobile"] == 1)
        {
            data.response['userinfo'][i]["online"] = 2;
        }
        userInfoById[data.response['userinfo'][i]["id"]] = {
            name:data.response['userinfo'][i]["first_name"] + " " + data.response['userinfo'][i]["last_name"],
            photo:data.response['userinfo'][i]["photo_50"],
            online:data.response['userinfo'][i]["online"],
        };
    }
    
    // Добавляем своё имя в общий массив
    userInfoById[data.response['my_info'][0]["id"]] = {
            name:data.response['my_info'][0]["first_name"] + " " + data.response['my_info'][0]["last_name"],
            photo:0,
            online:0,
        };
    
    // Проходим по массиву диалогов и добавляем кнопки
    var p = document.getElementById("contact-list");
    for (var i = 0; i < data.response['u_mes'].length; i++) {

        var newFriend = document.createElement("div");
        newFriend.className = 'friend'; 
        
        
        // Проверяем чат это или нет
        if (data.response["u_mes"][i]["message"]["chat_id"] == undefined) {
            // Если НЕ чат, то запрос через обычный id и Название - это имя и фамилия пользователя
            newFriend.setAttribute("onclick", "getHistory (" + data.response["u_mes"][i]["message"]["user_id"] + ")");
            newFriend.innerHTML += '<img class="friend-avatar" src="' + userInfoById[data.response["u_mes"][i]["message"]["user_id"]].photo + '">';
            newFriend.innerHTML += '<p class="friend-name">' + userInfoById[data.response["u_mes"][i]["message"]["user_id"]].name + '</p>';
            if(userInfoById[data.response["u_mes"][i]["message"]["user_id"]].online == 1){
                newFriend.className += ' online';
            } else if(userInfoById[data.response["u_mes"][i]["message"]["user_id"]].online == 2)
            {
                newFriend.className += ' online-mobile';
            }
        }
        else {
            // Если чат, то запрос через 2000000000 + id и Название - это название чата 
            newFriend.setAttribute("onclick", "getHistory (" + (2000000000 + data.response["u_mes"][i]["message"]["chat_id"]) + ")");
            if(data.response["u_mes"][i]["message"]["photo_50"] != undefined){
                newFriend.innerHTML += '<img class="friend-avatar" src="' + data.response["u_mes"][i]["message"]["photo_50"] + '">';
            } else{           
                newFriend.innerHTML += '<img class="friend-avatar" src="img/default-avatar.png">';
            }          
            newFriend.innerHTML += '<p class="friend-name">' + data.response["u_mes"][i]["message"]["title"] + '</p>';
        }
        p.appendChild(newFriend);
    }
}