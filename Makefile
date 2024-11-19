up:
	@docker compose build
	@docker compose run --rm  web python manage.py migrate
	@docker compose up
down:
	@docker compose down

clean: down up

fclean:down
	@docker system prune -a -f
	docker volume prune -f
	docker network prune -f
	rm -fr ./data/

re: up clean

.PHONY: all re down clean
