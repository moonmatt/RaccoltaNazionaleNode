const express = require('express')
const app = express()
const articleRouter = require('./routes/articles')
//const dbRouter = require('./routes/db')
const tools = require('./tools')
const session = require('express-session')
const cookiep   = require("cookie-parser");
const {performance} = require('perf_hooks');
const fs = require('fs');
var cron = require('node-cron')
const Parser = require('rss-parser')
const moment = require('moment')

const parser = new Parser({
    customFields: {
    item: ['description'],
    test: ['enclosure']
  }
})

app.set('view engine', 'ejs')
app.use(cookiep());
app.set('trust proxy', 1);

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'sdlfjljrowuroweu',
  cookie: { secure: false }
}));

// Qui parso i file e li mando

let journals = ['https://rss.app/feeds/ib0YJTMgPlta9ssZ.xml', 'https://www.ilgiornale.it/feed.xml', 'https://www.liberoquotidiano.it/rss.xml', 'https://www.ilprimatonazionale.it/feed/', 'https://www.iltempo.it/rss.jsp?sezione=200', 'https://www.ilfoglio.it/rss.jsp?sezione=121']

async function getRss(){
    let postArr = [];
      for(let url of journals){
        let feed = await parser.parseURL(url);
        // let i = 0;
        for(let item of feed.items){
        //   if(i >= 50){
        //     break;
        //   }
        //   i++
          try{
            image = item.enclosure.url
          } catch(err){
            image = tools.getImg(item.description)
          }
          let content = await tools.escapeContent(item.content);
          post = {
            title: item.title,
            url: item.link, 
            date: moment(item.pubDate).locale("it").format('LLLL'),
            content: content,
            description: tools.escapeHtml(item.description).substring(0,200),
            journal: feed.title,
            image: image,
            thumbnail: image
          }
          if(post.content.includes(image)){
            post.thumbnail = null
          }
          postArr.push(post)
        }
  };
  postArr.sort(tools.sortFunction).reverse()

fs.writeFile('public/data.json', JSON.stringify(postArr), (err) => {
    if (err) throw err;
    console.log('Data written to file');
});

fs.writeFile('public/update.json', JSON.stringify(moment().format('H:mm:ss')), (err) => {
  if (err) throw err;
  console.log('Time updated');
});

};


cron.schedule('*/2 * * * *', () => {
  getRss();
  console.log("Get new posts") 
});

async function rssReader() {
  let rawdata = await fs.readFileSync('public/data.json');
  let posts = await JSON.parse(rawdata);
  return posts

}

async function timeReader() {
  let rawdata = await fs.readFileSync('public/update.json');
  let time = await JSON.parse(rawdata);
  return time
}

app.use('/articles', articleRouter)
//app.use('/db', dbRouter)
app.use('/public', express.static(__dirname + '/public')); 

// INDEX LOAD POSTS

app.get('/', async function (req, res) {
    t0 = performance.now();
    let finalArr = await rssReader()
    let timeUpdate = await timeReader()
    t1 = performance.now();
    console.log("Array:  " + (t1 - t0) + " milliseconds.")
    res.render('index', {postArr: finalArr, timeUpdate: timeUpdate})
}) 

app.get('/random', async function (req, res) {
    let finalArr = await rssReader()
    let randNum = tools.between(0,finalArr.length)
    let post = finalArr[randNum]
    if(post.content != ""){
      res.render('post', {title: post.title, content: post.content, date: post.date, image: post.image, journal: post.journal, url: post.url, thumbnail: post.thumbnail})
    } else {
      res.redirect('/random')
    }
}) 

//app.get('/login', function(req, res) {
//  if(req.session.username){
//    res.redirect('/')
//  } else {
//    res.render('login')
//  }
//})
//app.get('/logout', function(req, res) {
//  if(req.session.username){
//    req.session.destroy();
//    res.redirect('/login')
//  } else {
//    res.redirect('/login')
//  }
//})

app.get('/info', function(req, res) {
    res.render('info')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})