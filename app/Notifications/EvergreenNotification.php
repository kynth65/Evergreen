<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EvergreenNotification extends Notification
{
    use Queueable;

    protected $message;
    protected $type;
    protected $additionalData;

    /**
     * Create a new notification instance.
     *
     * @param string $message The notification message
     * @param string $type The notification type (info, success, warning, error)
     * @param array $additionalData Additional data for the notification
     * @return void
     */
    public function __construct($message, $type = 'info', $additionalData = [])
    {
        $this->message = $message;
        $this->type = $type;
        $this->additionalData = $additionalData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Evergreen Notification')
                    ->greeting('Hello ' . $notifiable->first_name . '!')
                    ->line($this->message)
                    ->action('View Dashboard', url('/' . $notifiable->role))
                    ->line('Thank you for using Evergreen!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
            'timestamp' => now()->toIso8601String(),
        ] + $this->additionalData;
    }

    /**
     * Get the database representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toDatabase($notifiable)
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
            'timestamp' => now()->toIso8601String(),
        ] + $this->additionalData;
    }
}