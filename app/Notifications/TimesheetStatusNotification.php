<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class TimesheetStatusNotification extends Notification
{
    use Queueable;

    protected $timesheet;
    protected $status;
    protected $reason;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($timesheet, $status, $reason = null)
    {
        $this->timesheet = $timesheet;
        $this->status = $status;
        $this->reason = $reason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $message = (new MailMessage)
            ->subject("Your timesheet has been {$this->status}")
            ->line("Your timesheet #{$this->timesheet->id} has been {$this->status}.");

        if ($this->status === 'rejected' && $this->reason) {
            $message->line("Reason: {$this->reason}");
        }

        $message->action('View Timesheet', url('/timesheet-detail/' . $this->timesheet->id))
                ->line('Thank you for using our application!');

        return $message;
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
            'timesheet_id' => $this->timesheet->id,
            'status' => $this->status,
            'reason' => $this->reason,
            'message' => "Your timesheet has been {$this->status}"
        ];
    }
}