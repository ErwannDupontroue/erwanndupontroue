$(document).ready(function(){
    Erwann.Init();

//    setInterval(function(){
//        console.log( $(window).width() + 'px - ' + $(window).height() + 'px' );
//    }, 2000);
});

var Erwann = {
    'Actions': new Object(),
    'Variables': new Object(),
    'Objects': new Object(),
    'Helpers': new Object(),
    'Init': function(){
        Erwann.Objects.Init();
        Erwann.Variables.Init();

        if (Erwann.Objects.ContentLoader.length == 0)
        {
            Erwann.Actions.InitNavigation();
        }
        else
        {
            Erwann.Actions.InitLoader();
        }

        Erwann.Actions.InitContactForm();

        $("#arrow").click(function(e){
            e.preventDefault();

            var contentFrame = $('#content-frame');
            if ( contentFrame.length > 0 )
            {
                contentFrame.animate({ 'scrollTop': 0 }, 300);
            }
            else
            {
                $('html, body').animate({ 'scrollTop': 0 }, 300);
            }
        });

        $('#content-frame-mask').css('right', Erwann.Helpers.GetScrollBarWidth() + 'px');
    }
};

Erwann.Variables = {
    Init: function() {
        //init the screen ids
        this.ScreenHashes = new Array();
        Erwann.Objects.Flip.children(".f-page").each(function(){
            Erwann.Variables.ScreenHashes.push( $(this).attr("id").replace("screen-", "") );
        });
    }
};

Erwann.Objects = {
    Init: function() {
        this.Flip = $('#flip');
        this.ContentLoader = $('#content-loader');
    }
};

Erwann.Actions = {
    'InitLoader': function() {
        var contentLoader = Erwann.Objects.ContentLoader;
        var loader = contentLoader.parent();
        var percentValue = contentLoader.find("#percent-value");
        var is100 = false;
        var loaded = 0;

        var intervalId = setInterval(function(){
            loaded += 1;
            is100 = loaded == 100;

            percentValue.text(loaded + '%');

            if ( is100 )
            {
                clearInterval(intervalId);

                setTimeout(function(){
                    loader.hide().parents('.f-page').eq(0).addClass('no-mob-loader');

                    Erwann.Helpers.SetPageElementByHash();
                    Erwann.Objects.Flip.attr('data-attr-page', Erwann.Helpers.GetScreenIndexByHash());
                    if (Erwann.Objects.Flip.length > 0)
                    {
                        Erwann.Actions.InitSlide();
                        Erwann.Actions.SetHashChangeEvent();
                    }

                    Erwann.Actions.InitNavigation();
                    setTimeout(function(){
                        Erwann.Actions.InitFlubber();
                    }, 300);
                }, 200);
            }
        }, 20);
    },

    'InitSlide': function() {
        var flip = Erwann.Objects.Flip;
        var currentFlipPage = flip.attr('data-attr-page');
        var flipInitialLeft = flip.position().left;
        var startPos = 0;
        var mouseButtonIsDown = false;
        var maxScroll = -1 * $(window).width() * 4;
        var body = $('body');

        Erwann.Objects.Flip.on('mousedown', function(e){
            currentFlipPage = flip.attr('data-attr-page');
            mouseButtonIsDown = true;
            flipInitialLeft = flip.position().left;
            startPos = e.clientX;
        }).on('mousemove', function(e){
            if ( mouseButtonIsDown )
            {
                var diff = e.clientX - startPos;
                var flipNewLeft = flipInitialLeft + diff;
                maxScroll = -1 * $(window).width() * 4;
                flipNewLeft = flipNewLeft > 0 ? 0 : flipNewLeft;
                flipNewLeft = flipNewLeft < maxScroll ? maxScroll : flipNewLeft;
                flip.css('left', flipNewLeft);
                body.addClass('closed-hand');
            }
            if (e.clientX < 150 || e.clientX > $(window).width() - 150)
            {
                body.addClass('hand');
            }
            else
            {
                body.removeClass('hand');
            }
        }).on('mouseup', function(e){
            mouseButtonIsDown = false;
            var diff = e.clientX - startPos;
                body.removeClass('closed-hand');

            if ( Math.abs(diff) > 100 )
            {
                currentFlipPage = parseInt(currentFlipPage) + (diff > 0 ? -1 : 1);
                currentFlipPage = currentFlipPage < 0 ? 0 : currentFlipPage;
                currentFlipPage = currentFlipPage > (Erwann.Variables.ScreenHashes.length-1) ? (Erwann.Variables.ScreenHashes.length-1) : currentFlipPage;

                window.location.hash = Erwann.Variables.ScreenHashes[currentFlipPage];
            }
            if ( Math.abs(diff) < 101 && diff != 0 )
            {
                flip.animate( {'left': flipInitialLeft}, 300);
            }

        });

        $(window).resize(function(){
            var currentFlipPage = flip.attr('data-attr-page');
            Erwann.Objects.Flip.css( {'left': -1 * $(window).width() * currentFlipPage });
        });

        // prevent crazy slides
        $(".site-header").on('mousedown mouseup', function(e){
            e.stopPropagation();
        });
    },

    'SetHashChangeEvent': function(){
        window.onhashchange = function(){
            Erwann.Helpers.SetPageElementByHash(true);
        };
    },

    'InitNavigation': function() {
        var navMenus = $(".site-menu");
        var fadeDuration = 100;
        var body = $('body');

        $(".site-header").each(function(){
            var siteHeader = $(this);
            var navTrigger = siteHeader.find(".nav-trigger");
            var isAnimation = false;

            navTrigger.click(function(){
                if (!isAnimation)
                {
                    isAnimation = true;

                    if (body.hasClass('show-sidebar'))
                    {
                        body.removeClass('show-sidebar');
                        $.cookie(Erwann.Variables.CookieName, 'hide-sidebar', { 'path': '/' });
                        HideMenu();
                    }
                    else
                    {
                        body.addClass('show-sidebar');
                        $.cookie(Erwann.Variables.CookieName, 'show-sidebar', { 'path': '/' });
                        ShowMenu();
                    }
                }

                setTimeout(function(){
                    isAnimation = false;
                }, 1000);
            });
        });

        $('#mobile-nav a').click(function(){
            $(window).scrollTop(0);
            $('body').removeClass('show-sidebar');
            $.cookie(Erwann.Variables.CookieName, 'hide-sidebar', { 'path': '/' });
        });

        function ShowMenu()
        {
            navMenus.each(function(){
                var buttons = $(this).children('a');

                buttons.css('display', 'inline-block');
                buttons.eq(0).animate({ 'opacity': 1 }, fadeDuration, function(){
                    buttons.eq(1).animate({ 'opacity': 1 }, fadeDuration, function(){
                        buttons.eq(2).animate({ 'opacity': 1 }, fadeDuration, function(){
                            buttons.eq(3).animate({ 'opacity': 1 }, fadeDuration, function(){
                                buttons.eq(4).animate({ 'opacity': 1 }, fadeDuration, function(){
                                });
                            });
                        });
                    });
                });
            });
        }
        function HideMenu()
        {
            navMenus.each(function(){
                var buttons = $(this).children('a');

                buttons.eq(4).animate({ 'opacity': 0 }, fadeDuration, function(){
                    buttons.eq(3).animate({ 'opacity': 0 }, fadeDuration, function(){
                        buttons.eq(2).animate({ 'opacity': 0 }, fadeDuration, function(){
                            buttons.eq(1).animate({ 'opacity': 0 }, fadeDuration, function(){
                                buttons.eq(1).animate({ 'opacity': 0 }, fadeDuration, function(){
                                    buttons.css('display', 'none').removeClass('show');
                                });
                            });
                        });
                    });
                });
            });
        }
    },

    'InitContactForm': function() {
        $('#visitor').each(function(){
            var form = $(this);
            var result = form.find('#result');
            var nameField = form.find('#your-name');
            var emailField = form.find('#your-email');
            var messageField = form.find('#message');

            form.submit(function(e){
                e.preventDefault();

                if ($.trim(nameField.val()) == '')
                {
                    result.text('Please insert your name');
                }
                else if (!Erwann.Helpers.IsValidEmail(emailField.val()))
                {
                    result.text('Please insert a valid email address');
                }
                else if ($.trim(messageField.val()) == '')
                {
                    result.text('Please insert your message');
                }
                else
                {
                    $.ajax({
                        'url': 'contact.php',
                        'type': 'POST',
                        'data': { 'name': nameField.val(), 'email': emailField.val(), 'message': messageField.val() }
                    });

                    result.text('*Message Sent');
                    nameField.val('');
                    emailField.val('');
                    messageField.val('');
                }
            });
        });
    }
};

Erwann.Helpers = {
    'SetPageElementByHash': function(animate){
        var hash = window.location.hash;

        var screen = $(hash.replace('#', '#screen-'));
        if (window.location.href.indexOf('case.php') == -1)
        {
            if ( screen.length > 0 )
            {
                var screenIndex = screen.index();
                if ( typeof animate != 'undefined' && animate === true )
                {
                    Erwann.Objects.Flip.animate( {'left': -1 * $(window).width() * screenIndex }, 500, function(){
                        Erwann.Objects.Flip.attr('data-attr-page', screenIndex);
                    } );
                }
                else
                {
                    Erwann.Objects.Flip.css( {'left': -1 * $(window).width() * screenIndex });
                    Erwann.Objects.Flip.attr('data-attr-page', screenIndex);
                }

                screen.addClass('mob-active').siblings('.f-page').removeClass('mob-active');
            }
            else
            {
                window.location.hash = Erwann.Variables.ScreenHashes[0];
            }
        }
    },
    'GetScreenIndexByHash': function( hash ) {
        hash = (typeof hash == 'undefined' ? window.location.hash : hash).replace('#', '');

        for (var i in Erwann.Variables.ScreenHashes)
        {
            if ( Erwann.Variables.ScreenHashes[i] == hash )
            {
                return i;
            }
        }

        return 0;
    },
    'IsMobileDevice': function() {
        var check = false;

        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);

        return check;
    },
    'IsMobileScreen': function() {
        return $(window).width() < 768;
    },
    'GetScrollBarWidth': function() {
        var inner = document.createElement('p');
        inner.style.width = "100%";
        inner.style.height = "200px";

        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "200px";
        outer.style.height = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild (inner);

        document.body.appendChild (outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if (w1 == w2) w2 = outer.clientWidth;

        document.body.removeChild (outer);

        return (w1 - w2);
    },
    'IsValidEmail': function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
};