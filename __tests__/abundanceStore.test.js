describe('Edge Cases', () => {
  it('should handle invalid state updates gracefully', () => {
    const invalidUpdate = { nonExistentKey: 'value' };
    useAbundanceStore.setState(invalidUpdate);
    expect(useAbundanceStore.getState()).not.toHaveProperty('nonExistentKey');
  });

  it('should maintain consistency with concurrent updates', async () => {
    await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        const randomValue = Math.random();
        useAbundanceStore.setState({ someKey: randomValue });
      })
    );
    expect(typeof useAbundanceStore.getState().someKey).toBe('number');
  });

  it('should reset to initial state', () => {
    useAbundanceStore.setState({ key: 'modified' });
    useAbundanceStore.getState().reset();
    expect(useAbundanceStore.getState()).toEqual(initialState);
  });
}); 