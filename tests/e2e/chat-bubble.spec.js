import { test, expect } from '@playwright/test';

test.describe('Chat Bubble Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8086/examples/chat-bubble-showcase.html');
    // Wait for custom elements to be defined and rendered
    await page.waitForTimeout(1500);
  });

  test('should render chat bubbles without "no content" messages', async ({ page }) => {
    // Check for any "no content" or error messages
    const noContentMessages = await page.locator('text=/no content|not found|undefined/i').count();
    expect(noContentMessages).toBe(0);

    // Verify chat bubbles are present
    const chatBubbles = await page.locator('dry-chat-bubble').count();
    expect(chatBubbles).toBeGreaterThan(0);
  });

  test('should render with correct initial state', async ({ page }) => {
    // Check first received message
    const firstReceived = page.locator('dry-chat-bubble[type="received"]').first();
    await expect(firstReceived).toBeVisible();
    
    // Verify it has content
    const content = await firstReceived.textContent();
    expect(content.trim().length).toBeGreaterThan(0);

    // Check first sent message
    const firstSent = page.locator('dry-chat-bubble[type="sent"]').first();
    await expect(firstSent).toBeVisible();
    
    // Verify it has content
    const sentContent = await firstSent.textContent();
    expect(sentContent.trim().length).toBeGreaterThan(0);
  });

  test('should display received messages with avatar', async ({ page }) => {
    const receivedMessage = page.locator('dry-chat-bubble[type="received"]').first();
    
    // Check for avatar image
    const avatar = receivedMessage.locator('img[alt]');
    await expect(avatar).toBeVisible();
    
    // Verify avatar has src attribute
    const src = await avatar.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src.length).toBeGreaterThan(0);
  });

  test('should display sent messages on the right side', async ({ page }) => {
    const sentMessage = page.locator('dry-chat-bubble[type="sent"]').first();
    await expect(sentMessage).toBeVisible();
    
    // Check that the container has justify-end class (right alignment)
    const container = sentMessage.locator('div.justify-end').first();
    await expect(container).toBeVisible();
  });

  test('should display received messages on the left side', async ({ page }) => {
    const receivedMessage = page.locator('dry-chat-bubble[type="received"]').first();
    await expect(receivedMessage).toBeVisible();
    
    // Check that the container has justify-start class (left alignment)
    const container = receivedMessage.locator('div.justify-start').first();
    await expect(container).toBeVisible();
  });

  test('should display sender name for received messages', async ({ page }) => {
    // Find a received message with a name attribute
    const receivedWithName = page.locator('dry-chat-bubble[type="received"][name]').first();
    const nameAttr = await receivedWithName.getAttribute('name');
    
    if (nameAttr) {
      // Check if name is displayed in the message
      const nameText = await receivedWithName.textContent();
      expect(nameText).toContain(nameAttr);
    }
  });

  test('should show message status for sent messages', async ({ page }) => {
    // Find sent messages with status
    const sentWithStatus = page.locator('dry-chat-bubble[type="sent"][status]').first();
    await expect(sentWithStatus).toBeVisible();
    
    // Check for status indicator (SVG icon)
    const statusIcon = sentWithStatus.locator('svg');
    const iconCount = await statusIcon.count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test('should display timestamp when provided', async ({ page }) => {
    // Find a message with timestamp
    const messageWithTimestamp = page.locator('dry-chat-bubble[timestamp]').first();
    await expect(messageWithTimestamp).toBeVisible();
    
    // Check for timestamp text (should show time format like "10m ago", "1h ago", etc.)
    const content = await messageWithTimestamp.textContent();
    const hasTimeFormat = /\d+[mhd]\s+ago|Just now|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(content);
    expect(hasTimeFormat).toBeTruthy();
  });

  test('should handle grouped messages correctly', async ({ page }) => {
    // Find message grouping section
    const groupSection = page.locator('section').filter({ hasText: 'Message Grouping' }).first();
    await expect(groupSection).toBeVisible();
    
    // Check for group-start and group-end attributes
    const groupStart = groupSection.locator('dry-chat-bubble[group-start]');
    const groupEnd = groupSection.locator('dry-chat-bubble[group-end]');
    
    expect(await groupStart.count()).toBeGreaterThan(0);
    expect(await groupEnd.count()).toBeGreaterThan(0);
  });

  test('should display different status states', async ({ page }) => {
    // Navigate to status section
    const statusSection = page.locator('section').filter({ hasText: 'Message Status' }).first();
    await expect(statusSection).toBeVisible();
    
    // Check for different status attributes
    const sentStatus = statusSection.locator('dry-chat-bubble[status="sent"]');
    const deliveredStatus = statusSection.locator('dry-chat-bubble[status="delivered"]');
    const readStatus = statusSection.locator('dry-chat-bubble[status="read"]');
    const failedStatus = statusSection.locator('dry-chat-bubble[status="failed"]');
    
    await expect(sentStatus).toBeVisible();
    await expect(deliveredStatus).toBeVisible();
    await expect(readStatus).toBeVisible();
    await expect(failedStatus).toBeVisible();
  });

  test('should handle rich content (images and links)', async ({ page }) => {
    // Navigate to rich content section
    const richContentSection = page.locator('section').filter({ hasText: 'Rich Content' }).first();
    await expect(richContentSection).toBeVisible();
    
    // Check for image in message
    const messageWithImage = richContentSection.locator('dry-chat-bubble img[alt="Beautiful landscape"]');
    await expect(messageWithImage).toBeVisible();
    
    // Check for link in message
    const messageWithLink = richContentSection.locator('dry-chat-bubble a[href]');
    await expect(messageWithLink).toBeVisible();
  });

  test('should handle long messages', async ({ page }) => {
    // Navigate to long messages section
    const longMessageSection = page.locator('section').filter({ hasText: 'Long Messages' }).first();
    await expect(longMessageSection).toBeVisible();
    
    // Check that long messages are present and visible
    const longMessages = longMessageSection.locator('dry-chat-bubble');
    expect(await longMessages.count()).toBeGreaterThan(0);
    
    // Verify content is not truncated unexpectedly
    const firstLongMessage = longMessages.first();
    const content = await firstLongMessage.textContent();
    expect(content.length).toBeGreaterThan(100); // Long message should be substantial
  });

  test('should not have JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(1500);

    // Filter out unrelated errors (like network errors for external resources)
    const relevantErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('net::ERR') &&
      !err.includes('404')
    );
    
    expect(relevantErrors).toEqual([]);
  });

  test('should render in component builder section', async ({ page }) => {
    // Find component builder
    const componentBuilder = page.locator('#chat-bubble-component-builder');
    await expect(componentBuilder).toBeVisible();
    
    // Check for preview area with chat bubble
    const previewBubble = componentBuilder.locator('dry-chat-bubble');
    await expect(previewBubble).toBeVisible();
  });

  test('should update when properties change in component builder', async ({ page }) => {
    // Find component builder
    const componentBuilder = page.locator('#chat-bubble-component-builder');
    await expect(componentBuilder).toBeVisible();
    
    // Find the type select dropdown
    const typeSelect = componentBuilder.locator('select[data-property="type"]');
    
    if (await typeSelect.count() > 0) {
      // Get initial value
      const initialValue = await typeSelect.inputValue();
      
      // Change to different type
      const newValue = initialValue === 'sent' ? 'received' : 'sent';
      await typeSelect.selectOption(newValue);
      
      // Wait for re-render
      await page.waitForTimeout(500);
      
      // Verify the preview updated
      const previewBubble = componentBuilder.locator('dry-chat-bubble');
      const typeAttr = await previewBubble.getAttribute('type');
      expect(typeAttr).toBe(newValue);
    }
  });

  test('should handle group-start attribute correctly', async ({ page }) => {
    // Find messages with group-start
    const groupStartMessages = page.locator('dry-chat-bubble[group-start]');
    const count = await groupStartMessages.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify the first group-start message is visible
    const firstGroupStart = groupStartMessages.first();
    await expect(firstGroupStart).toBeVisible();
  });

  test('should handle group-end attribute correctly', async ({ page }) => {
    // Find messages with group-end
    const groupEndMessages = page.locator('dry-chat-bubble[group-end]');
    const count = await groupEndMessages.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify the first group-end message is visible
    const firstGroupEnd = groupEndMessages.first();
    await expect(firstGroupEnd).toBeVisible();
  });

  test('should apply correct styling to sent messages', async ({ page }) => {
    const sentMessage = page.locator('dry-chat-bubble[type="sent"]').first();
    await expect(sentMessage).toBeVisible();
    
    // Check for blue background (typical for sent messages)
    const bubble = sentMessage.locator('div.bg-blue-600');
    await expect(bubble).toBeVisible();
  });

  test('should apply correct styling to received messages', async ({ page }) => {
    const receivedMessage = page.locator('dry-chat-bubble[type="received"]').first();
    await expect(receivedMessage).toBeVisible();
    
    // Check for gray background (typical for received messages)
    const bubble = receivedMessage.locator('div.bg-gray-200');
    await expect(bubble).toBeVisible();
  });

  test('should handle messages without avatars gracefully', async ({ page }) => {
    // Create a test message without avatar programmatically
    await page.evaluate(() => {
      const bubble = document.createElement('dry-chat-bubble');
      bubble.setAttribute('type', 'received');
      bubble.setAttribute('name', 'Test User');
      bubble.setAttribute('group-start', '');
      bubble.setAttribute('group-end', '');
      bubble.textContent = 'Test message without avatar';
      document.body.appendChild(bubble);
    });
    
    await page.waitForTimeout(500);
    
    // Find the newly created message
    const testMessage = page.locator('dry-chat-bubble').filter({ hasText: 'Test message without avatar' });
    await expect(testMessage).toBeVisible();
    
    // Should have a fallback avatar (colored circle with initial)
    const fallbackAvatar = testMessage.locator('div.rounded-full.bg-gray-400');
    await expect(fallbackAvatar).toBeVisible();
  });

  test('should programmatically update message type', async ({ page }) => {
    // Test the public API
    await page.evaluate(() => {
      const bubble = document.createElement('dry-chat-bubble');
      bubble.setAttribute('type', 'sent');
      bubble.textContent = 'API test message';
      bubble.id = 'api-test-bubble';
      document.body.appendChild(bubble);
    });
    
    await page.waitForTimeout(500);
    
    // Verify initial state
    let testBubble = page.locator('#api-test-bubble');
    await expect(testBubble).toBeVisible();
    let typeAttr = await testBubble.getAttribute('type');
    expect(typeAttr).toBe('sent');
    
    // Change type using API
    await page.evaluate(() => {
      const bubble = document.getElementById('api-test-bubble');
      bubble.setType('received');
    });
    
    await page.waitForTimeout(300);
    
    // Verify it changed
    typeAttr = await testBubble.getAttribute('type');
    expect(typeAttr).toBe('received');
  });

  test('should programmatically update message content', async ({ page }) => {
    // Test the setContent API
    await page.evaluate(() => {
      const bubble = document.createElement('dry-chat-bubble');
      bubble.setAttribute('type', 'sent');
      bubble.textContent = 'Original content';
      bubble.id = 'content-test-bubble';
      document.body.appendChild(bubble);
    });
    
    await page.waitForTimeout(500);
    
    // Update content using API
    await page.evaluate(() => {
      const bubble = document.getElementById('content-test-bubble');
      bubble.setContent('Updated content');
    });
    
    await page.waitForTimeout(300);
    
    // Verify content changed
    const testBubble = page.locator('#content-test-bubble');
    const content = await testBubble.textContent();
    expect(content).toContain('Updated content');
  });

  test('should format timestamps correctly', async ({ page }) => {
    // Test with a recent timestamp
    const recentTimestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
    
    await page.evaluate((timestamp) => {
      const bubble = document.createElement('dry-chat-bubble');
      bubble.setAttribute('type', 'sent');
      bubble.setAttribute('timestamp', timestamp);
      bubble.setAttribute('group-end', '');
      bubble.textContent = 'Recent message';
      bubble.id = 'timestamp-test-bubble';
      document.body.appendChild(bubble);
    }, recentTimestamp);
    
    await page.waitForTimeout(500);
    
    const testBubble = page.locator('#timestamp-test-bubble');
    const content = await testBubble.textContent();
    
    // Should show relative time like "5m ago"
    expect(content).toMatch(/\d+m\s+ago|Just now/i);
  });
});

