var Data;
var htmlContent = [];
var current = 1; //目前頁面
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
    console.log(Data);
    
    var card_container = document.querySelector('.main__card__container');
    var meet_index = 0; //用來計算總共符合該地區資料的總比數
    var page_count = 0; //計算有幾頁
    htmlContent = []; //每點選新的區域時就會清空所有資料

    //初始化
    document.querySelector('.main__area_title').textContent = location; //更新查詢地區標題名稱
    document.querySelector('.main__area--noSelect').style.display = 'none'; //將未選擇地區文字提示隱藏起來
    document.querySelector('.main__area--noData').style.display = 'none'; //將查無此地區資料文字提示隱藏出來

    htmlContent[page_count] = ""; //先將內容清空;才不會下面+=的時候出現undefined的錯誤

    for(let i = 0; i < Data.length; i++){
        if(Data[i]['Zone'] == location){
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

            if(meet_index % 10 == 0){
                //資料每10筆做一次分頁
                page_count++;
                htmlContent[page_count] = "";
            }
        }
    }
    
    //資料數為0時顯示無資料訊息
    if(meet_index == 0){
        document.querySelector('.main__area--noData').style.display = 'block'; //將查無此地區資料文字提示顯示出來
    }
    else if(meet_index > 10){
        //資料大於10時就要開始做分頁區塊了
        var page_container = document.querySelector('.main__changePage ul');
        //初始新增一個上一頁按鈕;目前為第一頁的話就不能點選上一頁
        var page_html = "";
        if(current == 1){
            page_html = `<li><a class="prev disabled">＜prev</a></li>`; 
        }
        else{
            var page_html = `<li><a class="prev" onclick="change_page(${current-1})">＜prev</a></li>`; 
        }
        
        for(let i = 1; i <= htmlContent.length; i++){
            if(i == current) {
                //當i為目前頁面時多加一個current class樣式
                page_html += `<li><a class="current page_${i}" onclick="change_page(${i})">${i}</a></li>`;
                continue;
            }
            page_html += `<li><a class="page_${i}" onclick="change_page(${i})">${i}</a></li>`;
        }

        page_html += `<li><a class="next" onclick="change_page(${current+1})">next＞</a></li>`; //頁數跑完後改跑下一頁按鈕

        page_container.innerHTML = page_html;
    }

    //呈現目前頁面資料
    card_container.innerHTML = htmlContent[current-1]; //因為陣列是從0開始，而目前頁面初始是1所以要-1
}

function change_page(page){
    
    let card_container = document.querySelector('.main__card__container');
    
    $('.page_'+ current).removeClass('current'); //刪除上一次頁面的樣式

    current = page; //更新頁數

    $('.page_'+ current).addClass('current'); //在目前頁加上樣式

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