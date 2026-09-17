docker rmi -f $(docker images -q)
docker tag taskmanagerserver:latest taskmanagerserver:previous
docker tag taskmanagerdmin:latest taskmanagerdmin:previous
docker tag taskmanageruser:latest taskmanageruser:previous
docker tag taskmanagerclient:latest taskmanagerclient:previous
docker-compose up -d --build
