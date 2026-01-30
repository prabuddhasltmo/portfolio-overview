.PHONY: build run stop clean dev install server

IMAGE_NAME = portfolio-overview
CONTAINER_NAME = portfolio-overview

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run -d -p 3000:3000 --env-file .env --name $(CONTAINER_NAME) $(IMAGE_NAME)
	@echo "App running at http://localhost:3000"
	@echo "Swagger UI at http://localhost:3000/api-docs"

stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

clean: stop
	docker rmi $(IMAGE_NAME) || true

dev:
	npm run dev

install:
	npm install

server:
	npm run server
