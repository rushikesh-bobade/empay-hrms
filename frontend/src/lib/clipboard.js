import { toast } from 'sonner';

export async function copyEmail(email) {
  if (!email) return;
  try {
    await navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard');
  } catch {
    toast.error('Failed to copy email');
  }
}
