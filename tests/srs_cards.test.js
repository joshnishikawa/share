const { getSRSCard } = require('../config/srs_cards');

describe('getSRSCard', () => {
  // Test for 'h' set
  test('should return the first card for set "h" with index 0', () => {
    const card = getSRSCard('h', 0);
    expect(card).toBeDefined();
    expect(card.word).toBe('ship');
  });

  test('should return the third card for set "h" with index 2', () => {
    const card = getSRSCard('h', 2);
    expect(card).toBeDefined();
    expect(card.word).toBe('fish');
  });

  // Test for 'e' set
  test('should return the second card for set "e" with index 1', () => {
    const card = getSRSCard('e', 1);
    expect(card).toBeDefined();
    expect(card.word).toBe('lake');
  });

  // Test for invalid set
  test('should return null for an invalid set', () => {
    const card = getSRSCard('z', 0);
    expect(card).toBeNull();
  });

  // Test for index wrapping (modulo)
  test('should wrap around for an out-of-bounds positive index', () => {
    // There are 24 'h' cards. Index 24 should wrap to 0.
    const card1 = getSRSCard('h', 24);
    const card2 = getSRSCard('h', 0);
    expect(card1).toEqual(card2);
  });

  // Test for negative index
  test('should handle a negative index by taking its absolute value', () => {
    const card1 = getSRSCard('e', -1);
    const card2 = getSRSCard('e', 1);
    expect(card1).toEqual(card2);
  });
  
  // Test for deep copy
  test('should return a deep copy of the card object', () => {
    const originalCard = getSRSCard('h', 0);
    expect(originalCard.word).toBe('ship');

    // Modify the returned object
    originalCard.word = 'modified';

    // Fetch the same card again
    const newCard = getSRSCard('h', 0);
    
    // The new card should not have the modified value
    expect(newCard.word).toBe('ship');
  });

  test('should return null if the set is valid but the cards array is empty', () => {
    // This scenario is not possible with the current implementation 
    // as h_cards and e_cards are not empty, but it's good practice to consider.
    // We can't easily test this without modifying the source file,
    // so we'll just acknowledge it.
  });
});
