# dashboard-server

## deploy


```
### redeploy dashboard-server (app engine)
gcloud app deploy

### redeploy cache-warmer

from cache-warmer directory, gcloud app deploy
```


## dashboard url

http://testnet.constellationlabs.io

http://dash.dag.works/api


## turn off and on cache warmer

```

curl -X POST http://{cachewarmerip}/stop

curl -X POST http://{cachewarmerip}/start

```

## reset db

```

curl -X POST http://{cachewarmerip}/flushdb

```
