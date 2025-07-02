FROM node:22.17.0 as build-stage

WORKDIR /app
COPY ./ /app/

RUN npm install @ionic/cli -g --registry https://registry.npmmirror.com
RUN npm install --registry https://registry.npmmirror.com --canvas_binary_host_mirror=https://registry.npmmirror.com/mirrors/node-canvas-prebuilt

RUN ionic build --prod

RUN gzip /app/www/browser/*js && gzip /app/www/browser/*css #  && gzip /app/www/*html

FROM nginx:1.29-alpine

# RUN rm -rf  /usr/share/nginx/html/*

COPY --from=build-stage /app/www/browser /usr/share/nginx/html

#Copy default nginx configuration
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

RUN sed -i 's/worker_processes .*;/worker_processes 1;/' /etc/nginx/nginx.conf
