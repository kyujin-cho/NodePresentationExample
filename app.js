'use strict';
const messages = require('./controllers/messages');
const compress = require('koa-compress');
const logger = require('koa-logger');
const serve = require('koa-static');
const router = require('koa-router')();
const views = require('koa-views');
const bodyParser = require('koa-body')();
const koa = require('koa');
const path = require('path');
const app = module.exports = new koa();

import config from './config'
// Logger
app.use(logger());

// app.use(route.get('/messages', messages.list));
// app.use(route.get('/messages/:id', messages.fetch));
// app.use(route.post('/messages', messages.create));
// app.use(route.get('/async', messages.delay));
// app.use(route.get('/promise', messages.promise));

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

app.use(views(__dirname + '/views', {'extension':'pug'}))

app
  .use(router.routes())
  .use(router.allowedMethods())

const server = require('http').Server(app.callback()),
      io = require('socket.io')(server)

let comments = []

io.on('connection', socket => {
  // socket.emit('welcome', {hello: 'world!'})
  socket.on('message', data => {
    comments.push(data)
    socket.broadcast.emit('newMessage', data)
    console.log('got message:' + data.message)
  })
  socket.on('fetchMessages', () => {
    socket.emit('messages', comments)
  })
})

server.listen(config.ioPort)

router.get('/', async ctx => {
  await ctx.render('chat.pug')
})
router.get('/remove', async ctx => {
  await ctx.render('remove.pug')
})
router.post('/remove', bodyParser, async ctx => {
  console.log(ctx.request.body);
  if(ctx.request.body.password === 'oss-spring-2017')
    comments = []
  ctx.redirect('/')
})

if (!module.parent) {
  app.listen(config.httpPort);
  console.log('listening on port ' + config.httpPort);
}

console.info('Now listening io on port ' + config.ioPort)