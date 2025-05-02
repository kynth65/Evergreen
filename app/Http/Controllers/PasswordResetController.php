<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;
use Mail;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
        ]);

        // Generate 6-digit code
        $code = mt_rand(100000, 999999);
        
        // Store code in password_resets table
        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $code,
                'created_at' => Carbon::now()
            ]
        );
        
        // Send email
        Mail::send('emails.reset_password', ['code' => $code], function($message) use ($request) {
            $message->to($request->email);
            $message->subject('Password Reset Code');
        });
        
        return response()->json([
            'message' => 'Password reset code has been sent to your email'
        ]);
    }
    
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);
        
        $passwordReset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();
            
        if (!$passwordReset) {
            return response()->json([
                'message' => 'Invalid code'
            ], 422);
        }
        
        // Check if code is expired (1 hour)
        $createdAt = Carbon::parse($passwordReset->created_at);
        if ($createdAt->diffInMinutes(Carbon::now()) > 60) {
            return response()->json([
                'message' => 'Code expired'
            ], 422);
        }
        
        return response()->json([
            'message' => 'Code verified successfully'
        ]);
    }
    
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        // Verify code again
        $passwordReset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();
            
        if (!$passwordReset) {
            return response()->json([
                'message' => 'Invalid code'
            ], 422);
        }
        
        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();
        
        // Delete the password reset record
        DB::table('password_resets')->where('email', $request->email)->delete();
        
        return response()->json([
            'message' => 'Password has been reset successfully'
        ]);
    }
}