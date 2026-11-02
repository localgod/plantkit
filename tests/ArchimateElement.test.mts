import { describe, expect, it } from 'vite-plus/test';
import { ArchimateElement, canContainElements } from '../src/archimate/ArchimateElement.mjs';

describe('ArchimateElement', () => {
  it('should generate correct PlantUML element syntax', () => {
    const result = ArchimateElement(ArchimateElement.type.Business_Actor, 'BA_001', 'Customer');
    expect(result).toBe('Business_Actor("BA_001", "Customer")');
  });

  it('should handle different element types', () => {
    const result = ArchimateElement(
      ArchimateElement.type.Application_Component,
      'APP_001',
      'Web Application',
    );
    expect(result).toBe('Application_Component("APP_001", "Web Application")');
  });

  it('supports the Motivation Outcome concept', () => {
    const result = ArchimateElement(
      ArchimateElement.type.Motivation_Outcome,
      'OUT_001',
      'Reduced delivery time',
    );
    expect(result).toBe('Motivation_Outcome("OUT_001", "Reduced delivery time")');
  });

  it('should handle labels with special characters', () => {
    const result = ArchimateElement(
      ArchimateElement.type.Business_Process,
      'BP_001',
      'Order & Payment Process',
    );
    expect(result).toBe('Business_Process("BP_001", "Order & Payment Process")');
  });

  it('escapes PlantUML string arguments', () => {
    const result = ArchimateElement(
      ArchimateElement.type.Business_Process,
      'BP_"001',
      'Order "payment"\\review\nprocess',
    );

    expect(result).toBe(
      'Business_Process("BP_<U+0022>001", "Order <U+0022>payment<U+0022>\\\\review\\nprocess")',
    );
  });

  it('passes $nest = 1 when the element opens a block', () => {
    expect(ArchimateElement(ArchimateElement.type.Business_Actor, 'A', 'Actor', true)).toBe(
      'Business_Actor("A", "Actor", 1)',
    );
    expect(ArchimateElement(ArchimateElement.type.Business_Actor, 'A', 'Actor', false)).toBe(
      'Business_Actor("A", "Actor")',
    );
  });

  it('omits $nest for procedures without that parameter', () => {
    for (const type of [
      ArchimateElement.type.Grouping,
      ArchimateElement.type.Group,
      ArchimateElement.type.Junction_Or,
      ArchimateElement.type.Junction_And,
    ]) {
      expect(ArchimateElement(type, 'A', 'L', true)).toBe(`${type}("A", "L")`);
    }
  });

  it('knows which types can contain elements', () => {
    expect(canContainElements(ArchimateElement.type.Grouping)).toBe(true);
    expect(canContainElements(ArchimateElement.type.Business_Actor)).toBe(true);
    expect(canContainElements(ArchimateElement.type.Junction_Or)).toBe(false);
    expect(canContainElements(ArchimateElement.type.Junction_And)).toBe(false);
  });
});
