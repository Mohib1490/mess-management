const helpTopics = [
    {
        keywords: ['meal', 'breakfast', 'lunch', 'dinner', 'record', 'submit', 'lock', 'খাবার', 'মিল', 'নাস্তা', 'সকালের খাবার', 'দুপুরের খাবার', 'রাতের খাবার', 'খাবার যোগ', 'খাবার লিখব'],
        answer: 'Open Meal System and choose a date. Breakfast can be switched on or off; lunch and dinner have portion choices. Members can update their own meals, but a submitted meal may be locked. Ask an admin to correct a locked entry.',
        answerBn: 'Meal System খুলে একটি তারিখ নির্বাচন করুন। সকালের নাস্তা চালু বা বন্ধ করা যায়; দুপুর ও রাতের খাবারের জন্য পরিমাণ নির্বাচন করুন। সদস্যরা নিজেদের খাবার জমা দিতে পারেন, তবে জমা দেওয়ার পর সেটি লক হতে পারে। লক করা তথ্য সংশোধনের জন্য প্রশাসকের সঙ্গে যোগাযোগ করুন।',
        link: { to: '/meal-system', label: 'Open Meal System', labelBn: 'Meal System খুলুন' }
    },
    {
        keywords: ['member', 'add member', 'edit member', 'remove member', 'seat', 'rent', 'সদস্য', 'মেম্বার', 'ভাড়া', 'সিট'],
        answer: 'Admins can manage member details, seat rent, and active status from Members. Choose Add Member to create a record, or use the actions on an existing member to update it.',
        answerBn: 'প্রশাসকরা Members পেজ থেকে সদস্যের তথ্য, সিট ভাড়া এবং সক্রিয় অবস্থা পরিচালনা করতে পারেন। নতুন সদস্য যোগ করতে Add Member নির্বাচন করুন; আগের সদস্যের তথ্য বদলাতে তার পাশের অ্যাকশন ব্যবহার করুন।',
        link: { to: '/members', label: 'Open Members', labelBn: 'সদস্য তালিকা খুলুন' },
        adminOnly: true
    },
    {
        keywords: ['food', 'grocery', 'market', 'cost', 'purchase', 'deduction', 'বাজার', 'বাজার খরচ', 'খাবারের খরচ', 'বাজারের খরচ', 'কেনাকাটা'],
        answer: 'Use Food Cost to record market purchases. Select a month, add the items and quantities, enter who bought them, then save. You can filter records by month or member and open the food-cost monthly report.',
        answerBn: 'বাজারের কেনাকাটার হিসাব রাখতে Food Cost পেজ খুলুন। মাস নির্বাচন করে পণ্যের নাম ও পরিমাণ যোগ করুন, কে বাজার করেছেন তা লিখে সংরক্ষণ করুন। মাস বা সদস্য অনুযায়ী হিসাব খুঁজতে পারবেন এবং মাসিক Food Cost রিপোর্টও দেখতে পারবেন।',
        link: { to: '/food-cost', label: 'Open Food Cost', labelBn: 'বাজার খরচ খুলুন' },
        adminOnly: true
    },
    {
        keywords: ['utility', 'utilities', 'electricity', 'gas', 'water', 'internet', 'bill', 'ইউটিলিটি', 'বিদ্যুৎ', 'গ্যাস', 'পানি', 'ইন্টারনেট বিল', 'বিল'],
        answer: 'Open Utilities, select a month, and add or edit the bill amounts. The total is calculated from the individual utility amounts; you can also mark a bill as paid.',
        answerBn: 'Utilities পেজ খুলে মাস নির্বাচন করুন, তারপর বিলের পরিমাণ যোগ বা সম্পাদনা করুন। আলাদা বিলের পরিমাণ থেকে মোট হিসাব স্বয়ংক্রিয়ভাবে হবে। বিল পরিশোধ করা হলে সেটিকে Paid হিসেবে চিহ্নিত করতে পারবেন।',
        link: { to: '/utilities', label: 'Open Utilities', labelBn: 'ইউটিলিটি বিল খুলুন' },
        adminOnly: true
    },
    {
        keywords: ['cook', 'salary', 'advance', 'bonus', 'payment', 'বাবুর্চি', 'রাঁধুনি', 'রান্নার লোক', 'বেতন', 'অগ্রিম', 'বোনাস'],
        answer: 'Open Cook Salary and select a month to view records. Admins can add or edit a salary, enter bonuses, advances, and deductions, and record payments.',
        answerBn: 'Cook Salary পেজ খুলে একটি মাস নির্বাচন করুন। প্রশাসকরা বেতন যোগ বা সম্পাদনা করতে, বোনাস/অগ্রিম/কর্তন লিখতে এবং বেতন পরিশোধের তথ্য রাখতে পারেন।',
        link: { to: '/cook-salary', label: 'Open Cook Salary', labelBn: 'রাঁধুনির বেতন খুলুন' },
        adminOnly: true
    },
    {
        keywords: ['report', 'monthly report', 'calculation', 'balance', 'due', 'paid', 'print', 'রিপোর্ট', 'প্রতিবেদন', 'হিসাব', 'মাসিক হিসাব', 'বকেয়া', 'পরিশোধ', 'প্রিন্ট'],
        answer: 'Open Reports, select a month, and generate or preview the monthly calculation. Admins can update member payment status; viewers can preview reports. Use the report’s print option to print or save it as a PDF.',
        answerBn: 'Reports পেজ খুলে মাস নির্বাচন করুন, তারপর মাসিক হিসাব তৈরি বা প্রিভিউ করুন। প্রশাসকরা সদস্যের পেমেন্ট অবস্থা আপডেট করতে পারেন; Viewer-রা শুধু রিপোর্ট দেখতে পারেন। রিপোর্টের Print অপশন থেকে প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন।',
        answerViewerBn: 'Viewer হিসেবে আপনি রিপোর্ট দেখতে পারবেন, কিন্তু পেমেন্টের অবস্থা পরিবর্তন করতে পারবেন না। Reports পেজ খুলে মাস নির্বাচন করে মাসিক হিসাব প্রিভিউ করুন। Print অপশন থেকে প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন।',
        link: { to: '/monthly-report', label: 'Open Reports', labelBn: 'রিপোর্ট খুলুন' }
    },
    {
        keywords: ['meal report', 'meal summary', 'monthly meals', 'মিল রিপোর্ট', 'খাবারের রিপোর্ট', 'মাসিক খাবার'],
        answer: 'From Meal System, choose a month and select Open Report to see the monthly meal summary.',
        answerBn: 'Meal System পেজে মাস নির্বাচন করে Open Report চাপুন। সেখানে মাসের খাবারের সারসংক্ষেপ দেখতে পারবেন।',
        link: { to: '/meal-system', label: 'Open Meal System', labelBn: 'Meal System খুলুন' }
    },
    {
        keywords: ['food report', 'food cost report', 'market report', 'বাজারের রিপোর্ট', 'খাবারের খরচের রিপোর্ট'],
        answer: 'Open Food Cost and use its monthly report option. You can choose a month and, if needed, filter the report by a member.',
        answerBn: 'Food Cost পেজ খুলে মাসিক রিপোর্ট অপশন ব্যবহার করুন। মাস নির্বাচন করতে পারবেন এবং প্রয়োজন হলে সদস্য অনুযায়ী রিপোর্ট ফিল্টার করতে পারবেন।',
        link: { to: '/food-cost', label: 'Open Food Cost', labelBn: 'বাজার খরচ খুলুন' }
    },
    {
        keywords: ['dashboard', 'home', 'overview', 'statistics', 'stats', 'ড্যাশবোর্ড', 'হোম', 'সারসংক্ষেপ'],
        answer: 'The Dashboard is the home page. It summarizes today’s meals and the current month’s mess figures, with shortcuts to common tasks.',
        answerBn: 'Dashboard হলো অ্যাপের মূল পেজ। এখানে আজকের খাবার ও চলতি মাসের মেসের হিসাবের সারসংক্ষেপ এবং প্রয়োজনীয় কাজের শর্টকাট দেখা যায়।',
        link: { to: '/', label: 'Open Dashboard', labelBn: 'ড্যাশবোর্ড খুলুন' }
    },
    {
        keywords: ['profile', 'password', 'account', 'email', 'phone', 'প্রোফাইল', 'পাসওয়ার্ড', 'অ্যাকাউন্ট', 'ফোন'],
        answer: 'Open the profile menu in the top navigation and choose Profile Settings to view your account details. If profile editing is available for your role, you can update your details there.',
        answerBn: 'উপরের নেভিগেশন থেকে প্রোফাইল মেনু খুলে Profile Settings নির্বাচন করলে অ্যাকাউন্টের তথ্য দেখতে পাবেন। আপনার ভূমিকার জন্য সম্পাদনার সুবিধা থাকলে সেখানেই তথ্য পরিবর্তন করতে পারবেন।',
        link: { to: '/profile', label: 'Open Profile Settings', labelBn: 'প্রোফাইল সেটিংস খুলুন' },
        adminOnly: true
    },
    {
        keywords: ['login', 'sign in', 'forgot', 'access', 'লগইন', 'প্রবেশ', 'পাসওয়ার্ড ভুলে', 'অ্যাক্সেস'],
        answer: 'Sign in with your admin email or member ID and password. If you cannot access your account, use Forgot Password on the login page or contact your mess administrator.',
        answerBn: 'আপনার অ্যাডমিন ইমেইল বা মেম্বার আইডি এবং পাসওয়ার্ড দিয়ে লগইন করুন। অ্যাকাউন্টে ঢুকতে সমস্যা হলে লগইন পেজের Forgot Password ব্যবহার করুন অথবা মেস প্রশাসকের সঙ্গে যোগাযোগ করুন।',
        link: null
    },
    {
        keywords: ['help', 'manual', 'what can you do', 'topics', 'সাহায্য', 'নির্দেশিকা', 'কীভাবে ব্যবহার', 'কি করতে পারো'],
        answer: 'Ask me how to record meals, manage members, enter food or utility costs, record cook salary, or view monthly reports. Your available pages depend on your account role.',
        answerBn: 'খাবার যোগ, সদস্য পরিচালনা, বাজার বা ইউটিলিটি বিল লেখা, রাঁধুনির বেতন রাখা অথবা মাসিক রিপোর্ট দেখার বিষয়ে জিজ্ঞেস করুন। আপনার অ্যাকাউন্টের ভূমিকা অনুযায়ী পেজগুলো পাওয়া যাবে।',
        link: null
    }
];

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff\s]/g, ' ').replace(/\s+/g, ' ').trim();
const isBengali = (text) => /[\u0980-\u09ff]/.test(text);

export const getUserGuideResponse = (question, role) => {
    const normalizedQuestion = normalize(question);
    const bengali = isBengali(question);
    if (!normalizedQuestion) {
        return {
            answer: bengali
                ? 'মেস ম্যানেজমেন্ট অ্যাপ ব্যবহার সম্পর্কে একটি প্রশ্ন লিখুন, যেমন: “আমি কীভাবে খাবার যোগ করব?”'
                : 'Type a question about using the mess management app, such as “How do I record a meal?”',
            link: null
        };
    }

    const bestMatch = helpTopics
        .map((topic) => ({
            topic,
            score: topic.keywords.reduce((score, keyword) => {
                const normalizedKeyword = normalize(keyword);
                return score + (normalizedQuestion.includes(normalizedKeyword) ? normalizedKeyword.split(' ').length : 0);
            }, 0)
        }))
        .sort((a, b) => b.score - a.score)[0];

    if (!bestMatch || bestMatch.score === 0) {
        return {
            answer: bengali
                ? 'এই বিষয়ে আমি নিশ্চিত নই। খাবার, সদস্য, বাজার খরচ, ইউটিলিটি বিল, রাঁধুনির বেতন, রিপোর্ট বা প্রোফাইল সম্পর্কে জিজ্ঞেস করুন।'
                : 'I’m not sure about that yet. Try asking about meals, members, food costs, utility bills, cook salary, reports, or your profile.',
            link: null
        };
    }

    if (role === 'member' && bestMatch.topic.adminOnly) {
        return {
            answer: bengali
                ? 'এই বিভাগটি শুধু অ্যাডমিনদের জন্য। এই বিষয়ে সাহায্যের জন্য আপনার মেস প্রশাসকের সঙ্গে যোগাযোগ করুন।'
                : 'That section is only available to admins. Please contact your mess administrator for help with this request.',
            link: null
        };
    }

    const isReport = bestMatch.topic.keywords.includes('report');
    const answer = bengali
        ? role === 'viewer' && isReport
            ? bestMatch.topic.answerViewerBn || bestMatch.topic.answerBn
            : bestMatch.topic.answerBn
        : role === 'viewer' && isReport
            ? 'As a viewer, you can preview reports but cannot change payment statuses. Open Reports, select a month, and preview the monthly calculation. Use the report’s print option to print or save it as a PDF.'
            : bestMatch.topic.answer;

    return {
        answer,
        link: bestMatch.topic.link && {
            to: bestMatch.topic.link.to,
            label: bengali ? bestMatch.topic.link.labelBn : bestMatch.topic.link.label
        }
    };
};
