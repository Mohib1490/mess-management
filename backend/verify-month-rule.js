require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('./models/Member');

const isMemberActiveInMonth = (member, monthStart, monthEnd) => {
  const joinDate = member.joinDate ? new Date(member.joinDate) : null;
  const leavingDate = member.leavingDate ? new Date(member.leavingDate) : null;
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  if (joinDate && joinDate > monthEnd) return false;
  if (leavingDate && leavingDate <= monthStart) return false;
  if (!member.isActive && !leavingDate) {
    if (monthStart >= currentMonthStart) return false;
    return true;
  }
  return true;
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mohib:mohib@cluster0.rk1ijvc.mongodb.net/mess');
  const members = await Member.find({}, 'name isActive joinDate leavingDate');

  const july = members.filter((m) => isMemberActiveInMonth(m, new Date(2026, 6, 1)));
  const august = members.filter((m) => isMemberActiveInMonth(m, new Date(2026, 7, 1)));
  const september = members.filter((m) => isMemberActiveInMonth(m, new Date(2026, 8, 1)));

  console.log('July active:', july.map((m) => m.name));
  console.log('August active:', august.map((m) => m.name));
  console.log('September active:', september.map((m) => m.name));

  await mongoose.disconnect();
})();
