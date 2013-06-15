
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
    // var name = console.log($(this).find('img').attr('name'));
    // console.log(name);
 
    var img = $(this).find('img');
    img.toggleClass('selected');

    var selected = img.attr('class');

    if (selected) {
      img.css('border-color', '#333');
    } else {
      img.css('border-color', '#eee');
    }

  });


  $('.offerings a.submit').click(function(){
    var user = $(this).data('user');
    var $offerings = $(this).closest('.offerings').find('.selected');

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
      var error = '<p>お供え物を選択してください。</p>';
      $(this).closest('.offerings').find('.error').html(error);
    }
  });
});

