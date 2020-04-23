module.exports = {

escapeHtml: function (str) {
  if ((str === null) || (str === ''))
    // return "L'articolo non contiene testo, probabilmente è un video. Va visualizzato sul sito originale";
    return ""
  else
    str = str.toString();
    str = str.replace(/&nbsp;/g, ' ')
  	return str.replace(/<[^>]*>/g, '');
},

sortFunction: function(a,b){  
    var dateA = new Date(a.date).getTime();
    var dateB = new Date(b.date).getTime();
    return dateA > dateB ? 1 : -1;  
  },

between: function(min,max){
  return Math.floor(
    Math.random() * (max - min) + min
  )
},

getImg: function(str){
  var imgExists = str.indexOf('<img src="');

if (imgExists > -1) {
    var i = imgExists + 10;
    
    str = str.substr(i);
    str = str.substr(0, str.indexOf('"'));
    if(str != ""){
      return str;
    } else {
      return null;
    }
}
}



};