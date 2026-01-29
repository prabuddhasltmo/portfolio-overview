.PHONY: build run stop clean dev install

IMAGE_NAME = portfolio-overview
CONTAINER_NAME = portfolio-overview

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run -d -p 8080:80 --name $(CONTAINER_NAME) $(IMAGE_NAME)
	@echo "Running at http://localhost:8080"

stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

clean: stop
	docker rmi $(IMAGE_NAME) || true

dev:
	npm run dev

install:
	npm install
