describe('Clip', () => {
  it('should play clip', () => {
    // visit homepage
    cy.visit('/');
    // click on first clip
    cy.get('app-clips-list > .grid a:first').click();
    // click on video player
    cy.get('.video-js').click();
    // wait 3 sec
    cy.wait(3000);
    // click on video player
    cy.get('.video-js').click();
    // assert width of prorgress bar
    cy.get('.vjs-play-progress').invoke('width').should('gte', 0);
  });
});
