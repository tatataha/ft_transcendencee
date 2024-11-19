FROM nginx:alpine

# Certbot ve Certbot Nginx eklentisini yükle
RUN apk add --no-cache certbot certbot-nginx

# HTML dosyalarını kopyala
COPY ./front/. /usr/share/nginx/html/

# Nginx konfigürasyon dosyasını kopyala
COPY ./conf/default.conf /etc/nginx/nginx.conf
COPY ./conf/localhost.key /etc/ssl/private/localhost.key
COPY ./conf/localhost.crt /etc/ssl/certs/localhost.crt

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
