<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['message' => 'Travel Insurance API', 'version' => '1.0.0'];
});
