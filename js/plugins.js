/******************************************
  Filter key strokes on inputs - v0.1
  https://bitbucket.org/sacah/filterkeystrokes/src
******************************************/

(function($) {
  $.fn.filterKeys=function() {
    $('.filterkeys', this).unbind('keypress.filterkeys').bind('keypress.filterkeys', function(e) {
      var k=e.which;
      if(!k || k==8) return true;
      var pattern=$(this).attr('data-filterkeys');
      if(pattern) {
        try {
          var filterRegexp=new RegExp(pattern);
        } catch(err) {
          return true;
        }
        var key=String.fromCharCode(k);
        if(!filterRegexp.test(key)) return false;
      }
    });
    return this;
  };
}(jQuery));