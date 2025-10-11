import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Unlawful Assembly
      </h1>
      <p class="text-lg text-gray-600 mb-6">
        Document assembly that's perfectly legal
      </p>
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p class="text-blue-700">
          Welcome! This is a Vite + TypeScript + Tailwind CSS starter project.
        </p>
      </div>
      <div class="mt-6">
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
          Get Started
        </button>
      </div>
    </div>
  </div>
`
