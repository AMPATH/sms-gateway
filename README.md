# sms-gateway
SMS facade that sit between different applications requiring to send SMS and the SMS provider. The aim is to provide a uniform interface to send SMSes and be flexible enough to use any provider chosen.


## Developement Setup

#### Requirement 

* Node.js ( v0.10.xx)
* Mongodb ( make sure mongodb service is runnning)
* grunt ```npm install -g grunt-cli```

#### Steps

* clone the repo and go to sms-gateway directory
* Run ```npm install``` for installing dependencies 
* To run tests ```grunt test``` : This create a test databse in mongodb. So mongodb should be running
* To run the server in development mode ```grunt```
* you can access the api as ```http://localhost:3000``` (e.g : ```curl -u 'admin:@dm1n' http://localhost:3000/admin/application``` )
* For admin apis default username:password is ```admin:@dm1n```  ( using basic auth )
