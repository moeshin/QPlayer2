window.q = window.QPlayer;
$(function () {
    $('#QPlayer').addClass('QPlayer-show');
    $('#QPlayer-more').addClass('QPlayer-list-show QPlayer-lyrics-show');
    $('#js').val($('#js-code').text());
});
function execute() {
    eval($('#js').val());
}