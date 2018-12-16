# specify the node base image with your desired version node:<version>
FROM node
# replace this with your application's default port
WORKDIR /root
ADD index.js /root/
RUN npm install express
RUN npm install mysql
CMD node index.js 

