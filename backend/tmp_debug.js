const mongoose = require('mongoose');
const UtilityBill = require('./models/UtilityBill');
const MonthlyCalculation = require('./models/MonthlyCalculation');
const uri = process.env.MONGODB_URI || 'mongodb+srv://mohib:mohib@cluster0.rk1ijvc.mongodb.net/mess';

(async () => {
  try {
    await mongoose.connect(uri);
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const utilities = await UtilityBill.find({ month, year });
    console.log('utilities count', utilities.length);
    utilities.forEach(u => console.log(u.month, u.year, u.totalAmount, JSON.stringify(u.toObject())));
    const totalUtilityCost = utilities.reduce((sum, u) => sum + (u.totalAmount || 0), 0);
    console.log('calculated totalUtilityCost', totalUtilityCost);
    const calc = await MonthlyCalculation.findOne({ month, year });
    console.log('calc current totalUtilityCost', calc ? calc.totalUtilityCost : null);
    if (calc) {
      Object.assign(calc, { totalUtilityCost });
      await calc.save();
      console.log('calc after save', calc.totalUtilityCost);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();