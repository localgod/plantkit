# PlantKit

[![🔨CI](https://github.com/localgod/plantkit/actions/workflows/ci.yml/badge.svg)](https://github.com/localgod/plantkit/actions/workflows/ci.yml) ![NPM Downloads](https://img.shields.io/npm/d18m/plantkit) ![NPM License](https://img.shields.io/npm/l/plantkit)

PlantKit is a comprehensive TypeScript library for generating [PlantUML](https://plantuml.com/) [ArchiMate](https://publications.opengroup.org/standards/archimate/specifications/c226) diagrams programmatically. It provides a complete toolkit for modeling enterprise architecture with full ArchiMate 3.x compliance and sophisticated diagram generation capabilities.

## Key Features

* **🏗️ Complete ArchiMate 3.x Support**: All 65+ element types and 77+ relationship variants across all layers
* **🌳 Dual Modeling Architecture**: Hierarchical element trees for visual organization + semantic relationship graphs
* **🎨 Advanced Diagram Generation**: Automatic sprite management, legends, scaling, and layout control
* **🔧 Enterprise-Ready**: Property management, validation, type safety, and production-quality PlantUML output
* **📝 TypeScript Native**: Full type safety with comprehensive type definitions
* **🚀 Developer Friendly**: Intuitive API with utility functions and debugging support

## Architecture Overview

PlantKit uses a dual modeling approach that separates visual presentation from semantic relationships:

### Core Components

* **`Element`** - Hierarchical tree structures for visual grouping and nesting
* **`ElementGraph`** - Semantic relationships between elements (composition, flow, etc.)
* **`Diagram`** - PlantUML generation with sprites, legends, and formatting
* **`PlantKit`** - Conversion utilities and output generation
* **`ArchimateElement`** - Type-safe ArchiMate element creation
* **`ArchimateRelation`** - Type-safe ArchiMate relationship creation

## ArchiMate Support

### Element Types (65+ supported)

PlantKit supports all ArchiMate 3.x element types across all layers:

* **Strategy Layer**: Resource, Capability, Course of Action, Value Stream
* **Business Layer**: Actor, Role, Collaboration, Interface, Process, Function, Interaction, Event, Service, Object, Contract, Representation, Product, Location
* **Application Layer**: Component, Collaboration, Interface, Function, Interaction, Process, Event, Service, Data Object
* **Technology Layer**: Node, Device, System Software, Collaboration, Interface, Path, Communication Network, Function, Process, Interaction, Event, Service, Artifact
* **Physical Layer**: Equipment, Facility, Distribution Network, Material
* **Motivation Layer**: Stakeholder, Driver, Assessment, Goal, Principle, Requirement, Constraint, Meaning, Value
* **Implementation Layer**: Work Package, Deliverable, Event, Plateau, Gap
* **Other Elements**: Location, Junction (Or/And), Grouping, Group

### Relationship Types (77+ supported)

Complete support for all ArchiMate relationships with directional variants:

* **Structural**: Composition, Aggregation, Assignment, Specialization
* **Dependency**: Serving, Association, Flow, Realization, Triggering
* **Dynamic**: Access (read/write/read-write variants), Influence
* **Directional Variants**: Up, Down, Left, Right for all relationship types

## Installation

```bash
npm install plantkit
```

## Quick Start

```typescript
import { Element, ElementGraph, Diagram, PlantKit, ArchimateElement, ArchimateRelation } from 'plantkit';

// Create elements with properties
const customer = new Element('Customer', { 
  type: 'Business_Actor', 
  label: 'Customer' 
});

const orderProcess = new Element('Order Process', { 
  type: 'Business_Process', 
  label: 'Order Processing' 
});

// Create element graph for relationships
const graph = new ElementGraph();
graph.addNode(customer);
graph.addNode(orderProcess);
graph.addRelation(customer, orderProcess, 'Rel_Triggering', { label: 'initiates' });

// Generate PlantUML diagram
const diagram = new Diagram('business-model', 'Business Model');
const plantkit = new PlantKit();

// Add elements to diagram
diagram.addToBody(plantkit.toArchimate(customer));
diagram.addToBody(plantkit.toArchimate(orderProcess));
diagram.addToBody(plantkit.toArchimateRelations(graph));

// Output PlantUML
console.log(diagram.output());
```

## Core Concepts

### Element Trees vs. Relationship Graphs

PlantKit uses a **dual modeling approach**:

1. **Element Trees** (`Element` class): Hierarchical structures for visual organization and nesting in diagrams
2. **Relationship Graphs** (`ElementGraph` class): Semantic relationships between elements (composition, flow, etc.)

This separation allows you to:

* Organize elements visually (e.g., group related components)
* Define semantic relationships independently (e.g., data flows, dependencies)
* Generate clean, readable diagrams with proper ArchiMate semantics

### Properties and Metadata

Elements and relationships support arbitrary properties:

```typescript
const element = new Element('Database', {
  type: 'Technology_Node',
  label: 'Customer Database',
  technology: 'PostgreSQL',
  version: '14.0'
});

graph.addRelation(app, database, 'Rel_Access_rw', {
  label: 'reads/writes',
  protocol: 'JDBC'
});
```

## API Reference

### Element Class

```typescript
// Create hierarchical element structures
const parent = new Element('System', { type: 'Application_Component' });
const child = new Element('Module', { type: 'Application_Component' });
parent.addChild(child);

// Navigate and query
parent.getChildren();           // Get all children
parent.findElement('Module');   // Find by name recursively
parent.removeChild('Module');   // Remove child by name
```

### ElementGraph Class

```typescript
// Manage semantic relationships
const graph = new ElementGraph();
graph.addNode(elementA);
graph.addNode(elementB);
graph.addRelation(elementA, elementB, 'Rel_Flow', { label: 'data' });

// Query relationships
graph.getOutgoingRelations(elementA);  // Get outgoing relations
graph.getIncomingRelations(elementB);  // Get incoming relations
graph.getConnectedNodes(elementA);     // Get all connected nodes
```

### Diagram Class

```typescript
// Configure diagram output
const diagram = new Diagram('my-diagram', 'My Architecture');
diagram.setScale(1.5);
diagram.setLayout('top to bottom direction');
diagram.addInclude('archimate-theme.puml');

// Auto-generate sprites
diagram.autosprite('Business_Actor');
diagram.autosprite('Rel_Flow');

// Generate output with legends
const plantuml = diagram.output();
```

### PlantKit Utilities

```typescript
const plantkit = new PlantKit();

// Convert elements to ArchiMate syntax
plantkit.toArchimate(element);              // Element tree to PlantUML
plantkit.toArchimateRelations(graph);      // Relations to PlantUML
PlantKit.toValidElementName('My Element'); // Generate valid IDs

// Debug output
plantkit.printNode(element);               // Print element tree
plantkit.printArchimate(element);          // Print ArchiMate syntax
```

## Advanced Features

### Automatic Sprite Management

```typescript
// Automatically generates sprites and legends
diagram.autosprite('Business_Process');
diagram.autosprite('Rel_Realization');

// Results in:
// sprite $Business_Process_Sprite jar:archimate/business-process
// legend with sprite documentation
```

### Type-Safe ArchiMate Generation

```typescript
// Type-safe element creation
const element = ArchimateElement(
  ArchimateElement.type.Business_Actor, 
  'CUST_001', 
  'Customer'
);

// Type-safe relationship creation
const relation = ArchimateRelation(
  ArchimateRelation.type.Rel_Flow_Down,
  'SRC_001',
  'TGT_001',
  'data flow'
);
```

### Validation and Error Handling

```typescript
// ElementGraph validates relationships
try {
  graph.addRelation(nodeA, nodeB, 'Rel_Flow');
} catch (error) {
  // Throws if nodes aren't in the graph
  console.error('Both nodes must be added to graph first');
}
```

## Examples

Comprehensive example files demonstrate real-world usage:

* **[sample01.mts](./examples/sample01.mts)** - Complete business capability model with multiple layers and relationships
* **[sample02.mts](./examples/sample02.mts)** - CSV data import and process modeling example

You will need to run the `support.sh` script to have the relevant tools ready to check the output.

### Running Examples

```bash
# Build the library
npm run build

# Examples use the published API
# Refer to examples for implementation patterns
```

## Use Cases

PlantKit is ideal for:

* **Enterprise Architecture Documentation** - Model business, application, and technology layers
* **System Integration Planning** - Visualize data flows and dependencies  
* **Business Process Modeling** - Document workflows and stakeholder interactions
* **Technology Roadmaps** - Plan implementation phases and deliverables
* **Automated Documentation** - Generate diagrams from data sources (databases, APIs, etc.)

## Output Quality

PlantKit generates production-ready PlantUML with:

* ✅ **Proper ArchiMate Syntax** - Compliant with ArchiMate 3.x specifications
* ✅ **Clean Formatting** - Readable, well-structured PlantUML code
* ✅ **Sprite Integration** - Automatic icon management and legends
* ✅ **Scalable Output** - Configurable sizing and layout options
* ✅ **Include Support** - Integration with external PlantUML themes and libraries

## TypeScript Support

Full TypeScript support with:

* Complete type definitions for all classes and functions
* IntelliSense support in modern IDEs
* Compile-time validation of ArchiMate element and relationship types
* Generic type support for properties and metadata

## Contributing

We welcome contributions to PlantKit! Here's how you can help:

* **Report Issues** - [Create an issue](https://github.com/localgod/plantkit/issues) for bugs or feature requests
* **Submit PRs** - Contribute code improvements, tests, or documentation
* **Share Examples** - Show us how you're using PlantKit in your projects
* **Improve Documentation** - Help make the library more accessible

### Development Setup

```bash
git clone https://github.com/localgod/plantkit.git
cd plantkit
npm install
npm run build
npm test
```

## License

PlantKit is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.

---

Made with ❤️ for the Enterprise Architecture community
