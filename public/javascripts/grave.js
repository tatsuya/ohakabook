
var request = function(url, data, callback){
  $.ajax({
    type: 'POST',
    url: url,
    data: data, 
    dataType: 'json',
    success: callback
  });
};

$(function(){
  // $('.offerings-show').click(function(){
  //   $('.collapse').toggle();
  // });

  $('.offering').click(function(){ 
    var img = $(this).find('img');
    img.toggleClass('selected');

    var selected = img.attr('class');

    if (selected) {
      img.css('border-color', '#333');
    } else {
      img.css('border-color', '#eee');
    }
  });


  $('.make-offerings a.submit').click(function(){
    var user = $(this).data('user');
    var $offerings = $(this).closest('.make-offerings').find('.selected');

    if ($offerings.length > 0) {
      var offerings = [];
      $offerings.each(function(){
        var name = $(this).attr('name');
        offerings.push(name);
      });

      request('/grave', {
        user: user,
        offerings: offerings
      }, function(res){
        location.reload();
      });
    } else {
      var error = '<span>お供え物を選択してください。</span>';
      $(this).closest('.grave').find('.error').html(error);
    }
  });
});

