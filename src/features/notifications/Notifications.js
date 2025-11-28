import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNotification, createReminder, fetchNotifications, fetchReminders } from '../../services/mockApi';
import Card from '../../components/ui/Card';

export default function Notifications() {
  const { data: alerts = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
  });
  const queryClient = useQueryClient();
  const [alertForm, setAlertForm] = useState({ title: '', message: '' });
  const [reminderForm, setReminderForm] = useState({ title: '', schedule: '' });

  const alertMutation = useMutation({
    mutationFn: (payload) => createNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setAlertForm({ title: '', message: '' });
    },
  });

  const reminderMutation = useMutation({
    mutationFn: (payload) => createReminder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setReminderForm({ title: '', schedule: '' });
    },
  });

  const handleAlertSubmit = (event) => {
    event.preventDefault();
    if (!alertForm.title) return;
    alertMutation.mutate(alertForm);
  };

  const handleReminderSubmit = (event) => {
    event.preventDefault();
    if (!reminderForm.title || !reminderForm.schedule) return;
    reminderMutation.mutate(reminderForm);
  };

  return (
    <div className="view">
      <h2>Notifications & reminders</h2>
      <Card>
        <header className="list-header">
          <h3>Alerts</h3>
          <span>{alerts.filter((alert) => alert.status === 'new').length} new</span>
        </header>
        <form className="inline-form" onSubmit={handleAlertSubmit}>
          <input
            type="text"
            placeholder="Alert title"
            value={alertForm.title}
            onChange={(event) => setAlertForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <textarea
            placeholder="Message"
            value={alertForm.message}
            onChange={(event) => setAlertForm((prev) => ({ ...prev, message: event.target.value }))}
            rows={3}
          />
          <button type="submit" className="btn primary" disabled={alertMutation.isPending}>
            {alertMutation.isPending ? 'Sending…' : 'Send alert'}
          </button>
        </form>
        <ul className="notification-list">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <div>
                <p>{alert.title}</p>
                <small>{alert.message}</small>
              </div>
              <time>{alert.timestamp}</time>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <header className="list-header">
          <h3>Reminder schedule</h3>
        </header>
        <form className="inline-form" onSubmit={handleReminderSubmit}>
          <input
            type="text"
            placeholder="Reminder title"
            value={reminderForm.title}
            onChange={(event) => setReminderForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Schedule e.g. Daily 7 AM"
            value={reminderForm.schedule}
            onChange={(event) => setReminderForm((prev) => ({ ...prev, schedule: event.target.value }))}
            required
          />
          <button type="submit" className="btn primary" disabled={reminderMutation.isPending}>
            {reminderMutation.isPending ? 'Adding…' : 'Add reminder'}
          </button>
        </form>
        <ul className="reminder-list">
          {reminders.map((reminder) => (
            <li key={reminder.id}>
              <p>{reminder.title}</p>
              <span>{reminder.schedule}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

