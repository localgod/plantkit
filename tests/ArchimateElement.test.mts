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

  it('supports the Motivation Outcome concept', () => {
    const result = ArchimateElement(ArchimateElement.type.Motivation_Outcome, 'OUT_001', 'Reduced delivery time');
    expect(result).toBe('Motivation_Outcome("OUT_001", "Reduced delivery time")');
  });

  it('should handle labels with special characters', () => {
    const result = ArchimateElement(ArchimateElement.type.Business_Process, 'BP_001', 'Order & Payment Process');
    expect(result).toBe('Business_Process("BP_001", "Order & Payment Process")');
  });

  it('escapes PlantUML string arguments', () => {
    const result = ArchimateElement(
      ArchimateElement.type.Business_Process,
      'BP_"001',
      'Order "payment"\\review\nprocess',
    );

    expect(result).toBe('Business_Process("BP_\\"001", "Order \\"payment\\"\\\\review\\nprocess")');
  });
});
