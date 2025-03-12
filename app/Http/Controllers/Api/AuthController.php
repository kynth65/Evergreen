<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{

    public function signup(SignupRequest $request)
    {
        $data = $request->validated();
        /** @var \App\Models\User $user */
        $user = User::create([
            'name' => $data['username'],
            'email' => $data['email'],
            'password' => bcrypt($data['password'])
        ]);

        $token = $user->createToken('main')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();
        if (!Auth::attempt($data)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $token = $user->createToken('main')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        try {
            // Get the authenticated user safely
            $user = $request->user();
            
            // Only try to revoke token if user exists and has a token
            if ($user) {
                try {
                    // Try to revoke the current token if possible
                    if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                        $user->currentAccessToken()->delete();
                    } else {
                        // Fallback: revoke all tokens for this user
                        if (method_exists($user, 'tokens')) {
                            $user->tokens()->delete();
                        }
                    }
                } catch (\Exception $e) {
                    // Log token revocation error but continue with logout
                    \Log::error('Error revoking token: ' . $e->getMessage());
                }
            }
            
            // Always clear session regardless of token operations
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return response()->json(['message' => 'Successfully logged out'], 200);
        } catch (\Exception $e) {
            // Log error but return success to client for better UX
            \Log::error('Logout error: ' . $e->getMessage());
            return response()->json(['message' => 'Logged out successfully'], 200);
        }
    }
    
    /**
     * Get the authenticated user's profile
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        return response()->json($user);
    }
    
    /**
     * Update the authenticated user's profile
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:255',
            'bio' => 'sometimes|nullable|string',
            'experience' => 'sometimes|nullable|string|max:100',
        ]);
        
        $user->update($validated);
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}