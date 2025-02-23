import React from "react";
import {
    BarChart2,
    Users,
    Home,
    DollarSign,
    MapPin,
    User,
    Calendar,
    Check,
} from "lucide-react";

export default function AgentDashboard() {
    // Mock data - would be fetched from API in real application
    const salesData = {
        todaySales: 4,
        onlineAgents: 7,
        totalAgents: 12,
        availableLands: [
            {
                id: 1,
                name: "Green Valley Estate",
                location: "Westview, CA",
                sqm: 1200,
                pricePerSqm: 450,
                status: "Available",
            },
            {
                id: 2,
                name: "Sunset Heights",
                location: "Eastridge, CA",
                sqm: 850,
                pricePerSqm: 650,
                status: "Available",
            },
            {
                id: 3,
                name: "Pine Ridge View",
                location: "Northside, CA",
                sqm: 1500,
                pricePerSqm: 520,
                status: "Available",
            },
            {
                id: 4,
                name: "Meadow Gardens",
                location: "Southpoint, CA",
                sqm: 980,
                pricePerSqm: 480,
                status: "Reserved",
            },
        ],
        // Recent transactions data
        recentTransactions: [
            {
                id: 1,
                date: "February 20, 2025",
                property: "Oakwood Heights",
                buyer: "Michael Johnson",
                agent: "Sarah Williams",
                amount: 560000,
                status: "Completed",
            },
            {
                id: 2,
                date: "February 18, 2025",
                property: "Riverside Gardens",
                buyer: "Amanda Chen",
                agent: "Robert Garcia",
                amount: 425000,
                status: "Completed",
            },
            {
                id: 3,
                date: "February 15, 2025",
                property: "Mountain View Estate",
                buyer: "David Thompson",
                agent: "Emily Parker",
                amount: 780000,
                status: "Completed",
            },
            {
                id: 4,
                date: "February 10, 2025",
                property: "Lakeside Residences",
                buyer: "Jessica Lee",
                agent: "James Wilson",
                amount: 620000,
                status: "Completed",
            },
        ],
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Sales This Month */}
                <div className="bg-white rounded-lg shadow-md p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Sales This Month
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                {salesData.todaySales}
                            </h2>
                            <p className="mt-1 text-sm text-green-600">
                                +2 from yesterday
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Online Agents */}
                <div className="bg-white rounded-lg shadow-md p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Online Agents
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                {salesData.onlineAgents}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                of {salesData.totalAgents} total
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Total Agents */}
                <div className="bg-white rounded-lg shadow-md p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Total Agents
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                {salesData.totalAgents}
                            </h2>
                            <p className="mt-1 text-sm text-blue-600">
                                +1 this month
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-800">
                        Recent Transactions
                    </h2>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        View All Transactions
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Property
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Buyer
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Agent
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Amount
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salesData.recentTransactions.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-500">
                                                {transaction.date}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
                                                <Home className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.property}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.buyer}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Buyer
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {transaction.agent}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Sales Agent
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">
                                            $
                                            {transaction.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                                            <Check className="h-3 w-3 mr-1" />
                                            {transaction.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Available Lands Table */}
            <div className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-800">
                        Available Land Properties
                    </h2>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        View All Properties
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Property Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Location
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Area (sqm)
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Price per sqm
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Total Value
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salesData.availableLands.map((land) => (
                                <tr key={land.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-md flex items-center justify-center">
                                                <Home className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {land.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                            {land.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {land.sqm.toLocaleString()} sqm
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${land.pricePerSqm}/sqm
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        $
                                        {(
                                            land.sqm * land.pricePerSqm
                                        ).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${
                                                land.status === "Available"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {land.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-lg shadow-md p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Property Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2">
                            Total Available Land
                        </h3>
                        <p className="text-2xl font-bold text-gray-800">
                            {salesData.availableLands
                                .filter((land) => land.status === "Available")
                                .reduce((total, land) => total + land.sqm, 0)
                                .toLocaleString()}{" "}
                            sqm
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Across{" "}
                            {
                                salesData.availableLands.filter(
                                    (land) => land.status === "Available"
                                ).length
                            }{" "}
                            properties
                        </p>
                    </div>
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2">
                            Average Price per sqm
                        </h3>
                        <p className="text-2xl font-bold text-gray-800">
                            $
                            {Math.round(
                                salesData.availableLands
                                    .filter(
                                        (land) => land.status === "Available"
                                    )
                                    .reduce(
                                        (total, land) =>
                                            total + land.pricePerSqm,
                                        0
                                    ) /
                                    salesData.availableLands.filter(
                                        (land) => land.status === "Available"
                                    ).length
                            )}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Market average is $520/sqm
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
