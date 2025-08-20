import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-green-600 dark:text-green-400">
        ¡Pago Exitoso!
      </h1>
      <p className="text-lg md:text-xl text-center text-gray-700 dark:text-gray-300 mb-8">
        Gracias por tu suscripción. Tu apoyo es muy valioso.
      </p>
      <Link href="/">
        <button className="bg-blue-500 text-white text-xl font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
          Volver al Inicio
        </button>
      </Link>
    </main>
  );
}
