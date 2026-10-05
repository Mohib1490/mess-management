const isMemberActiveInMonth = (member, monthStart) => {
    const joinDate = member.joinDate ? new Date(member.joinDate) : null;
    const leavingDate = member.leavingDate ? new Date(member.leavingDate) : null;
    const selectedMonth = monthStart.getFullYear() * 12 + monthStart.getMonth();
    const joinMonth = joinDate ? joinDate.getFullYear() * 12 + joinDate.getMonth() : null;
    const leavingMonth = leavingDate ? leavingDate.getFullYear() * 12 + leavingDate.getMonth() : null;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    if (joinMonth !== null && joinMonth > selectedMonth) {
        return false;
    }

    if (leavingMonth !== null && leavingMonth <= selectedMonth) {
        return false;
    }

    if (!member.isActive && !leavingDate) {
        if (monthStart >= currentMonthStart) {
            return false;
        }
        return true;
    }

    return true;
};

module.exports = { isMemberActiveInMonth };
