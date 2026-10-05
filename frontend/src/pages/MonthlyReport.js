import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import ReportFooter from '../components/ReportFooter';
import printReportDocument from '../utils/printReport';
import { useAuth } from '../context/AuthContext';

const MonthlyReport = () => {
    const { admin } = useAuth();
    const isViewer = admin?.role === 'viewer';
    const [searchParams, setSearchParams] = useSearchParams();
    const [reportMonth, setReportMonth] = useState('');
    const [reports, setReports] = useState([]);
    const [currentReport, setCurrentReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        const monthParam = searchParams.get('month');
        if (monthParam) {
            setReportMonth(monthParam);
        } else {
            const now = new Date();
            const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setReportMonth(defaultMonth);
            setSearchParams({ month: defaultMonth });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (reportMonth) {
            fetchReport(reportMonth);
        }
    }, [reportMonth]);

    const formatMonthName = (year, monthNum) => {
        const monthName = new Date(year, Number(monthNum) - 1, 1).toLocaleString('default', { month: 'long' });
        return monthName;
    };

    const fetchReport = async (value) => {
        try {
            setLoading(true);
            const [year, monthNum] = value.split('-');
            const month = formatMonthName(year, monthNum);
            const response = isViewer
                ? await API.get('/calculations/preview', { params: { month, year: Number(year) } })
                : await API.post('/calculations/generate', { month, year: Number(year) });
            setCurrentReport(response.data);
            if (!isViewer) {
                await fetchReports();
            }
        } catch (error) {
            console.error('Failed to fetch report for month', error);
            toast.error('Failed to load the selected month report.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            const response = await API.get('/calculations');
            setReports(response.data);
        } catch (error) {
            toast.error('Failed to fetch reports');
        }
    };

    const generateReport = async () => {
        if (!reportMonth) {
            toast.error('Please select a month first.');
            return;
        }

        await fetchReport(reportMonth);
        setSearchParams({ month: reportMonth });
    };

    const handleMonthChange = (event) => {
        const value = event.target.value;
        setReportMonth(value);
        setSearchParams({ month: value });
    };

    const printReport = () => {
        const printed = printReportDocument(
            document.getElementById('printable-report'),
            'Monthly Report'
        );
        if (!printed) toast.error('Unable to open the print window.');
    };

    const normalizeStatus = (status) => {
        if (status === 'due') return 'unpaid';
        return status === 'paid' || status === 'unpaid' ? status : 'unpaid';
    };

    const handleStatusChange = async (memberId, nextStatus) => {
        if (!currentReport?._id) return;

        try {
            const response = await API.patch(`/calculations/${currentReport._id}/members/${memberId}/status`, {
                status: normalizeStatus(nextStatus)
            });

            setCurrentReport((prev) => ({
                ...prev,
                memberCalculations: prev.memberCalculations.map((calc) =>
                    calc.member?.toString() === memberId.toString()
                        ? { ...calc, status: normalizeStatus(response.data.memberCalculation.status) }
                        : calc
                )
            }));
        } catch (error) {
            console.error('Failed to update member status', error);
            toast.error('Failed to update member status.');
        }
    };

    const filteredMemberCalculations = currentReport?.memberCalculations?.filter((calc) => {
        const normalizedStatus = normalizeStatus(calc.status || (calc.balance >= 0 ? 'paid' : 'unpaid'));
        if (statusFilter === 'all') return true;
        if (statusFilter === 'paid') return normalizedStatus === 'paid';
        if (statusFilter === 'unpaid') return normalizedStatus === 'unpaid';
        return true;
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Monthly Reports</h1>
                    <p className="text-gray-600">View and generate monthly calculations</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-700">Month</label>
                    <input
                        type="month"
                        className="input-field rounded-lg border border-gray-300 px-3 py-2 w-full sm:w-auto"
                        value={reportMonth}
                        onChange={handleMonthChange}
                    />
                    {!isViewer && (
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? '⏳ Generating...' : '📊 Generate Report'}
                        </button>
                    )}
                </div>
            </div>

            {/* Current Report */}
            {currentReport && (
                <div id="printable-report" className="bg-white rounded-xl shadow-lg p-6 print:shadow-none">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">
                                {currentReport.month} {currentReport.year} Report
                            </h2>
                            <p className="text-sm text-gray-500">Monthly calculation summary for selected period</p>
                        </div>
                        <div className="flex items-center gap-3 print:hidden">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                            <button onClick={printReport}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 print:hidden">
                                🖨️ Print
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600">Total Meals</p>
                            <p className="text-2xl font-bold text-gray-900">{currentReport.totalMeals ?? 0}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <p className="text-sm text-gray-600">Meal Rate</p>
                            <p className="text-2xl font-bold text-gray-900">৳{currentReport.mealRate ?? 0}<span className="text-gray-500">(Per meal)</span></p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <p className="text-sm text-gray-600">Total Expense</p>
                            <p className="text-2xl font-bold text-gray-900">৳{currentReport.totalExpense ?? 0}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600">Total Food Cost</p>
                            <p className="text-xl font-bold">৳{currentReport.totalFoodCost ?? 0}</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                            <p className="text-sm text-gray-600">Total Utilities</p>
                            <p className="text-xl font-bold">৳{currentReport.totalUtilityCost ?? 0}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <p className="text-sm text-gray-600">Cook Salary</p>
                            <p className="text-xl font-bold">৳{currentReport.cookSalary ?? 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <p className="text-sm text-gray-600">Total Rent (House)</p>
                            <p className="text-xl font-bold">৳{currentReport.totalRent ?? 0}</p>
                        </div>
                    </div>

                    {/* Member Wise Calculation */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-left">Member</th>
                                    <th className="p-3 text-left">Seat Rent</th>
                                    <th className="p-3 text-left">Meals</th>
                                    <th className="p-3 text-left">Meal Cost</th>
                                    <th className="p-3 text-left">Utility Share</th>
                                    <th className="p-3 text-left">Cook Salary Share</th>
                                    <th className="p-3 text-left">Total</th>
                                    <th className="p-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMemberCalculations.length > 0 ? (
                                    filteredMemberCalculations.map((calc, index) => {
                                        const currentStatus = normalizeStatus(calc.status || (calc.balance >= 0 ? 'paid' : 'unpaid'));

                                        return (
                                            <tr key={index} className="border-b">
                                                <td className="p-3">{calc.memberName}</td>
                                                <td className="p-3">৳{calc.seatRent}</td>
                                                <td className="p-3">{calc.totalMeals}</td>
                                                <td className="p-3">৳{calc.mealCost}</td>
                                                <td className="p-3">৳{calc.utilityShare}</td>
                                                <td className="p-3">৳{calc.cookSalaryShare}</td>
                                                <td className="p-3 font-bold">৳{calc.totalExpense}</td>
                                                <td className="p-3">
                                                    {isViewer ? (
                                                        <span className={`font-semibold ${currentStatus === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
                                                            {currentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={currentStatus}
                                                            onChange={(e) => handleStatusChange(calc.member, e.target.value)}
                                                            className={`w-full rounded-md border px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                currentStatus === 'paid'
                                                                    ? 'border-green-300 bg-green-50 text-green-700'
                                                                    : 'border-red-300 bg-red-50 text-red-700'
                                                            }`}
                                                        >
                                                            <option value="paid">Paid</option>
                                                            <option value="unpaid">Unpaid</option>
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="p-3 text-center text-gray-500">
                                            No member calculations match the selected status.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <ReportFooter />
                </div>
            )}

            {/* Print styles: hide everything except the printable-report container */}
            <style>{`\
                @media print {\n\
                    body * { visibility: hidden; }\n\
                    #printable-report, #printable-report * { visibility: visible; }\n\
                    #printable-report { position: absolute; left: 0; top: 0; width: 100%; }\n\
                    .print\\:hidden { display: none !important; }\n\
                }\n\
            `}</style>

        </div>
    );
};

export default MonthlyReport;