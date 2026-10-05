import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import ReportFooter from '../components/ReportFooter';
import printReportDocument from '../utils/printReport';

const MealMonthlyReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [reportMonth, setReportMonth] = useState('');
    const [reportData, setReportData] = useState({
        monthName: '',
        year: '',
        dates: [],
        members: [],
        rows: {},
        totals: {},
        totalMeals: 0,
        mealRate: 0,
        totalExpense: 0
    });
    const [loading, setLoading] = useState(false);
    const reportRef = useRef(null);

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

    const fetchReport = async (monthValue) => {
        try {
            setLoading(true);
            const [year, month] = monthValue.split('-');
            const response = await API.get('/meals/month-report', {
                params: {
                    month,
                    year
                }
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Failed to fetch meal monthly report', error);
            toast.error('Unable to load meal report for selected month.');
            setReportData({
                monthName: '',
                year: '',
                dates: [],
                members: [],
                rows: {},
                totals: {},
                totalMeals: 0,
                mealRate: 0,
                totalExpense: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (event) => {
        const value = event.target.value;
        setReportMonth(value);
        setSearchParams({ month: value });
    };

    const printReport = () => {
        const printed = printReportDocument(reportRef.current, 'Meal Monthly Report');
        if (!printed) toast.error('Unable to open the print window.');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Meal Monthly Report</h1>
                    <p className="text-gray-600">View the daily meal report for all members in a separate window.</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Month</label>
                    <input
                        type="month"
                        className="input-field rounded-lg border border-gray-300 px-3 py-2"
                        value={reportMonth}
                        onChange={handleMonthChange}
                    />
                    <button
                        onClick={printReport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 print:hidden"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>

            <div id="meal-monthly-report" ref={reportRef} className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Members Monthly Meal Report</h2>
                    <p className="text-gray-600">{reportData.monthName ? `${reportData.monthName} - ${reportData.year}` : 'Select a month to view the report.'}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {reportData.monthName ? `${reportData.monthName} ${reportData.year}` : 'Monthly Summary'}
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p className="text-sm">Total Meals: <span className="font-semibold text-gray-900">{reportData.totalMeals}</span></p>
                        <p className="text-sm">Meal Rate: <span className="font-semibold text-gray-900">৳{reportData.mealRate}</span></p>
                        <p className="text-sm">Total Expense: <span className="font-semibold text-gray-900">৳{reportData.totalExpense}</span></p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin text-4xl">⚡</div>
                        <p className="mt-2 text-gray-600">Loading report...</p>
                    </div>
                ) : reportData.dates.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-3 py-3 font-medium text-gray-700">Date</th>
                                    {reportData.members.map((member) => (
                                        <th key={member._id} className="px-3 py-3 font-medium text-gray-700">
                                            {member.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.dates.map((date) => (
                                    <tr key={date.key} className="border-t">
                                        <td className="px-3 py-2 font-medium text-gray-700">{date.label}</td>
                                        {reportData.members.map((member) => (
                                            <td key={member._id} className="px-3 py-2 text-gray-700">
                                                {reportData.rows[date.key]?.[member._id] || 0}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t bg-gray-50 font-semibold">
                                    <td className="px-3 py-3 text-gray-900">Total</td>
                                    {reportData.members.map((member) => (
                                        <td key={member._id} className="px-3 py-3 text-gray-900">
                                            {reportData.totals[member._id] || 0}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-600">
                        {reportData.monthName
                            ? 'No meal data was found for the selected month.'
                            : 'Please select a month to load the meal report.'}
                    </div>
                )}
                <ReportFooter />
            </div>
            <style>{`\
                @media print {\n\
                    body * { visibility: hidden; }\n\
                    #meal-monthly-report, #meal-monthly-report * { visibility: visible; }\n\
                    #meal-monthly-report { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }\n\
                    .print\\:hidden { display: none !important; }\n\
                }\n\
            `}</style>
        </div>
    );
};

export default MealMonthlyReport;
