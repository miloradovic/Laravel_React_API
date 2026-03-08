<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add JWT middleware alias
        $middleware->alias([
            'jwt.auth' => \Tymon\JWTAuth\Http\Middleware\Authenticate::class,
            'jwt.refresh' => \Tymon\JWTAuth\Http\Middleware\RefreshToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Global exception handling for API
        $exceptions->render(function (Exception $exception, $request) {
            if ($request->expectsJson()) {
                $status = method_exists($exception, 'getStatusCode') 
                    ? $exception->getStatusCode() 
                    : 500;
                
                return response()->json([
                    'error' => $exception->getMessage(),
                    'status' => $status
                ], $status);
            }
        });
    })->create();