import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir directamente a la página de grupos
  redirect('/grupos');
}
