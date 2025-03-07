<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Notifications\EvergreenNotification;
use App\Models\User;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'notifications' => [],
                'unread_count' => 0
            ]);
        }
        
        $notifications = $user->notifications()->latest()->get();
        $unreadCount = $user->unreadNotifications->count();
        
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }
    
    /**
     * Mark a notification as read
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead($id)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        $notification = $user->notifications()->where('id', $id)->first();
        
        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }
        
        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Mark all notifications as read
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        $user->unreadNotifications->markAsRead();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Send a notification to a user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendNotification(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'message' => 'required|string',
            'type' => 'nullable|string|in:info,success,warning,error',
            'data' => 'nullable|array'
        ]);
        
        $user = User::find($request->user_id);
        $type = $request->type ?? 'info';
        $data = $request->data ?? [];
        
        $user->notify(new EvergreenNotification($request->message, $type, $data));
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Create a test notification for the current user
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function createTestNotification()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        $types = ['info', 'success', 'warning', 'error'];
        $type = $types[array_rand($types)];
        
        $messages = [
            'Your land assessment has been completed',
            'New plot added to your watchlist',
            'Payment received for plot #12345',
            'Your account settings have been updated',
            'New message from Evergreen Support'
        ];
        
        $message = $messages[array_rand($messages)];
        
        $user->notify(new EvergreenNotification($message, $type));
        
        return response()->json([
            'success' => true,
            'message' => 'Test notification created'
        ]);
    }
}