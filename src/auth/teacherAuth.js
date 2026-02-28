export function loginTeacher(payload) {
    const email = String(payload?.email || '').trim().toLowerCase();
    const password = String(payload?.password || '').trim();

    // Basic mock authentication for Teacher role.
    if (!email || !password) {
        throw new Error('Email and password required.');
    }

    // You can customize these allowed teacher emails or logic later.
    if (email !== 'teacher@school.com') {
        throw new Error('Invalid teacher email.');
    }

    if (password !== 'teacher123') {
        throw new Error('Incorrect password.');
    }

    return {
        id: 'teacher-1',
        name: 'Teacher One',
        email: 'teacher@school.com',
        role: 'teacher'
    };
}
