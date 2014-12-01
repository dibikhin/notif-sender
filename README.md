notif-sender
============

#### Install dependencies
* npm install body-parser
* npm install express
* npm install config
* npm install mongoose-timestamp
* npm install mongoose
* npm install async
* npm install log4js

#### Init DB 
Fill players collection if needed.
In mongo shell run
```
for (var i = 123123123; i < 123123123 + 1000; i++) { 
  db.players.insert({ vk_id: i, first_name: "Feodor_" + i })
}
```

#### Config MongoDB
Set MongoDB connection string in data-layer.js

#### Start http-service
```
node http_service.js
```
To stop http-service hit Ctrl-C

#### Create tasks
To send notifications run this
```
curl --data "template=Hi%20there!" http://localhost:3000/send
```

#### Start scheduler
For starting task processing service
```
node scheduler.js
```
To stop service hit Ctrl-C
