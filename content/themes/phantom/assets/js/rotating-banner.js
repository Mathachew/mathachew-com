$(document).ready(function() {
    var loaded = 0;
    var timerId = 0;
    var current = null;

    var stop = function() {
        clearTimeout(timerId);
        timerId = 0;
    };

    var resume = function(func, el) {
        timerId = window.setTimeout(function() { func(el); }, 4000);
    };

    var reset = function(e) {
        loaded = 0;

        if(e)
            e.fadeOut(500);

        original.fadeIn(500, function() { loaded = 1; });
    };

    var original = $('#home_photo');

    reset();

    //
    $('#banner > a').each(function(i) {
        if(i > 0)
        {
            var banner = $(this);

            $(this).mouseover(function() {
                stop();
            }).mouseout(function() {
                resume(reset, banner);
            });
        }
    });

    $('#banner_menu > a').each(function(i) {
        i += 1;
        var banner = $('#banner a:eq(' + i + ')');

        $(this).mouseover(function() {
            if(!loaded)
                return;

            original.hide();

            if(current != null)
                $('#banner > a:eq(' + current +')').hide();

            current = i;

            banner.show();
            stop();
        }).mouseout(function() {
            if(!loaded)
                return;

            resume(reset, banner);
        });
    });
});