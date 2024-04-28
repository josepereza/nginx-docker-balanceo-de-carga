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



# Using nginx as HTTP load balancer

## Introduction
Load balancing across multiple application instances is a commonly used technique for optimizing resource utilization, maximizing throughput, reducing latency, and ensuring fault-tolerant configurations.

It is possible to use nginx as a very efficient HTTP load balancer to distribute traffic to several application servers and to improve performance, scalability and reliability of web applications with nginx.

## Load balancing methods
The following load balancing mechanisms (or methods) are supported in nginx:

* round-robin — requests to the application servers are distributed in a round-robin fashion,
* least-connected — next request is assigned to the server with the least number of active connections,
* ip-hash — a hash-function is used to determine what server should be selected for the next request (based on the client’s IP address).

## Default load balancing configuration
The simplest configuration for load balancing with nginx may look like the following:
```
http {
    upstream myapp1 {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://myapp1;
        }
    }
}
```

In the example above, there are 3 instances of the same application running on srv1-srv3. When the load balancing method is not specifically configured, it defaults to round-robin. All requests are proxied to the server group myapp1, and nginx applies HTTP load balancing to distribute the requests.

Reverse proxy implementation in nginx includes load balancing for HTTP, HTTPS, FastCGI, uwsgi, SCGI, memcached, and gRPC.

To configure load balancing for HTTPS instead of HTTP, just use “https” as the protocol.

When setting up load balancing for FastCGI, uwsgi, SCGI, memcached, or gRPC, use fastcgi_pass, uwsgi_pass, scgi_pass, memcached_pass, and grpc_pass directives respectively.

## Least connected load balancing
Another load balancing discipline is least-connected. Least-connected allows controlling the load on application instances more fairly in a situation when some of the requests take longer to complete.

With the least-connected load balancing, nginx will try not to overload a busy application server with excessive requests, distributing the new requests to a less busy server instead.

Least-connected load balancing in nginx is activated when the least_conn directive is used as part of the server group configuration:
```
upstream myapp1 {
        least_conn;
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }
```

    
## Session persistence
Please note that with round-robin or least-connected load balancing, each subsequent client’s request can be potentially distributed to a different server. There is no guarantee that the same client will be always directed to the same server.

If there is the need to tie a client to a particular application server — in other words, make the client’s session “sticky” or “persistent” in terms of always trying to select a particular server — the ip-hash load balancing mechanism can be used.

With ip-hash, the client’s IP address is used as a hashing key to determine what server in a server group should be selected for the client’s requests. This method ensures that the requests from the same client will always be directed to the same server except when this server is unavailable.

To configure ip-hash load balancing, just add the ip_hash directive to the server (upstream) group configuration:
```
upstream myapp1 {
    ip_hash;
    server srv1.example.com;
    server srv2.example.com;
    server srv3.example.com;
}
```

## Weighted load balancing
It is also possible to influence nginx load balancing algorithms even further by using server weights.

In the examples above, the server weights are not configured which means that all specified servers are treated as equally qualified for a particular load balancing method.

With the round-robin in particular it also means a more or less equal distribution of requests across the servers — provided there are enough requests, and when the requests are processed in a uniform manner and completed fast enough.

When the weight parameter is specified for a server, the weight is accounted as part of the load balancing decision.
``` 
upstream myapp1 {
        server srv1.example.com weight=3;
        server srv2.example.com;
        server srv3.example.com;
    }
```
    
With this configuration, every 5 new requests will be distributed across the application instances as the following: 3 requests will be directed to srv1, one request will go to srv2, and another one — to srv3.

It is similarly possible to use weights with the least-connected and ip-hash load balancing in the recent versions of nginx.

## Health checks
Reverse proxy implementation in nginx includes in-band (or passive) server health checks. If the response from a particular server fails with an error, nginx will mark this server as failed, and will try to avoid selecting this server for subsequent inbound requests for a while.

The max_fails directive sets the number of consecutive unsuccessful attempts to communicate with the server that should happen during fail_timeout. By default, max_fails is set to 1. When it is set to 0, health checks are disabled for this server. The fail_timeout parameter also defines how long the server will be marked as failed. After fail_timeout interval following the server failure, nginx will start to gracefully probe the server with the live client’s requests. If the probes have been successful, the server is marked as a live one.

## Further reading
In addition, there are more directives and parameters that control server load balancing in nginx, e.g. proxy_next_upstream, backup, down, and keepalive. For more information please check our reference documentation.

Last but not least, application load balancing, application health checks, activity monitoring and on-the-fly reconfiguration of server groups are available as part of our paid NGINX Plus subscriptions.

The following articles describe load balancing with NGINX Plus in more detail:

* Load Balancing with NGINX and NGINX Plus

https://www.nginx.com/blog/load-balancing-with-nginx-plus/
* Load Balancing with NGINX and NGINX Plus part 2
https://www.nginx.com/blog/load-balancing-with-nginx-plus-part-2/





