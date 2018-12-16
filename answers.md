# Answers

Lastname: Ferreira dos santos
Firstname: Hugo

## 2.2
command: docker run nodejsdocker

## 2.3
question: We need to open the good ports 
command: docker run -p 3500:3000 nodejsdocker

## 2.5
question: We need to login to docker hub via command line first and to tag the image
command: docker tag nodejsdocker spirit91/mydocker
docker push spirit91/mydocker

## 2.6
command: docker images -q | % { docker rmi -f $_ }

question: We can't run it because we haven't the image we need to pull it
command: docker pull spirit91/mydocker

command: docker run -d -p 3500:3000 -e MYSQL_HOST=127.0.0.1 -e MYSQL_PORT=3306 -e MYSQL_DATABASE=zoo -e MYSQL_USER=root -e MYSQL_PASSWORD="" spirit91/mydocker:nodejsdocker

## 2.7
question: We can use the command docker ps to see all the running container
question: The name of the container is "sharp_hopper"
command: docker ps

command: docker rename sharp_hopper zoo

## 2.8
question The OS is "Debian GNU/Linux"
output: PRETTY_NAME="Debian GNU/Linux 9 (stretch)"
NAME="Debian GNU/Linux"
VERSION_ID="9"
VERSION="9 (stretch)"
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"

## 3.1
command: docker-compose up

## 3.4
command: docker-compose up -d
command: docker-compose logs my-service
