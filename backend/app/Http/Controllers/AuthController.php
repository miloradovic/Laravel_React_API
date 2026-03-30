<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Login user and return JWT token
     *
     * @return JsonResponse
     */
    public function login(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        // Get credentials
        $credentials = $request->only('email', 'password');

        // Attempt to create token
        try {
            if (! $token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'error' => 'Invalid credentials',
                ], 401);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not create token',
            ], 500);
        }

        // Return successful response with token
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }

    /**
     * Create a test user for the system
     * This method is for development/testing purposes
     */
    public function createTestUser(): JsonResponse
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]
        );

        return response()->json([
            'message' => 'Test user created/found',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
