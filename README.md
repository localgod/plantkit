# PlantKit

PlantKit is a libary that provides tools for generating [PlantUML](https://plantuml.com/) diagrams via an API. The initial focus of the project is on generating [ArchiMate](https://publications.opengroup.org/standards/archimate/specifications/c226) diagrams, but the goal is to support more diagram types in the future.

## Capabilities

PlantKit provides the following capabilities:

* **Model Management**: Create, read, update, and delete models, including nodes, relationships, and properties.
* **Diagram Generation**: Generate PlantUML diagrams via an API, with initial support for ArchiMate diagrams.

## ArchiMate Support

PlantKit currently supports the following ArchiMate diagram types:

* **Business Layer**
* **Application Layer**
* **Technology Layer**
* **Strategy Layer**  
* **Physical Layer**
* **Motivation Layer**
* **Implementation Layer**
* **Other_Location Layer**

and the following relationship types:

* **Composition**
* **Aggregation**
* **Assignment**
* **Specialization**
* **Serving**
* **Association**
* **Flow**
* **Realization**
* **Triggering**
* **Access**
* **Influence**

## Getting Started

To get started with PlantKit, follow these steps:

1. Install `plantkit` node module using `npm`
2. Import `plantkit` into your project.
3. Create a new model using the `Element` class.
4. Create a new relationship graph using the `ElementGraph` class.
5. Use the `PlantKit` class to generate a diagram with data from the model and relationship graph.

The 'Element' model supports a three like hirarchy, which can be used to generate a diagram with nested elements. This is purly for visual presentation purposes. Herarchies like composition and aggregation are managed by the `ElementGraph` class.

## Sample

Sample files ([sample.mts](./src/samples/sample01.mts) and [sample2.mts](./src/samples/sample02.mts)) has been included in the repository. These files can be used as a starting point for creating a diagram.

## Contributing

We welcome contributions to PlantKit! Please create a issue or pull request if you have any suggestions or find any bugs.:

* [Contributing](https://github.com/localgod/plantkit/issues)

## License

PlantKit is licensed under the MIT License. Please see our license file for more information:

* [License](LICENSE.md)
