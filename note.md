# 網頁設計筆記區
這是高三寒假的學習歷程「泥巴王國」作業，現在已經轉到themudkingdom的網站了。開始寫時間(2022年2月)

## 架構
一個引導動畫，一個目錄頁面，很多個文章頁面

## 目錄頁面架構
用地圖的模式來當目錄，主角會在泥巴王國的地圖裡面移動，到不同地方可以選擇不同文章
使用HTML img map
https://spicyboyd.blogspot.com/2018/06/web-html-map-tag.html
https://www.w3schools.com/html/html_images_imagemap.asp
document.documentElement.clientHeight * 0.65;

先使用bootstrap作外框基本架構，再用ifram來做移動的框框

使用vw/vh這個單位可以直接讓圖片適合螢幕尺寸
https://pjchender.blogspot.com/2015/04/css-3vh-vw.html


html基本引用
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-/bQdsTh/da6pkI1MST/rWKFNjaCP5gBSY4sEBT38Q/9RBh9AH40zEOg7Hlq2THRZ"
        crossorigin="anonymous"></script>


第一行：
第二行：響應式網站偵測螢幕尺寸
第三行：bootstrap的css
第四行：jquery
第五行：bootstrap的css

### 地圖邊界問題
從圖片中可以看出座標跑掉的狀況只在x軸發生，y軸都正常，而且x直越大跑掉的程度越嚴重，因次推測是跟螢幕比例有關。網頁中圖片上下都是頂到視窗的，只有左右有留白。
在製作比例數據時除的是圖片的寬度數值，而在網頁呈現實乘的式整個螢幕（包含留白區）的寬度，因此會出現差別。要再想想解決方法。
解法：把取得螢幕寬度的程式碼改成取得圖片寬度的程式碼，這樣就解決了！


csv轉json檔案的網站：https://csvjson.com/csv2json
font file convert:https://cloudconvert.com/



### scroll magic
https://scrollmagic.io/examples/basic/reveal_on_scroll.html

##### 想法
在一開始的訊息區，希望可以是一則一則滑進頁面


### 地圖模式改善
用回底圖+物件的定位方法