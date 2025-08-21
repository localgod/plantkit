import { writeFileSync } from 'fs';
import { Element, ArchimateElement, ArchimateRelation, ElementGraph, PlantKit, Diagram } from 'plantkit';
interface Capability {
  name: string;
  description: string;
  parent?: string;
}

interface Application {
  name: string;
  description: string;
  capability: string;
}

interface Integration {
  name: string;
  source: string;
  target: string;
  description: string;
}

// Define some capabilities
const capabilities: Capability[] = [
  { name: 'Business', description: 'Business-focused capability' },
  { name: 'Marketing', description: 'Marketing-focused capability', parent: 'Business' },
  { name: 'Sales', description: 'Sales-focused capability', parent: 'Business' },
  { name: 'Technology', description: 'Technology-focused capability' },
  { name: 'Software', description: 'Software-focused capability', parent: 'Technology' },
  { name: 'Mobile', description: 'Mobile-focused capability', parent: 'Software' },
  { name: 'Web', description: 'Web-focused capability', parent: 'Software' },
  { name: 'Infrastructure', description: 'Infrastructure-focused capability', parent: 'Technology' },
  { name: 'Data', description: 'Data-focused capability' },
  { name: 'Analytics', description: 'Analytics-focused capability', parent: 'Data' },
  { name: 'Reporting', description: 'Reporting-focused capability', parent: 'Data' },
  { name: 'Security', description: 'Security-focused capability' },
  { name: 'Compliance', description: 'Compliance-focused capability', parent: 'Security' },
  { name: 'Risk', description: 'Risk-focused capability', parent: 'Security' },
  { name: 'Audit', description: 'Audit-focused capability', parent: 'Security' },
  { name: 'Finance', description: 'Finance-focused capability' },
  { name: 'Accounting', description: 'Accounting-focused capability', parent: 'Finance' },
  { name: 'Tax', description: 'Tax-focused capability', parent: 'Finance' },
];

// Define some applications
const applications: Application[] = [
  { name: 'Customer Portal', description: 'Web-based customer portal', capability: 'Digital' },
  { name: 'Order Management', description: 'Order management system', capability: 'Operations' },
  { name: 'Inventory Management', description: 'Inventory management system', capability: 'Operations' },
  { name: 'Supply Chain Management', description: 'Supply chain management system', capability: 'Operations' },
  { name: 'E-commerce Platform', description: 'E-commerce platform', capability: 'Digital' },
  { name: 'Mobile App', description: 'Mobile app for customers', capability: 'Digital' },
  { name: 'Web API', description: 'Web API for integrations', capability: 'Digital' },
  { name: 'Data Warehouse', description: 'Data warehouse for analytics', capability: 'Data' },
  { name: 'Business Intelligence', description: 'Business intelligence platform', capability: 'Data' },
  { name: 'Reporting Tool', description: 'Reporting tool for business users', capability: 'Data' },
  { name: 'Security Monitoring', description: 'Security monitoring system', capability: 'Security' },
  { name: 'Compliance Management', description: 'Compliance management system', capability: 'Security' },
  { name: 'Risk Management', description: 'Risk management system', capability: 'Security' },
  { name: 'Audit Management', description: 'Audit management system', capability: 'Security' },
  { name: 'Financial Planning', description: 'Financial planning system', capability: 'Finance' },
  { name: 'Accounting System', description: 'Accounting system', capability: 'Finance' },
  { name: 'Tax Management', description: 'Tax management system', capability: 'Finance' },
];

// Define some integrations
const integrations: Integration[] = [
  { name: 'Customer Portal to Order Management', source: 'Customer Portal', target: 'Order Management', description: 'Integrate customer portal with order management system to enable seamless order placement and tracking' },
  { name: 'Inventory Management to Supply Chain Management', source: 'Inventory Management', target: 'Supply Chain Management', description: 'Integrate inventory management system with supply chain management system to optimize inventory levels and reduce stockouts' },
  { name: 'E-commerce Platform to Web API', source: 'E-commerce Platform', target: 'Web API', description: 'Integrate e-commerce platform with web API to enable real-time product information and pricing updates' },
  { name: 'Data Warehouse to Business Intelligence', source: 'Data Warehouse', target: 'Business Intelligence', description: 'Integrate data warehouse with business intelligence platform to enable data-driven decision making' },
  { name: 'Security Monitoring to Compliance Management', source: 'Security Monitoring', target: 'Compliance Management', description: 'Integrate security monitoring system with compliance management system to ensure regulatory compliance and reduce risk' },
  { name: 'Financial Planning to Accounting System', source: 'Financial Planning', target: 'Accounting System', description: 'Integrate financial planning system with accounting system to enable accurate financial reporting and forecasting' },
  { name: 'Tax Management to Financial Planning', source: 'Tax Management', target: 'Financial Planning', description: 'Integrate tax management system with financial planning system to optimize tax strategy and reduce tax liability' },
  { name: 'Customer Portal to Mobile App', source: 'Customer Portal', target: 'Mobile App', description: 'Integrate customer portal with mobile app to enable mobile access to customer information and services' },
  { name: 'Order Management to Inventory Management', source: 'Order Management', target: 'Inventory Management', description: 'Integrate order management system with inventory management system to enable real-time inventory updates and reduce stockouts' }
];

// Create the root element
const root: Element = new Element('Root', { type: ArchimateElement.type.Grouping, label: 'Top-level' });
// Create the element graph
const graph: ElementGraph = new ElementGraph();
graph.addNode(root);

// Add capabilities to the model
capabilities.forEach(capability => {
  const element = new Element(capability.name, { type: ArchimateElement.type.Strategy_Capability, label: capability.description });
  graph.addNode(element);
  if (capability.parent) {
    const parentElement = root.findElement(capability.parent);
    if (parentElement) {
      parentElement.addChild(element);
    }
  } else {
    root.addChild(element);
  }
});

// Add applications to the model
applications.forEach(application => {
  const element = new Element(application.name, { type: ArchimateElement.type.Application_Component, label: application.description });
  graph.addNode(element);
  const cap = root.findElement(application.capability)
  if (cap) {
    cap.addChild(element)
  }
});

// Add integrations to the element graph
integrations.forEach(integration => {
  const source = root.findElement(integration.source)
  const target = root.findElement(integration.target)
  if (source && target) {
    graph.addRelation(source, target, ArchimateRelation.type.Rel_Flow, { label: integration.name });
  }
});

// Create the diagram
const diagram = new Diagram('Test Diagram', 'Test Title');
diagram.addInclude('./Archimate.puml');
diagram.autosprite(ArchimateElement.type.Strategy_Capability)
diagram.autosprite(ArchimateElement.type.Application_Component)
diagram.autosprite(ArchimateRelation.type.Rel_Flow)

// Add elements and relations to the diagram
const plantkit = new PlantKit();
diagram.addToBody(plantkit.toArchimate(root))
diagram.addToBody(plantkit.toArchimateRelations(graph))


// Output the diagram
writeFileSync('diagram.puml', diagram.output());
console.log('Diagram written to diagram.puml');
