describe('Orchestrator EDI API', () => {
  const validEdiContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001\n313000000000123450101202300000000012345000000000123450000000001234\n31400000000012345PRODUTO TESTE                   000000000012300000000001230000000000123\n318000000000012300000000001230000000000123000000000123`;

  it('should accept valid EDI content and return PENDING status', () => {
    cy.request({
      method: 'POST',
      url: '/edi/process',
      body: { content: validEdiContent },
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.have.property('message', 'EDI file sent for processing');
      expect(response.body).to.have.property('status', 'PENDING');
    });
  });

  it('should reject empty EDI content', () => {
    cy.request({
      method: 'POST',
      url: '/edi/process',
      body: { content: '' },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.have.property('error', 'No EDI content provided');
    });
  });

  it('should reject request without content field', () => {
    cy.request({
      method: 'POST',
      url: '/edi/process',
      body: {},
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.have.property('error', 'No EDI content provided');
    });
  });

  it('should reject request with invalid content type', () => {
    cy.request({
      method: 'POST',
      url: '/edi/process',
      body: { content: validEdiContent },
      headers: { 'Content-Type': 'text/plain' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.have.property('error');
    });
  });

  it('should handle malformed JSON', () => {
    cy.request({
      method: 'POST',
      url: '/edi/process',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.have.property('error', 'Invalid JSON format');
    });
  });
}); 