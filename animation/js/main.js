"use strict"; $(function () { var i = window.navigator.userAgent; ("Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)" === i || "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko" === i || "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0" === i || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586" === i || i.indexOf("MSIE ") > -1 || i.indexOf("Trident/") > -1 || i.indexOf("Edge/") > -1) && $(".index").addClass("IE_Static_BG"); var o = navigator.userAgent; o.indexOf("Safari") > -1 && o.indexOf("Mac") > -1 && o.indexOf("iPhone") === -1 && $("body").addClass("MacSafari"); var e; $(".openModal").each(function () { $(this).on("click", function () { e = $(window).scrollTop(); var i = $(this).attr("data-modal"); $(".modal").each(function () { var o = $(this).attr("id"); i === o ? ($(this).addClass("open"), window.innerWidth <= 1024 && $("body").css("position", "fixed").css("left", "0px").css("right", "0px").css("top", e + "px")) : $(this).removeClass("open") }) }) }), $(".closeModal").on("click", function () { $(this).parent(".modal").removeClass("open"), window.innerWidth <= 1024 && ($("body").attr("style", ""), $(window).scrollTop(e), console.log(e)) }), $(".choose a").each(function (i) { $(this).on("click", function () { $(this).addClass("active"), $(this).siblings().removeClass("active"), $(".lawBox").eq(i).addClass("show"), $(".lawBox").eq(i).siblings().removeClass("show") }) }), $(".innergotop").click(function () { $("html,body").animate({ scrollTop: 0 }, 600) }) });
//# sourceMappingURL=http://localhost:3000/_maps/main.js.map