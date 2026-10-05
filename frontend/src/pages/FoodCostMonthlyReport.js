import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import ReportFooter from '../components/ReportFooter';
import printReportDocument from '../utils/printReport';

const FoodCostMonthlyReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [reportMonth, setReportMonth] = useState('');
    const [reportUserName, setReportUserName] = useState('');
    const [reportData, setReportData] = useState({
        monthName: '',
        year: '',
        dates: [],
        members: [],
        rows: {},
        totals: {}
    });
    const [loading, setLoading] = useState(false);
    const reportRef = useRef(null);

    const parseMonthToInputValue = (value) => {
        if (!value) return '';

        const slashMatch = value.match(/^(\d{1,2})\/(\d{4})$/);
        if (slashMatch) {
            return `${slashMatch[2]}-${slashMatch[1].padStart(2, '0')}`;
        }

        return value;
    };

    const formatMonthForUrl = (value) => {
        const [year, month] = value.split('-');
        return `${month}/${year}`;
    };

    useEffect(() => {
        const monthParam = searchParams.get('month');
        const userNameParam = searchParams.get('userName') || '';
        setReportUserName(userNameParam);

        if (monthParam) {
            setReportMonth(parseMonthToInputValue(monthParam));
        } else {
            const now = new Date();
            const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setReportMonth(defaultMonth);
            setSearchParams({ month: formatMonthForUrl(defaultMonth) });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (reportMonth) {
            fetchReport(reportMonth);
        }
        // Only refetch when the month changes; the user-name filter updates on every keystroke.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportMonth]);

    const fetchReport = async (monthValue) => {
        try {
            setLoading(true);
            const [year, month] = monthValue.split('-');
            const response = await API.get('/food/month-report', {
                params: {
                    month: `${month}/${year}`,
                    userName: reportUserName || undefined
                }
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Failed to fetch food cost monthly report', error);
            toast.error('Unable to load food cost report for the selected month.');
            setReportData({
                monthName: '',
                year: '',
                dates: [],
                members: [],
                rows: {},
                totals: {}
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (event) => {
        const value = event.target.value;
        setReportMonth(value);
        const params = new URLSearchParams(searchParams);
        params.set('month', formatMonthForUrl(value));
        if (reportUserName.trim()) {
            params.set('userName', reportUserName.trim());
        } else {
            params.delete('userName');
        }
        setSearchParams(params);
    };

    const handleUserNameChange = (event) => {
        const value = event.target.value;
        setReportUserName(value);
        const params = new URLSearchParams(searchParams);
        params.set('month', formatMonthForUrl(reportMonth));
        if (value.trim()) {
            params.set('userName', value.trim());
        } else {
            params.delete('userName');
        }
        setSearchParams(params);
    };

    const printReport = () => {
        const printed = printReportDocument(reportRef.current, 'Food Cost Monthly Report');
        if (!printed) toast.error('Unable to open the print window.');
    };

    const reportSummary = reportData.members.map((member) => ({
        ...member,
        total: reportData.totals[member._id] || 0
    }));

    const grandTotal = reportSummary.reduce((sum, member) => sum + member.total, 0);

    const visibleDates = reportData.dates.filter((date) =>
        reportData.members.some((member) => (reportData.rows[date.key]?.[member._id] || 0) !== 0)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Food Cost Monthly Report</h1>
                    <p className="text-gray-600">View member-wise food cost totals for the selected month.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Month</label>
                        <input
                            type="month"
                            className="input-field rounded-lg border border-gray-300 px-3 py-2"
                            value={reportMonth}
                            onChange={handleMonthChange}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">User</label>
                        <input
                            type="text"
                            className="input-field rounded-lg border border-gray-300 px-3 py-2"
                            value={reportUserName}
                            onChange={handleUserNameChange}
                            placeholder="e.g. Mohib"
                        />
                    </div>
                    <button
                        onClick={printReport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 print:hidden"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>

            <div id="food-cost-monthly-report" ref={reportRef} className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Monthly Food Cost Report</h2>
                    <p className="text-gray-600">
                        {reportData.monthName
                            ? `${reportData.monthName} - ${reportData.year}${reportUserName ? ` | ${reportUserName}` : ''}`
                            : 'Select a month to view the report.'}
                    </p>
                </div>

                {reportSummary.length > 0 && (
                    <div className="mb-6 rounded-xl bg-gray-50 p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Monthly Cost Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reportSummary.map((member) => (
                                <div key={member._id} className="rounded-lg bg-white p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-700">{member.name}</span>
                                        <span className="font-semibold text-gray-900">৳{member.total}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                            <div className="flex items-center justify-between text-gray-900 font-semibold">
                                <span>Total</span>
                                <span>৳{grandTotal}</span>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin text-4xl">⚡</div>
                        <p className="mt-2 text-gray-600">Loading report...</p>
                    </div>
                ) : visibleDates.length > 0 ? (
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
                                {visibleDates.map((date) => (
                                    <tr key={date.key} className="border-t">
                                        <td className="px-3 py-2 font-medium text-gray-700">{date.label}</td>
                                        {reportData.members.map((member) => (
                                            <td key={member._id} className="px-3 py-2 text-gray-700">
                                                ৳{reportData.rows[date.key]?.[member._id] || 0}
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
                                            ৳{reportData.totals[member._id] || 0}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-600">
                        {reportData.monthName
                            ? 'No food cost data was found for the selected month.'
                            : 'Please select a month to load the report.'}
                    </div>
                )}
                <ReportFooter />
            </div>
            <style>{`\
                @media print {\n\
                    body * { visibility: hidden; }\n\
                    #food-cost-monthly-report, #food-cost-monthly-report * { visibility: visible; }\n\
                    #food-cost-monthly-report { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }\n\
                    .print\\:hidden { display: none !important; }\n\
                }\n\
            `}</style>
        </div>
    );
};

export default FoodCostMonthlyReport;
