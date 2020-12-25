var Data;
var htmlContent = [];
var current = 1; //目前頁面
var meet_index = 0; //用來計算總共符合該地區資料的總比數
var page_count = 0; //計算有幾頁
var current_changePage = 0; //用來計算切換了幾次分頁(每五個為一筆)
var page_html = "";//頁面按鈕HTML字串元素

$(document).ready(function(){
    //網頁載入完成後就去抓取API資料
    $.ajax({
        url:"https://raw.githubusercontent.com/hexschool/KCGTravel/master/datastore_search.json",
        dataType: 'json',
        success:function(result){
            Data = result['result']['records'];
        }
    });

    //以下為熱門地區查詢按鈕添加click事件
    var popular_btn = document.querySelectorAll('.header__popular button');

    for(let i = 0; i < popular_btn.length; i++){
        popular_btn[i].addEventListener('click', function(e){
            location_dataGet(e.target.textContent); //傳地區名稱到方法處理
        });
    }

    //以下為新增下拉式選單change事件
    var select_location = document.querySelector('.header__location');

    select_location.addEventListener('change',function(e){
        location_dataGet(e.target.value); //傳地區名稱到方法處理
    });
});


//地區資料快速查詢方法
function location_dataGet(location){
    var card_container = document.querySelector('.main__card__container');
    var page_container = document.querySelector('.main__changePage ul');
    meet_index = 0; //用來計算總共符合該地區資料的總比數
    page_count = 0; //計算有幾頁
    page_html = "";//初始頁面按鈕
    current = 1; //將頁面初始化
    htmlContent = []; //每點選新的區域時就會清空所有資料

    //初始化
    document.querySelector('.main__area_title').textContent = location; //更新查詢地區標題名稱
    document.querySelector('.main__area--noSelect').style.display = 'none'; //將未選擇地區文字提示隱藏起來
    document.querySelector('.main__area--noData').style.display = 'none'; //將查無此地區資料文字提示隱藏出來

    htmlContent[page_count] = ""; //先將內容清空;才不會下面+=的時候出現undefined的錯誤

    for(let i = 0; i < Data.length; i++){
        if(location == "全部區域"){ 
            data_screen_add(i);
        }
        else{
            if(Data[i]['Zone'] == location){
                data_screen_add(i);
            }
        }
    }
    
    //資料數為0時顯示無資料訊息
    if(meet_index == 0){
        document.querySelector('.main__area--noData').style.display = 'block'; //將查無此地區資料文字提示顯示出來
    }
    else if(meet_index > 12){
        //資料大於12時就要開始做分頁區塊了
        var overflow_str = ""; //看是否超過最大頁數，如超過則加入隱藏元素

        if(current == 1){
            page_html = `<li><a class="prev disabled">${$(window).width()<375 ? "＜" : "＜prev"}</a></li>`; 
        }
        else{
            var page_html = `<li><a class="prev" onclick="change_page(${current-1})">${$(window).width()<375 ? "＜" : "＜prev"}</a></li>`; 
        }
        
        for(let i = 1; i <= htmlContent.length; i++){
            if(i == 6) { //頁數不得超過5
                overflow_str = "overflow";
            }
            if(i == current) {
                //當i為目前頁面時多加一個current class樣式
                page_html += `<li class="li_${i} ${overflow_str}"><a class="current page_${i}" onclick="change_page(${i})">${i}</a></li>`;
                continue;
            }
            page_html += `<li class="li_${i} ${overflow_str}"><a class="page_${i}" onclick="change_page(${i})">${i}</a></li>`;
        }

        if(htmlContent.length >= 6){
            page_html += `<li class="overflow_li"><span>...</span></li>`;
        }

        page_html += `<li><a class="next" onclick="change_page(${current+1})">${$(window).width()<375 ? "＞" : "next＞"}</a></li>`; //頁數跑完後改跑下一頁按鈕

    }

    //呈現目前頁面資料
    card_container.innerHTML = htmlContent[current-1]; //因為陣列是從0開始，而目前頁面初始是1所以要-1

    //更新頁數區塊
    page_container.innerHTML = page_html;
}

function change_page(page){
    let card_container = document.querySelector('.main__card__container');
    let select_status = current < page ? true : false; //判斷是否點選比上次大的頁數
    let current_one_page = 1; //計算每次更新頁面區塊後的第一個頁數是多少
    
    $('.page_'+ current).removeClass('current'); //刪除上一次頁面的樣式

    current = page; //更新頁數

    $('.page_'+ current).addClass('current'); //在目前頁加上樣式

    if(htmlContent.length > 5){ //總資料大於5筆才會做分頁進階處理;否則就是基本的 1 ~ 5
        if((current+current_changePage) % 5 == 0 && select_status){ 
            //已經到最大顯示頁數範圍的最後一頁，所以此時要更新頁數區塊的數字 1 2 3 4 [5] => [5] 6 7 ...
            for(let i = 0; i < 5; i++){ //此迴圈為讓前四個隱藏;後四個顯示
                $('.li_'+ (current - (i + 1))).addClass('overflow');
                $('.li_'+ (current + i)).removeClass('overflow');
            }
            current_changePage++;
        }
        
        if(current % 4 == 0 && !select_status){
            for(let i = 0; i < 4; i++){ //此迴圈為讓前四個頁數顯示;後四個隱藏
                $('.li_'+ (current - i)).removeClass('overflow');
                $('.li_'+ (current + (i + 2))).addClass('overflow');
            }
            current_changePage--;
        }
    
        //計算當下第一個頁面bar的頁數;因為每次最後一筆都會成為下次的第一筆,所以這邊加四 1,2,3,4,[5] => 5+4 => 5,6,7,8,[9]
        for(let i = 0; i < current_changePage; i++){
            current_one_page += 4;
        }
        //此判斷為目前第一筆頁數+4是否會大於等於最大資料筆數;用來判斷是否隱藏...的按鈕
        if(current_one_page + 4 >= htmlContent.length){
            $('.overflow_li').addClass('overflow');
        }
        else{
            $('.overflow_li').removeClass('overflow');
        }
    }
    
    if(current == 1) {
        //頁面為第一頁時鎖定上一頁按鈕
        $('.prev').addClass('disabled');
        $('.prev').prop("onclick",null).off("click");
    }
    else {
        //表示上一頁按鈕功能正常
        $('.prev').removeClass('disabled');
        $('.prev').attr('onclick',`change_page(${current-1})`);
    }

    if(current == htmlContent.length) {
        //頁面為最後一頁時鎖定下一頁按鈕
        $('.next').addClass('disabled');
        $('.next').prop("onclick",null).off("click");
    }
    else {
        //表示上一頁按鈕功能正常
        $('.next').removeClass('disabled');
        $('.next').attr('onclick',`change_page(${current+1})`);
    }

    //更新目前頁面資料
    card_container.innerHTML = htmlContent[current-1];
}

function data_screen_add(i){
    meet_index++;
    htmlContent[page_count] += `<div class="main__card" data-index="${i+1}">`+
            '<div class="main__card_header"'+
                `style="background: url(\'${Data[i]['Picture1']}\');">`+

                '<div class="main__card__location">'+
                    `<p class="main__card__location__title">${Data[i]['Name']}</p>`+
                    `<p class="main__card__location__name">${Data[i]['Zone']}</p>`+
                '</div>'+

            '</div>'+
            '<div class="main__card_body">'+
                '<p class="main__card__body__clock"><img src="image/icons_clock.png" alt="clock">'+
                    `&nbsp;<span>${Data[i]['Opentime']}</span></p>`+
                '<p class="main__card__body__address"><img src="image/icons_pin.png" alt="address">'+
                    `&nbsp;<span>${Data[i]['Add']}</span></p>`+
                '<div class="main__card__body__footer">'+
                    '<p class="main__card__body__phone"><img src="image/icons_phone.png"'+
                            `alt="phone">&nbsp;&nbsp;<span>${Data[i]['Tel']}</span></p>`+
                    '<p class="main__card__body__tag"><img src="image/icons_tag.png" alt="tag"><a '+
                            `href="#">${Data[i]['Ticketinfo']}</a>`+
                    '</p>'+
                '</div>'+
            '</div>'+
        '</div>'

    if(meet_index % 12 == 0){
        //資料每12筆做一次分頁
        page_count++;
        htmlContent[page_count] = "";
    }
}

//響應式分頁區塊
$(window).resize(function() {
    var width = $(this).width();
    if(width < 375){
        $(".prev").text("＜");
        $(".next").text("＞");
    }
    else{
        $(".prev").text("＜prev");
        $(".next").text("next＞");
    }
});
