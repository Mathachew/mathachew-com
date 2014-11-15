$(function () {
    $.autotab({ tabOnSelect: true });
    $('.number').autotab('filter', 'number');
    $('.text').autotab('filter', 'text');
    $('.alpha').autotab('filter', 'alpha');
    $('.alphanumeric').autotab('filter', { format: 'alphanumeric', uppercase: true });
    $('#regex').autotab('filter', { format: 'custom', pattern: '[^0-9\.]', maxlength: 15 });
    $('#function').autotab('filter', function (value, element) {
        var parsedValue = parseInt(value, 10);

        if (!value || parsedValue != value) {
            return '';
        }

        var newValue = element.value + value;

        if (newValue > 12) {
            $.autotab.next();
            return 2;
        }
        else if (element.value.length == 0 && value > 1) {
            $.autotab.next();
            return value;
        }
        else if (element.value.length == 1 && parsedValue === 0 && newValue != 10) {
            $.autotab.next();
            return 1;
        }

        return value;
    });
    $('.hexadecimal').autotab('filter', 'hexadecimal');
    $('.ip').autotab('filter', { format: 'number', trigger: '.' });
    $('.pin').autotab('filter', 'number');

    $('#remove-autotab').on('click', function () {
        $.autotab.remove();
        $('#autotab-status span').removeClass('on').addClass('off').text('Off');
    });

    $('#restore-autotab').on('click', function () {
        $.autotab.restore();
        $('#autotab-status span').removeClass('off').addClass('on').text('On');
    });
});