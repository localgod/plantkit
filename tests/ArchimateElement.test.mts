import { describe, expect, it } from 'vitest';
import { ArchimateElement } from '../src/archimate/ArchimateElement.mjs';

describe('ArchimateElement', () => {
  it('should generate correct PlantUML element syntax', () => {
    const result = ArchimateElement(ArchimateElement.type.Business_Actor, 'BA_001', 'Customer');
    expect(result).toBe('Business_Actor("BA_001", "Customer")');
  });

  it('should handle different element types', () => {
    const result = ArchimateElement(ArchimateElement.type.Application_Component, 'APP_001', 'Web Application');
    expect(result).toBe('Application_Component("APP_001", "Web Application")');
  });

  it('should handle labels with special characters', () => {
    const result = ArchimateElement(ArchimateElement.type.Business_Process, 'BP_001', 'Order & Payment Process');
    expect(result).toBe('Business_Process("BP_001", "Order & Payment Process")');
  });
});
