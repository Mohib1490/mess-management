const mongoose = require('mongoose');
const MonthlyCalculation = require('./models/MonthlyCalculation');

(async () => {
  await mongoose.connect('mongodb+srv://mohib:mohib@cluster0.rk1ijvc.mongodb.net/mess');
  const calc = await MonthlyCalculation.findOne({ month: 'July', year: 2026 }).lean();
  console.log('docId', calc && calc._id.toString());
  console.log('memberCount', calc && calc.memberCalculations && calc.memberCalculations.length);
  console.log('sample', calc && calc.memberCalculations && calc.memberCalculations[0]);
  await mongoose.disconnect();
})();
