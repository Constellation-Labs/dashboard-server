# dashboard-server

## deploy

### push docker image to gce

```
cd kubernetes

docker build -t gcr.io/esoteric-helix-197319/dashboard-server:v1 .

gcloud docker -- push gcr.io/esoteric-helix-197319/dashboard-server

```
### redeploy dashboard-server (app engine)
gcloud app deploy

### redeploy cache-warmer

TODO: We should probably the warmer to app-engine as well, just for simplicity.
```

cd kubernetes

kubectl delete deployments cache-warmer

kubectl apply -f cache-warmer.yaml

```


## dashboard url

http://testnet.constellationlabs.io

http://dashboard.dag.works


## turn off and on cache warmer

```

curl -X POST http://{cachewarmerip}/stop

curl -X POST http://{cachewarmerip}/start

```

## reset db

```

curl -X POST http://{cachewarmerip}/flushdb

```
