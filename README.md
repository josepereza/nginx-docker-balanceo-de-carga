# nginx-docker-balanceo-de-carga
* Nota: La sección de networks en el archivo de Docker Compose es importante para definir cómo se comunicarán los contenedores entre sí y con el mundo exterior. Sin embargo, en versiones más recientes de Docker, el manejo de redes ha evolucionado y se ha vuelto más flexible, lo que ha llevado a cambios en la forma en que se definen las redes en Docker Compose. A partir de Docker Compose v3, la definición de redes en el archivo Compose se ha vuelto opcional para servicios dentro de la misma red predeterminada.
## Levantar contenedores
Abre una terminal en la ubicación de tu proyecto y ejecuta el siguiente comando para iniciar los contenedores:
```
docker-compose up --build

```
### Simular peticiones con Apache Benchmark (ab)

El siguiente comando realiza 2000 solicitudes con 5 conexiones concurrentes al proxy Nginx:
```
ab -n 2000 -c 5 http://localhost:3500/

```
# Otro ejemplo de balanceo de carga y enrutamiento
* https://www.youtube.com/watch?v=o7DSHPji1m0

Para arrancar los tres contenedores Docker que simulaban un servicio web cada uno hemos creado primero los tres ficheros ‘index.x.html' donde la ‘x' era el número de servidor(Hemos arrancado tres). Seguidamente hemos arrancado cada uno de los contenedores:

```
# Creación del fichero HTML x
echo '<h1>Hello server x</h1>' > index.x.html
# Arranque del servicio x
sudo docker run -v /home/albert/index.x.html:/usr/share/nginx/html/index.html nginx
```

## Balanceo de carga

Para el balanceo de carga hemos creado primero un fichero ‘default.conf'(Donde 172.18.0.x son las IPs de los servicios que acabamos de crear):
```
upstream myapp1 {
	#least_conn;
	#ip_hash;

	server 172.18.0.2;
	server 172.18.0.3;
	server 172.18.0.4;
	}

server {
	listen 80;
	
	location / {
		proxy_pass http://myapp1;
		}

	}
```

Para arrancar el contenedor con un NGINX con esta configuración:

```
sudo docker run -v /home/albert/default.conf:/etc/nginx/conf.d/default.conf nginx

```

 ## Enrutamiento
Para ejemplarizar un enrutamiento hemos ampliado el ejemplo hasta quedar así:

```
upstream myapp1 {
	#least_conn;
	#ip_hash;

	server 172.18.0.2;
	server 172.18.0.3;
	server 172.18.0.4;
	}

server {
	listen 80;
	
	location / {
		proxy_pass http://myapp1;
		}

	location /serv2/ {
		rewrite ^/serv2(.*) / break;

		proxy_pass http://172.18.0.3;
		}
	}
```

Para arrancar un contenedor con esta configuración se hace igual que en el punto anterior.

