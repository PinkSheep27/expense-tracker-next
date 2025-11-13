import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Expense Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Take control of your finances. Track expenses, analyze spending, and make informed decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Track Spending</h3>
            <p className="text-gray-600 text-sm">Monitor all expenses in one place</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">See Totals</h3>
            <p className="text-gray-600 text-sm">View total spending at a glance</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Categorize</h3>
            <p className="text-gray-600 text-sm">Organize by category</p>
          </div>

        </div>

        {/* UPDATED LINK - Points to dashboard instead */}
        <div className="text-center">
          <Link 
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  )
}