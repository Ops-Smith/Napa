# nodeJS-image-upload

Simple NodeJS Express Program get files as input from user and upload it to the server. 

To install necessary packages and start the server: 
    
```sh
npm ci && npm start
```



## - PLEASE NOTE
- 1. Create the 'napa-network' network first: 
```sh
    docker network create napa-network
```

- 2. The command for **running mongodb**
``` sh
    docker run -d -p 27017:27017 --network napa-network \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=password \
    -e MONGO_INITDB_DATABASE=napa \
    --name mongodb \
    mongo
```
- 3. The command for **running mongo-express**
```sh
    docker run -d -p 8081:8081 --network napa-network \
    -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
    -e ME_CONFIG_MONGODB_ADMINPASSWORD=password \
    -e ME_CONFIG_MONGODB_SERVER=mongodb \
    -e ME_CONFIG_MONGODB_URL:mongodb://admin:password@mongo:27017 \
    --name mongo-expresso \
    mongo-express
```

Remember that you need to also run the built image for the application: 
```sh
    docker run -d -p 3000:3000 --network napa-network \
    --name napa-app \
    napa
```

# To exec into the MongoDB container when started with Docker compose
```sh
docker compose exec -it mongo mongosh -u admin -p password --authenticationDatabase admin
```

# OR

```sh
db.getSiblingDB("admin").auth("admin")
```
### mongosh will ask for the password, type it

**It will return → ********{ ok: 1 }

# List all the databases
```sh
show dbs
```

# Switching to your application's database
```sh
use napa
```

# List all the tables/collections inside that database:
```sh
show collections
```

# View records inside a specific collection:
```sh
db.uploads.find().pretty()
```

I have deliberately left the .env file in the project folder. Use as it is.