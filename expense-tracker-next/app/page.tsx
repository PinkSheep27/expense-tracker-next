import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Expense Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Take control of your finances. Track expenses, analyze spending, and make informed decisions.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-900 text-lg font-semibold mb-2">Track Spending</h3>
            <p className="text-gray-600">Monitor all expenses in one place</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-900 text-lg font-semibold mb-2">See Totals</h3>
            <p className="text-gray-600">View total spending at a glance</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-900 text-lg font-semibold mb-2">Categorize</h3>
            <p className="text-gray-600">Organize by category</p>
          </div>
        </div>

        <Link 
          href="/expenses"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg transition"
        >
          View Your Expenses →
        </Link>
      </div>
    </div>
  )
}

