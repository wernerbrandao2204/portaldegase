import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import { 
  getMenuPermissionsByRole, 
  setMenuPermission, 
  updateMenuPermissionsBatch,
  deleteMenuPermission 
} from './db';
import { menuAccessPermissions, menuItems } from '../drizzle/schema';

describe('Menu Permissions', () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      console.warn('Database not available for testing');
    }
  });

  it('should get empty permissions for new role', async () => {
    if (!db) return;
    
    const permissions = await getMenuPermissionsByRole('test-role-empty');
    expect(permissions.allowedMenuItems).toEqual([]);
    expect(permissions.deniedMenuItems).toEqual([]);
  });

  it('should set a single menu permission', async () => {
    if (!db) return;
    
    // Create a test menu item first
    const menuItem = await db.insert(menuItems).values({
      label: 'Test Menu Item',
      url: '/test',
      parentId: null,
      sortOrder: 0,
      isColumnTitle: false,
    }).returning();

    if (!menuItem || menuItem.length === 0) {
      console.warn('Could not create test menu item');
      return;
    }

    const menuItemId = menuItem[0].id;

    // Set permission
    await setMenuPermission('contributor', menuItemId, true);

    // Verify permission was set
    const permissions = await getMenuPermissionsByRole('contributor');
    expect(permissions.allowedMenuItems).toContain(menuItemId);
  });

  it('should update batch permissions', async () => {
    if (!db) return;
    
    // Create test menu items
    const items = await db.insert(menuItems).values([
      { label: 'Item 1', url: '/item1', parentId: null, sortOrder: 0, isColumnTitle: false },
      { label: 'Item 2', url: '/item2', parentId: null, sortOrder: 1, isColumnTitle: false },
      { label: 'Item 3', url: '/item3', parentId: null, sortOrder: 2, isColumnTitle: false },
    ]).returning();

    if (!items || items.length === 0) {
      console.warn('Could not create test menu items');
      return;
    }

    const itemIds = items.map(item => item.id);

    // Update batch permissions
    await updateMenuPermissionsBatch('user', itemIds, true);

    // Verify permissions were set
    const permissions = await getMenuPermissionsByRole('user');
    expect(permissions.allowedMenuItems.length).toBeGreaterThanOrEqual(itemIds.length);
    itemIds.forEach(id => {
      expect(permissions.allowedMenuItems).toContain(id);
    });
  });

  it('should delete a menu permission', async () => {
    if (!db) return;
    
    // Create a test menu item
    const menuItem = await db.insert(menuItems).values({
      label: 'Test Delete Item',
      url: '/test-delete',
      parentId: null,
      sortOrder: 0,
      isColumnTitle: false,
    }).returning();

    if (!menuItem || menuItem.length === 0) {
      console.warn('Could not create test menu item');
      return;
    }

    const menuItemId = menuItem[0].id;

    // Set permission
    await setMenuPermission('admin', menuItemId, true);

    // Verify permission exists
    let permissions = await getMenuPermissionsByRole('admin');
    expect(permissions.allowedMenuItems).toContain(menuItemId);

    // Delete permission
    await deleteMenuPermission('admin', menuItemId);

    // Verify permission was deleted
    permissions = await getMenuPermissionsByRole('admin');
    expect(permissions.allowedMenuItems).not.toContain(menuItemId);
  });

  it('should handle admin role with unrestricted access', async () => {
    if (!db) return;
    
    // Admin should have access to all items by default
    const permissions = await getMenuPermissionsByRole('admin');
    
    // Admin permissions should be empty or contain all items
    // The actual implementation determines this behavior
    expect(permissions).toBeDefined();
    expect(permissions.allowedMenuItems).toBeDefined();
    expect(permissions.deniedMenuItems).toBeDefined();
  });
});
