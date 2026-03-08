FROM php:8.4-fpm-alpine

# Install only the system packages required for this local API setup.
RUN apk add --no-cache \
    curl \
    git \
    oniguruma-dev \
    sqlite \
    sqlite-dev \
    unzip \
    zip

RUN docker-php-ext-install pdo pdo_sqlite mbstring bcmath pcntl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

COPY . .

RUN php artisan package:discover --ansi

RUN mkdir -p bootstrap/cache \
    storage/app \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    database \
    && touch database/database.sqlite \
    && chown -R www-data:www-data storage bootstrap/cache database \
    && chmod -R 775 storage bootstrap/cache \
    && chmod 664 database/database.sqlite

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]