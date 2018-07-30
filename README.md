# dashboard-server

## deploy

### push docker image to gce

```
docker build -t gcr.io/esoteric-helix-197319/dashboard-server:v1 .

gcloud docker -- push gcr.io/esoteric-helix-197319/dashboard-server

```


### redeploy services

```

cd kubernetes

kubectl delete deployments dashboard-server

kubectl delete deployments cache-warmer

kubectl apply -f server.yaml

kubectl apply -f cache-warmer.yaml

```


## dashboard url

```

http://130.211.134.226/dashboard

```

## turn off and on cache warmer

```

curl -X POST http://35.224.234.153/stop

curl -X POST http://35.224.234.153/start

```
