import { redirect } from 'next/navigation';

/**
 * Redirects the root path "/" to "/home".
 */
export default function RootPage() {
  redirect('/home');
}
