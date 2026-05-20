import '@testing-library/jest-dom'
// Mock scrollIntoView for tests
window.HTMLElement.prototype.scrollIntoView = function() {};