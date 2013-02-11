function parseUrl( url ) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

function parseSearch(search, sorted){
  //strip off leading ?
  search = search.replace(/^\?/, "")
  search = search.replace(/\+/, " ")
  var pairs = [];
  var params = search.split('&')
  
  for (var i=0; i<params.length; i++){
    param = params[i]
    if (param != ""){
      var pair = param.split("=")
      while (pair.length < 2){
        pair.push("")
      }
      if (pair.length > 2){
        pair = [pair[0], pair.slice(1).join("")]
      }
      pair = [decodeURIComponent(pair[0]), decodeURIComponent(pair[1])]
      pairs.push(pair)
    }
  }
  if (sorted) {
    pairs = pairs.sort(function(a, b){
      if (a.toString().toLowerCase() < b.toString().toLowerCase()){
        return -1
      }else if (a.toString().toLowerCase() < b.toString().toLowerCase()){
        return 0
      }else{
        return 1
      }
    });
  }
  return pairs
}

function resetSearch(search, sorted){
  $('#searchRight > *').remove()
  $('#searchRight').append('<table id="searchParams"></table>')
  pairs = parseSearch(search, sorted);
  for (var i=0; i<pairs.length; i++){
    $('#searchParams').append('<tr class="param"><td class=name>&nbsp;&nbsp;</td><td class="name"><input class="paramName" type="text" value="'+pairs[i][0]+'"></input></td><td class="input"><input class="paramValue" type="text" value="'+pairs[i][1]+'"></input></td><td><input type="button" class="remove" value="-"></input></td><td><input type="button" class="add" value="+"></input></td></tr>')
  }
  if (pairs.length == 0) {
    $('#searchParams').append('<tr class="param"><td class=name>&nbsp;&nbsp;</td><td class="name"><input class="paramName" type="text" value=""></input></td><td class="input"><input class="paramValue" type="text" value=""></input></td><td><input type="button" class="remove" value="-"></input></td><td><input type="button" class="add" value="+"></input></td></tr>')
  }
  
  $('.add').click(add_param)
  $('.remove').click(remove_param)
  
  $('tr.param .paramName').first().focus()
}

function add_param(){
  $(this).parents('tr').first().after('<tr class="param"><td class=name>&nbsp;&nbsp;</td><td class="name"><input class="paramName" type="text" value=""></input></td><td class="input"><input class="paramValue" type="text" value=""></input></td><td><input type="button" class="remove" value="-"></input></td><td><input type="button" class="add" value="+"></input></td></tr>')
  $('.add').off('click')
  $('.remove').off('click')
  $('.add').click(add_param)
  $('.remove').click(remove_param)
  $(this).parents('tr').first().next().find('.paramName').focus()
  //$('.paramName').last().focus()
}

function remove_param(){
  $(this).parents('tr').first().remove()
  $('.paramName').last().focus()
}

$(document).ready(function(){
  
  chrome.tabs.getSelected(function(tab){
    
    url = parseUrl(tab.url)
    protocol = url.protocol
    hostname = url.hostname
    port = url.port
    pathname=url.pathname
    search = url.search
    hash = url.hash
    
    $('#url').append('<tr class="name" id="protocol"><td>protocol:</td><td class="input"><input type=text value="'+protocol+'"></input></td></tr>')
    $('#url').append('<tr class="name"  id="hostname"><td>hostname:</td><td class="input"><input type=text value="'+hostname+'"></input></td></tr>')
    $('#url').append('<tr class="name"  id="port"><td>port:</td><td class="input"><input type=text value="'+port+'"></input></td></tr>')
    $('#url').append('<tr class="name"  id="pathname"><td>pathname:</td><td class="input"><input type=text value="'+pathname+'"></input></td></tr>')
    
    chrome.storage.local.get('sorted', function(settings){
      sorted = settings['sorted']
      if (sorted == undefined){
        sorted = true
        chrome.storage.local.set({'sorted': true})
      }
      if (sorted) {
        sorted_check = "checked"
        url_check = ""
      } else {
        sorted_check = ""
        url_check = "checked"
      }
      
      $('#url').append('<tr class="name"  id="search"><td>search:<br/>\
                       <input type="radio" class="paramSort" '+sorted_check+' name="sort" value="sorted">Sorted</input><br/>\
                       <input type="radio" class="paramSort" '+url_check+' name="sort" value="url">URL</input>\
                       </td><td class="input" id="searchRight"></td></tr>')
      resetSearch(search, sorted)
      
      $('input.paramSort').click(function(){
        if ($(this).attr('value') == 'sorted'){
          localStorage.sorted = true
          chrome.storage.local.set({'sorted': true})
          resetSearch(search, true)
        }else{
          localStorage.sorted = false
          chrome.storage.local.set({'sorted': false})
          resetSearch(search, false)
        }
      })
      
      $('#url').append('<tr class="name"  id="hash"><td>hash:</td><td class="input"><input type=text value="'+hash+'"></input></td></tr>')
    });
    
    $('input#go').on('click submit', function(){
      url.protocol = $('#protocol input').val().trim()
      
      url.hostname = $('#hostname input').val().trim()
      
      if ($('#port input').val().trim() != ''){
        url.port = $('#port input').val().trim()
      }
      
      if ($('#pathname input').val().trim() != ''){
        url.pathname = $('#pathname input').val().trim()
      }
      
      if ($('#hash input ').val().trim() != ''){
        url.hash = $('#hash input ').val().trim()
      }
      
      var params = [];
      $('tr.param').each(function(){
        param = [encodeURIComponent($('.paramName', this).val().trim()) + '=' + encodeURIComponent($('.paramValue', this).val().trim())]
        if (param[0] == ''){
          param = [param[1]]
        }else if (param[1] == ''){
            param = [param[0]]
        }
        param = param.join('=')
        if ( (param.trim() != '=') && (param.trim() != '') ){
          params.push(param)
        }
      })
      if (params.join('&').replace('&', '').trim() != ''){
        url.search   = '?' + params.join('&')
      }
      
      
      chrome.tabs.update(tab.id, {"url":url.href})
    })
    
    
    
    
  })
  
  
});
