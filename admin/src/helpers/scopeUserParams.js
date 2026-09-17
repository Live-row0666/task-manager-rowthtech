const SCOPED_ROLES = ['QA', 'Sales', 'Marketing', 'Freelancers', 'Project Manager'];

export const isScopedRole = (role) => SCOPED_ROLES.includes(role);

export const getScopedUserIdParams = (role, userId) =>
    isScopedRole(role) && userId ? { userId } : {};
