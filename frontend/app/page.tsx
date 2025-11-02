export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            KontaFlow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Sistema Profesional de Contabilidad
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Partida Doble</h2>
              <p className="text-gray-600">
                Sistema contable completo basado en partida doble
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Multi-empresa</h2>
              <p className="text-gray-600">
                Gestiona múltiples empresas desde un solo lugar
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Multi-moneda</h2>
              <p className="text-gray-600">
                Soporte nativo para múltiples monedas
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
