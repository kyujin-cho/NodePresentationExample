'use strict';
const messages = require('./controllers/messages');
const compress = require('koa-compress');
const logger = require('koa-logger');
const serve = require('koa-static');
const route = require('koa-route');
const views = require('koa-views');
const koa = require('koa');
const path = require('path');
const app = module.exports = new koa();
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

app.use(async ctx => {
  await ctx.render('chat.pug')
})

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

server.listen(1337)

if (!module.parent) {
  app.listen(3000);
  console.log('listening on port 3000');
}

console.info('Now listening io on port 1337')