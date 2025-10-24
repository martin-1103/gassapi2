export const TEST_TEMPLATES = {
  'Status Code': `pm.test("Status code is 200", () => {
    pm.expect(pm.response.status).to.equal(200);
});`,
  'Response Time': `pm.test("Response time is less than 500ms", () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
});`,
  'Response Format': `pm.test("Response has data array", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData.data).to.be.an('array');
});`,
  'Header Check': `pm.test("Content-Type header is present", () => {
    pm.expect(pm.response.headers).to.have.property('content-type');
});`,
  'JSON Structure': `pm.test("User object has required fields", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user');
    pm.expect(jsonData.user).to.have.property('id');
    pm.expect(jsonData.user).to.have.property('email');
});`,
  Authentication: `pm.test("Authentication token is valid", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData.token).to.be.a('string');
    pm.expect(jsonData.token.length).to.be.greaterThan(10);
});`,
} as const;

export type TestTemplateName = keyof typeof TEST_TEMPLATES;
