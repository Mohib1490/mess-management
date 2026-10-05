const mongoose = require('mongoose');
const axios = require('axios');
const MonthlyCalculation = require('./models/MonthlyCalculation');

(async () => {
  await mongoose.connect('mongodb+srv://mohib:mohib@cluster0.rk1ijvc.mongodb.net/mess');
  const calc = await MonthlyCalculation.findOne({ month: 'July', year: 2026 }).lean();
  const memberId = calc.memberCalculations[0].member;

  try {
    const res = await axios.patch(`http://localhost:5000/api/calculations/${calc._id}/members/${memberId}/status`, { status: 'unpaid' });
    console.log('SUCCESS', res.status, res.data);
  } catch (error) {
    console.log('ERROR_MESSAGE', error.message);
    console.log('ERROR_RESPONSE', error.response && error.response.data);
  }

  await mongoose.disconnect();
})();
