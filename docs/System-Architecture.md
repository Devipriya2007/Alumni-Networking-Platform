User Devices
  |-- Mobile App
  |-- Students
  |-- Alumni
  |-- Admin
        |
     Frontend (React)
        |
     API Gateway
        |
     Backend service
        |
     MySQL Database 
        |
     Cloud Deployment
       |-- Frontend Hosting
       |-- Backend Hosting
       |-- Database Hosting
        |
  +-----+-----+-----+-----+-----+-----+
  |     |     |     |     |     |     |
 Auth  User  Connection  Profile  Event  Messaging
Service Service  Service   Service   Service
  |     |     |     |     |     |
  |     |     |     |     |     |
  V     V     V     V     V     V
Users DB  Alumni DB  Connection DB  Events DB  messages DB  
         |            |           |
         +----> Search Index <----+
                 |
            Notification Store
```User Devices
  |-- Mobile App
  |-- Students
  |-- Alumni
  |-- Admin
        |
     Frontend (React)
        |
     API Gateway
        |
     Backend service
        |
     MySQL Database 
        |
     Cloud Deployment
       |-- Frontend Hosting
       |-- Backend Hosting
       |-- Database Hosting
        |
  +-----+-----+-----+-----+-----+-----+
  |     |     |     |     |     |     |
 Auth  User  Connection  Profile  Event  Messaging
Service Service  Service   Service   Service
  |     |     |     |     |     |
  |     |     |     |     |     |
  V     V     V     V     V     V
User DB  Relation DB  Content DB  Events DB  Chat DB
         |            |           |
         +----> Search Index <----+
                 |
            Notification Store