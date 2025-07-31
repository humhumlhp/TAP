export const AUDIENCE_TYPES = {
    SCHOOL: 'school',
    CLASS: 'class',
    PERSONAL: 'personal' // Changed from YOURSELF to PERSONAL for consistency
};

export const AUDIENCE_CONFIG = [
    { 
        key: AUDIENCE_TYPES.SCHOOL, 
        label: 'Trường', 
        icon: 'school-outline' 
    },
    { 
        key: AUDIENCE_TYPES.CLASS, 
        label: 'Lớp', 
        icon: 'people-outline' 
    },
    { 
        key: AUDIENCE_TYPES.PERSONAL, 
        label: 'Cá nhân', 
        icon: 'person-outline' 
    }
];

export const DEFAULT_AUDIENCE = AUDIENCE_TYPES.PERSONAL;