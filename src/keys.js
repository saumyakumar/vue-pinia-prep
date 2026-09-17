// Injection keys. Using a Symbol (instead of a plain string) avoids name
// collisions and lets tooling find providers/consumers. Lesson 09.
export const THEME_KEY = Symbol('dashboard-theme')
