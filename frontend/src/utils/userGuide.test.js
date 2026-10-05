import { getUserGuideResponse } from './userGuide';

describe('getUserGuideResponse', () => {
    test('provides a relevant page link for a supported question', () => {
        const response = getUserGuideResponse('How do I record lunch?', 'member');

        expect(response.answer).toMatch(/Meal System/);
        expect(response.link).toEqual({ to: '/meal-system', label: 'Open Meal System' });
    });

    test('does not direct members to admin-only pages', () => {
        const response = getUserGuideResponse('How do I add a member?', 'member');

        expect(response.answer).toMatch(/only available to admins/i);
        expect(response.link).toBeNull();
    });

    test('explains that viewers can preview reports without changing payment statuses', () => {
        const response = getUserGuideResponse('How do I view a report?', 'viewer');

        expect(response.answer).toMatch(/cannot change payment statuses/i);
        expect(response.link).toEqual({ to: '/monthly-report', label: 'Open Reports' });
    });

    test('suggests supported topics when a question is not recognized', () => {
        const response = getUserGuideResponse('Tell me a joke', 'admin');

        expect(response.answer).toMatch(/not sure about that yet/i);
        expect(response.link).toBeNull();
    });

    test('answers Bengali meal questions in Bengali and provides a localized link', () => {
        const response = getUserGuideResponse('আমি কীভাবে দুপুরের খাবার যোগ করব?', 'member');

        expect(response.answer).toMatch(/Meal System খুলে/);
        expect(response.link).toEqual({ to: '/meal-system', label: 'Meal System খুলুন' });
    });

    test('answers Bengali admin-only questions with a localized access notice', () => {
        const response = getUserGuideResponse('নতুন সদস্য কীভাবে যোগ করব?', 'member');

        expect(response.answer).toMatch(/শুধু অ্যাডমিনদের জন্য/);
        expect(response.link).toBeNull();
    });

    test('answers Bengali viewer report questions in Bengali', () => {
        const response = getUserGuideResponse('মাসিক রিপোর্ট কীভাবে দেখব?', 'viewer');

        expect(response.answer).toMatch(/Viewer হিসেবে/);
        expect(response.link.label).toBe('রিপোর্ট খুলুন');
    });
});
